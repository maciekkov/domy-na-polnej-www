"""Optional integration test: real Apache 2.4 and the delivered .htaccess files.
Requires Apache on Linux. Never publishes files or sends contact emails.
"""
import json, pathlib, subprocess, tempfile, shutil, time, socket, urllib.request, urllib.error, os
ROOT=pathlib.Path(__file__).resolve().parents[1]
checks=[]
def check(ok,label):
    checks.append({'check':label,'passed':bool(ok)})
    if not ok: raise AssertionError(label)
with tempfile.TemporaryDirectory(prefix='dnp-apache-') as tmp:
    temp=pathlib.Path(tmp);temp.chmod(0o755)
    web=temp/'www';shutil.copytree(ROOT/'public',web)
    (web/'index.html').write_text('<h1>HTTP integration fixture (not React)</h1>')
    (web/'404.html').write_text('<h1>404</h1>')
    for code in 'abcde': shutil.copytree(ROOT / ('dom-'+code), web / ('dom-'+code))
    (web/'assets/build').mkdir(exist_ok=True)
    shutil.copy(ROOT/'scripts/build-cache.htaccess',web/'assets/build/.htaccess')
    (web/'assets/build/test-12345678.js').write_text('const test="hashed fixture";')
    shutil.copytree(ROOT/'api',web/'api')
    (web/'.secret-test').write_text('secret')
    with socket.socket() as s:s.bind(('127.0.0.1',0));port=s.getsockname()[1]
    config=temp/'httpd.conf';modules=['mpm_event','authz_core','authz_host','mime','dir','headers','rewrite']
    config.write_text(f'''ServerRoot "{tmp}"
Listen 127.0.0.1:{port}
ServerName localhost
PidFile "{tmp}/apache.pid"
ErrorLog "{tmp}/error.log"
LogLevel warn
User www-data
Group www-data
'''+'\n'.join(f'LoadModule {name}_module /usr/lib/apache2/modules/mod_{name}.so' for name in modules)+f'''
TypesConfig /etc/mime.types
DocumentRoot "{web}"
<Directory "{web}">
 AllowOverride All
 Require all granted
</Directory>
''')
    subprocess.run(['/usr/sbin/apache2','-f',str(config),'-t'],check=True)
    child=subprocess.Popen(['/usr/sbin/apache2','-f',str(config),'-DFOREGROUND'],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    def request(path,headers=None):
        try:
            with urllib.request.urlopen(urllib.request.Request(f'http://127.0.0.1:{port}'+path,headers=headers or {}),timeout=5) as r:return r.status,dict(r.headers),r.read()
        except urllib.error.HTTPError as e:return e.code,dict(e.headers),e.read()
    try:
        for _ in range(50):
            try: request('/');break
            except OSError:time.sleep(.1)
        for path in ['/','/data/site-data.json','/assets/data/spacer-360-wewnetrzny.json','/tour/spacer-360-wewnatrz.html']:
            status,headers,body=request(path);check(status==200,f'{path}: HTTP 200');check(headers.get('Cache-Control')=='no-store',f'{path}: no-store')
        for path in ['/assets/images/dnp-masterplan.webp','/tour/spacer-360-player.js','/favicon.svg']:
            status,headers,body=request(path);check(status==200,f'{path}: HTTP 200');check('must-revalidate' in headers.get('Cache-Control','') and 'immutable' not in headers.get('Cache-Control',''),f'{path}: mutable revalidation')
        status,headers,_=request('/assets/build/test-12345678.js');check(status==200 and 'immutable' in headers.get('Cache-Control',''), 'Hashed build asset: one-year immutable')
        path='/assets/images/dnp-masterplan.webp'
        status,headers,_=request(path);etag=headers.get('ETag');check(bool(etag),'Asset returns ETag')
        status,_,_=request(path,{'If-None-Match':etag});check(status==304,'Unchanged asset: conditional request is 304')
        changed=web/path.lstrip('/');changed.write_bytes(changed.read_bytes()+b'changed-cache-fixture')
        status,new_headers,_=request(path,{'If-None-Match':etag});check(status==200 and new_headers.get('ETag')!=etag,'Same filename changed: HTTP 200 and a new ETag')
        for path in ['/administrator','/does-not-exist','/assets/images/location-map.png']:
            status,_,_=request(path);check(status==404,f'{path}: real 404, no SPA fallback')
        for code in 'abcde':
            status,headers,body=request('/dom-'+code+'/');check(status==200 and headers.get('Cache-Control')=='no-store' and ('Dom '+code.upper()).encode() in body, f'Offer {code}: real HTML 200, no-store, correct house')
        for path in ['/.secret-test','/api/config.example.php','/api/data/','/api/lib/security.php','/api/event-names.json']:
            status,_,_=request(path);check(status in [403,404],f'{path}: private resource denied')
        print(json.dumps({'passed':True,'scope':'Apache HTTP/cache/static routing only, not a React build','checks':checks},ensure_ascii=False,indent=2))
    finally:
        child.terminate()
        try:child.wait(timeout=5)
        except subprocess.TimeoutExpired:child.kill()
