"""Adapted local edge-case QA only. Start node preview-server.mjs first.
No live-site access. Admin response test intentionally excludes CSP enforcement
because set_content has an opaque origin; use normal-origin staging for CSP.
"""
from pathlib import Path
import importlib.util,json,time
from playwright.sync_api import sync_playwright,expect
import argparse, os
R=Path(__file__).resolve().parents[1]
a=argparse.ArgumentParser();a.add_argument('--output',default=str(R/'docs/audit-2026-09-23/edge-results'));args=a.parse_args()
O=Path(args.output);O.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('h',R/'tests/browser-qa.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
results=[]
def check(n,f):
 try:f();results.append({'name':n,'passed':True});print('PASS',n,flush=True)
 except Exception as e:results.append({'name':n,'passed':False,'error':str(e)});print('FAIL',n,str(e)[:450],flush=True)
def jsonroute(pg,data):pg.route('**/data/site-data.json',lambda r:r.fulfill(json=data,headers={'Access-Control-Allow-Origin':'*'}))
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None),headless=True,args=['--no-sandbox'])
 for case in ['selling','stale','leak','broken']:
  def run(case=case):
   h=m.Harness(b,1440,900,reduced=True);pg=h.page;pg.set_default_timeout(4000)
   d=json.loads((R/'tests/fixtures/selling-baseline.json').read_text());d['revision']=100
   if case=='selling':
    d['houses'][0]['price']=700001;d['houses'][0]['priceHistory']=[{'price':790001,'validFrom':'2026-09-01','validTo':'2026-09-22'}];d['houses'][0]['mandatoryPayments']=[{'name':'Udział w drodze','amount':10000}]
   elif case=='stale':d['revision']=1
   elif case=='leak':d['salesStage']='prelaunch'
   else:d={'houses':[]}
   jsonroute(pg,d);h.load();h.dismiss();pg.locator('.homes-table button',has_text='Dom A').click()
   if case=='selling':
    expect(pg.locator('.house-card__price')).to_contain_text('700 001 zł');expect(pg.locator('.hero__facts')).to_contain_text('700 001 zł');expect(pg.locator('.house-card__mandatory')).to_contain_text('10 000 zł');pg.locator('.house-card__price-history summary').click();expect(pg.locator('.house-card__price-history')).to_contain_text('790 001 zł');assert '700001' in pg.locator('#site-schema').text_content();expect(pg.locator('header .site-header__nav')).to_contain_text('Domy i ceny')
   else:
    expect(pg.locator('.site-data-warning')).to_be_visible();expect(pg.locator('.house-card__price')).to_contain_text('Już wkrótce');assert '779000' not in pg.locator('#site-schema').text_content()
   assert not h.errors,h.errors;pg.close()
  check('runtime data '+case,run)
 # Isolated client-side admin: scripted API response payloads, no PHP authentication claim.
 ctx=b.new_context();pg=ctx.new_page();pg.set_default_timeout(4000)
 pg.route('http://dnp.test/administrator-control/control.js',lambda r:r.fulfill(body=(R/'public/administrator-control/control.js').read_text(),content_type='text/javascript',headers={'Access-Control-Allow-Origin':'*'}))
 def api(route):
  payload={'ok':True,'uniqueVisitors':'<img src=x onerror="globalThis.xss=true">','uniqueVisits':1,'returningVisitors':0,'engagedDurationMs':120000,'devices':{'<script>globalThis.xss=true</script>':5}}
  route.fulfill(json=payload,headers={'Access-Control-Allow-Origin':'*'})
 pg.route('http://dnp.test/api/analytics-summary.php',api)
 html=(R/'public/administrator-control/index.html').read_text().replace('src="./control.js"','src="http://dnp.test/administrator-control/control.js"')
 # CSP self cannot resolve to a local origin under set_content; test DOM rendering separately,
 # preserving production CSP for the normal-origin staging gate.
 import re
 html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html).replace('<head>','<head><base href="http://dnp.test/">')
 pg.set_content(html,wait_until='networkidle')
 def admin_safe():
  pg.locator('#key').fill('qa-temporary-key-01234567890123456789');pg.locator('#analytics').click();expect(pg.locator('#analyticsMsg')).to_have_text('Dane z serwera pobrane.')
  assert pg.locator('#summary img').count()==0;assert pg.locator('#devices script').count()==0;assert not pg.evaluate('globalThis.xss===true');expect(pg.locator('#summary')).to_contain_text('<img')
  pg.locator('#clearKey').click();expect(pg.locator('#key')).to_have_value('');expect(pg.locator('#summary')).to_be_empty();expect(pg.locator('#analyticsRaw')).to_be_hidden()
 check('admin API strings render as inert text; clearing removes credential/results',admin_safe)
 pg.close();ctx.close();b.close()
(O/'results.json').write_text(json.dumps({'mode':'adapted-local-origin; admin DOM test intentionally excludes origin/CSP enforcement','results':results},ensure_ascii=False,indent=2));raise SystemExit(any(not r['passed'] for r in results))
