"""Real PHP/HTTP/security tests; no production credentials or messages are used.
Run: python3 tests/api-security-qa.py (PHP CLI with sockets required).
"""
import concurrent.futures
import contextlib
import json
import os
from pathlib import Path
import shutil
import socket
import socketserver
import subprocess
import tempfile
import threading
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
RESULTS = []


def check(name, condition):
    RESULTS.append({'name': name, 'passed': bool(condition)})
    if not condition:
        raise AssertionError(name)


def port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]


MAILS = []


class SMTP(socketserver.StreamRequestHandler):
    def handle(self):
        self.connection.settimeout(5)
        self.wfile.write(b'220 localhost test SMTP\r\n')
        auth = 0
        while True:
            line = self.rfile.readline()
            if not line:
                break
            if auth:
                self.wfile.write(b'334 UGFzc3dvcmQ6\r\n' if auth == 1 else b'235 Authenticated\r\n')
                auth = 2 if auth == 1 else 0
            elif line.startswith(b'EHLO'):
                self.wfile.write(b'250-localhost\r\n250 AUTH LOGIN\r\n')
            elif line.startswith(b'AUTH'):
                auth = 1
                self.wfile.write(b'334 VXNlcm5hbWU6\r\n')
            elif line.startswith(b'DATA'):
                self.wfile.write(b'354 Send message\r\n')
                data = []
                while True:
                    item = self.rfile.readline()
                    if item == b'.\r\n' or not item:
                        break
                    data.append(item)
                MAILS.append(b''.join(data).decode('utf-8'))
                self.wfile.write(b'250 Accepted\r\n')
            elif line.startswith(b'QUIT'):
                self.wfile.write(b'221 Bye\r\n')
                break
            else:
                self.wfile.write(b'250 OK\r\n')


def main():
    with tempfile.TemporaryDirectory(prefix='dnp-security-') as temp:
        temp = Path(temp)
        www = temp / 'www'
        www.mkdir()
        shutil.copytree(ROOT / 'api', www / 'api')
        (www / 'data').mkdir()
        shutil.copy2(ROOT / 'public/data/site-data.json', www / 'data/site-data.json')
        # Never copy or use actual deployment credentials.
        (www / 'api/config.php').unlink(missing_ok=True)
        private = temp / 'private'
        private.mkdir()
        http_port, smtp_port = port(), port()
        origin = f'http://127.0.0.1:{http_port}'
        config = www / 'api/config.php'

        def configure(smtp=True):
            text = "<?php return ['recipient'=>'test@example.test','from_email'=>'sender@example.test','from_name'=>'DNP test','security'=>['storage_dir'=>" + repr(str(private)) + ",'allowed_origins'=>[" + repr(origin) + " ]],'admin'=>['control_key'=>'qa-control-key-12345678901234567890'],'gov_sync'=>['mode'=>'disabled','endpoint'=>'','developer'=>['name'=>'X-SMART DEVELOP sp. z o.o.','nip'=>'8943230686'],'investment'=>['name'=>'Domy na Polnej','location'=>'Grabik']]];"
            if smtp:
                text = text[:-2] + ", 'smtp'=>['host'=>'127.0.0.1','port'=>" + str(smtp_port) + ",'encryption'=>'none','username'=>'test','password'=>'test-only']];"
            config.write_text(text)

        def reset_rates():
            for f in private.glob('*-rates.json'):
                f.unlink()

        configure()
        http_log = (temp / 'php.log').open('wb')
        php = subprocess.Popen(['php', '-S', f'127.0.0.1:{http_port}', '-t', str(www)], stdout=http_log, stderr=http_log)
        smtp_server = socketserver.ThreadingTCPServer(('127.0.0.1', smtp_port), SMTP)
        thread = threading.Thread(target=smtp_server.serve_forever, daemon=True)
        thread.start()
        try:
            for _ in range(70):
                try:
                    with socket.create_connection(('127.0.0.1', http_port), .15):
                        break
                except OSError:
                    time.sleep(.04)
            else:
                raise RuntimeError('PHP server did not start')

            def request(endpoint, body=None, method='POST', headers=None):
                payload = json.dumps(body, ensure_ascii=False).encode() if isinstance(body, (dict, list)) else body
                actual = {'Content-Type': 'application/json', 'Origin': origin}
                actual.update(headers or {})
                req = urllib.request.Request(origin + '/api/' + endpoint + '.php', data=payload, method=method, headers=actual)
                try:
                    response = urllib.request.urlopen(req, timeout=8)
                except urllib.error.HTTPError as error:
                    response = error
                with response:
                    return response.status, dict(response.headers), response.read()

            event = {'eventName': 'page_view', 'visitorId': 'test-visitor-123', 'visitId': 'test-visit-123', 'sessionId': 'test-session-123', 'houseCode': 'unknown', 'pagePath': '/dom-a/', 'source': 'qa', 'deviceClass': 'desktop', 'viewportBucket': '1024-1439', 'eventId': 'test-event-123'}
            good = {'name': 'Test żółć', 'phone': '+48 123 456 789', 'email': 'test@example.test', 'message': 'Test wyłącznie lokalny\n.Test kropki', 'house': 'unknown', 'consentContact': True, 'consentPrivacy': True, 'website': ''}
            for endpoint in ['analytics', 'contact']:
                status, headers, _ = request(endpoint, method='GET')
                check(f'{endpoint}: GET returns 405 + Allow', status == 405 and headers.get('Allow') == 'POST')
                check(f'{endpoint}: wrong content type ->415', request(endpoint, b'{}', headers={'Content-Type': 'text/plain'})[0] == 415)
                check(f'{endpoint}: cross-origin ->403', request(endpoint, good, headers={'Origin': 'https://untrusted.test'})[0] == 403)
                check(f'{endpoint}: cross-site ->403', request(endpoint, good, headers={'Sec-Fetch-Site': 'cross-site'})[0] == 403)
                check(f'{endpoint}: large body ->413', request(endpoint, b'x'*40000)[0] == 413)
                check(f'{endpoint}: malformed JSON ->400', request(endpoint, b'{broken')[0] == 400)
                check(f'{endpoint}: array instead of object ->400', request(endpoint, [1,2])[0] == 400)
                check(f'{endpoint}: nested field ->422', request(endpoint, {'x': {'nested': True}})[0] == 422)

            reset_rates()
            check('analytics: invalid event rejected', request('analytics', {**event, 'eventName': 'email_password'})[0] == 422)
            check('analytics: invalid session rejected', request('analytics', {**event, 'sessionId': 'x'})[0] == 422)
            status, headers, _ = request('analytics', {**event, 'name': 'Never log this', 'phone': 'NEVER', 'pagePath': '/?email=private', 'source': '<x<script>'})
            check('analytics: accepted and no-store', status == 200 and headers.get('Cache-Control') == 'no-store')
            record = json.loads(next((private/'analytics').glob('analytics-*.ndjson')).read_text().splitlines()[-1])
            check('analytics: payload whitelist excludes PII', 'name' not in record and 'phone' not in record and 'ip' not in record and record['pagePath'] == '/' and '<' not in record['source'])
            check('analytics: server supplies timestamp', 'createdAt' in record)
            admin_headers={'X-DNP-Admin-Key':'qa-control-key-12345678901234567890'}
            status, _, body = request('analytics-summary', {'rangeDays': 30}, headers=admin_headers)
            summary=json.loads(body)
            check('analytics summary: protected aggregate returns pseudonymous visitor', status==200 and summary.get('uniqueVisitors',0)>=1 and summary.get('uniqueVisits',0)>=1)
            check('analytics summary: wrong admin key rejected', request('analytics-summary', {'rangeDays':30}, headers={'X-DNP-Admin-Key':'wrong-key-wrong-key-wrong-key'})[0]==401)
            status, _, body = request('gov-sync', {'action':'preview'}, headers=admin_headers)
            check('gov sync: prelaunch refuses reporting unpublished prices', status==503 and 'rozpoczęciem' in json.loads(body).get('message',''))
            selling=json.loads((ROOT/'tests/fixtures/selling-baseline.json').read_text())
            (www/'data/site-data.json').write_text(json.dumps(selling))
            status, _, body = request('gov-sync', {'action':'preview'}, headers=admin_headers)
            gov=json.loads(body)
            check('gov sync: preview contains 5 houses and unit price', status==200 and len(gov.get('payload',{}).get('houses',[]))==5 and gov['payload']['houses'][0]['grossPricePerM2Pln']>0)
            check('gov sync: cannot enable without official transport config', request('gov-sync', {'action':'enable'}, headers=admin_headers)[0]==409)
            reset_rates()
            codes = [request('analytics', event)[0] for _ in range(61)]
            check('analytics: 60 events accepted, burst capped', codes[:60] == [200]*60 and codes[-1] == 429)
            status, headers, _ = request('analytics', event, headers={'X-Forwarded-For': '8.8.8.8', 'Cookie': 'PHPSESSID=new-cookie'})
            check('analytics: forged IP and new cookie do not reset limit', status == 429 and int(headers.get('Retry-After', 0)) >= 1)

            reset_rates()
            for field, value in [('phone', 'abc'), ('email', 'bad@@example.test'), ('email', 'x@example.test\r\nBcc: other@example.test'), ('consentContact', 'true'), ('consentPrivacy', False), ('message', 'x'*3001), ('name', 'x')]:
                check(f'contact: invalid {field} rejected: {str(value)[:22]}', request('contact', {**good, field: value})[0] == 422)
            check('contact: no SMTP attempted for invalid data', len(MAILS) == 0)
            check('contact: honeypot silently suppressed', request('contact', {**good, 'website': 'bot.test'})[0] == 200 and len(MAILS) == 0)
            reset_rates()
            status, _, response = request('contact', good)
            check('contact: actual local SMTP delivery accepted', status == 200 and json.loads(response)['ok'] and len(MAILS) == 1)
            check('SMTP: UTF-8 body, reply-to, no implicit House A', 'Test żółć' in MAILS[0] and 'Reply-To: test@example.test' in MAILS[0] and 'Dom: jeszcze nie wybrano' in MAILS[0])
            check('SMTP: dot stuffing applied', '\r\n..Test kropki' in MAILS[0])
            status, headers, _ = request('contact', good, headers={'Cookie': 'PHPSESSID=different', 'X-Forwarded-For': '9.9.9.9'})
            check('contact: cookie-independent cooldown + Retry-After', status == 429 and int(headers.get('Retry-After', 0)) > 0 and len(MAILS) == 1)
            configure(smtp=False)
            reset_rates()
            check('contact: missing SMTP is not fake success', request('contact', good)[0] == 503)
            configure()
            reset_rates()
            for _ in range(20): request('contact', {'name':'x'})
            check('contact: invalid-data ingress flood capped', request('contact', {'name':'x'})[0] == 429)

            # Direct actual PHP tests of deterministic time, trusted proxies, state bounds.
            security = www/'api/lib/security.php'
            def php_eval(code):
                return subprocess.check_output(['php', '-r', f'require {str(security)!r}; '+code], text=True).strip()

            check('proxy: untrusted forwarded header ignored', php_eval("echo dnpClientAddress(['REMOTE_ADDR'=>'127.0.0.1','HTTP_X_FORWARDED_FOR'=>'1.2.3.4']);") == '127.0.0.1')
            check('proxy: explicitly trusted peer resolves client', php_eval("echo dnpClientAddress(['REMOTE_ADDR'=>'127.0.0.1','HTTP_X_FORWARDED_FOR'=>'1.2.3.4'],['127.0.0.1']);") == '1.2.3.4')
            check('proxy: IPv6 privacy addresses grouped by /64', php_eval("echo dnpClientAddress(['REMOTE_ADDR'=>'2001:db8:1:2::42']);") == php_eval("echo dnpClientAddress(['REMOTE_ADDR'=>'2001:db8:1:2::900']);"))
            isolated = temp/'limits'; isolated.mkdir()
            code = f"$d={str(isolated)!r};echo json_encode([dnpLimit($d,'unit','k',[[2,60]],1000),dnpLimit($d,'unit','k',[[2,60]],1000),dnpLimit($d,'unit','k',[[2,60]],1000),dnpLimit($d,'unit','k',[[2,60]],1030)]);"
            check('token bucket: burst limit, exact refill, retry time', json.loads(php_eval(code)) == [0,0,30,0])
            check('rate state contains no raw IP', '127.0.0.1' not in ''.join(f.read_text() for f in private.glob('*-rates.json')))
            # Parallel PHP processes contend on a real shared file lock.
            concurrent_dir = temp/'parallel'; concurrent_dir.mkdir()
            with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
                secrets = list(pool.map(lambda _: php_eval(f"echo dnpSecret({str(concurrent_dir)!r});"), range(20)))
            check('concurrency: first use creates exactly one shared secret', len(set(secrets)) == 1 and len(secrets[0]) == 64)
            def acquire(_):
                return php_eval(f"echo dnpLimit({str(concurrent_dir)!r},'parallel','one',[[5,3600]],1000);")
            with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
                limits = list(pool.map(acquire, range(20)))
            check('concurrency: exactly 5 of 20 simultaneous attempts accepted', limits.count('0') == 5)
            log = next((private/'analytics').glob('analytics-*.ndjson'))
            with log.open('wb') as out: out.truncate(4*1024*1024)
            reset_rates()
            check('analytics: disk quota fails closed', request('analytics', event)[0] == 503)
            check('server: no secrets in client error bodies', 'test-only' not in request('analytics', event)[2].decode())
        finally:
            smtp_server.shutdown(); smtp_server.server_close()
            php.terminate()
            with contextlib.suppress(subprocess.TimeoutExpired): php.wait(timeout=5)
            if php.poll() is None: php.kill()
            http_log.close()
    report = {'passed': len(RESULTS), 'checks': RESULTS, 'smtp': 'local mock server only; no external mail sent', 'server': 'PHP CLI HTTP on loopback, not production hosting'}
    out = ROOT/'docs/audit-2026-09-23/api-security-test.json'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(f'PASS {len(RESULTS)} real PHP/HTTP/SMTP/parallel rate-limit checks')


if __name__ == '__main__':
    main()
