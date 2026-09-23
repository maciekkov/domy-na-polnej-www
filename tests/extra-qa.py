"""No-JS, local HTTP, legal routes and standalone tour DOM checks.
Virtual-origin adaptation is restricted to testing; production files are not patched."""
import importlib.util,json,gzip,hashlib
from pathlib import Path
from urllib.request import urlopen,Request
from urllib.error import HTTPError
from playwright.sync_api import sync_playwright,expect
spec=importlib.util.spec_from_file_location('h',Path(__file__).with_name('browser-qa.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
R=[]
def check(name,fn):
 try: fn();R.append({'name':name,'passed':True});print('PASS',name,flush=True)
 except Exception as e:R.append({'name':name,'passed':False,'error':str(e)});print('FAIL',name,str(e)[:700],flush=True)
class RouteHarness(m.Harness):
 def __init__(self,browser,path='/',**kw):
  self.path=path;super().__init__(browser,**kw)
 def handle(self,route):
  req=route.request
  if req.url.startswith(m.ORIGIN) and (('/assets/build/site-' in req.url and '.js' in req.url) or '/tour/spacer-360-player.js' in req.url):
   resp=urlopen(req.url.replace(m.ORIGIN,'http://127.0.0.1:4173',1));content=resp.read().decode();header=dict(resp.headers);header.update({'Access-Control-Allow-Origin':'*'})
   adapter=m.ADAPTER.replace("new URL('http://dnp.test/')",f"new URL('http://dnp.test{self.path}')")
   if '/tour/' in req.url:
    adapter+='\nconst location=window.location,history=window.history;\n'
    content=content.replace('const embedded = window.parent !== window','const embedded = false')
   self.requests.append(req.url);route.fulfill(status=200,headers=header,body=adapter+content)
  else:super().handle(route)
 def open(self):
  f=m.ROOT/'dist'/self.path.strip('/')
  if self.path=='/':f=m.ROOT/'dist/index.html'
  elif f.is_dir():f=f/'index.html'
  self.page.set_content(f.read_text().replace('<head>','<head><base href="'+m.ORIGIN+'/">'),wait_until='networkidle');self.page.wait_for_timeout(500)

def main():
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  for path in ['/polityka-prywatnosci/','/polityka-cookies/','/404.html']:
   def legal(path=path):
    h=RouteHarness(b,path);h.open();assert h.page.locator('h1').count()==1;assert not h.errors,h.errors
    h.page.screenshot(path=str(m.OUT/(path.strip('/').replace('/','-')+'.png')));h.page.close()
   check('React route '+path,legal)
  def nojs():
   context=b.new_context(java_script_enabled=False);pg=context.new_page();pg.set_content((m.ROOT/'dist/index.html').read_text());assert pg.locator('#domy article').count()==5
   expect(pg.locator('#domy')).to_contain_text('Już wkrótce');assert '779 000' not in pg.locator('#domy').inner_text();assert pg.locator('#domy a[href*="karta-dom-"]').count()==5;assert pg.locator('#domy a[href^="tel:"]').count()==1;context.close()
  check('No JavaScript: five homes/PDFs/contact available with pricing pending',nojs)
  for stem in ['wewnatrz','zewnatrz']:
   def tour(stem=stem):
    h=RouteHarness(b,'/tour/spacer-360-'+stem+'.html');h.open();pg=h.page
    expect(pg.locator('#tourDisclaimerAccept')).to_be_visible(timeout=10000);pg.locator('#tourDisclaimerAccept').click();expect(pg.locator('#tourApp')).to_have_attribute('aria-busy','false')
    before=pg.locator('#sceneText').inner_text();pg.locator('#nextScene').click();pg.wait_for_timeout(700);assert pg.locator('#sceneText').inner_text()!=before
    assert pg.locator('#tourHotspots button').count()>0
    h.image('1440-tour-'+stem+'.png');assert not h.errors,h.errors;assert not h.missing,h.missing;pg.close()
   check('Standalone player '+stem+': disclaimer, next frame, hotspots, real images',tour)
  # Real resource payload, not a fabricated Web Vitals or Lighthouse measurement.
  h=RouteHarness(b);h.open();h.dismiss();payload=[]
  for u in dict.fromkeys(h.requests):
   rel=u.split(m.ORIGIN,1)[-1].split('?')[0];f=m.ROOT/'dist'/rel.lstrip('/')
   if f.is_file():payload.append({'url':u,'bytes':f.stat().st_size})
  (m.OUT/'initial-requests-desktop.json').write_text(json.dumps(payload,indent=2));h.page.close();b.close()
 def http():
  for path,status,kind in [('/',200,'text/html'),('/polityka-prywatnosci/',200,'text/html'),('/polityka-cookies/',200,'text/html'),('/missing-test-page',404,'text/html'),('/api/config.php',404,'application/json'),('/pdf/karta-dom-a.pdf',200,'application/pdf'),('/data/site-data.json',200,'application/json')]:
   try:r=urlopen(Request('http://127.0.0.1:4173'+path,method='HEAD'))
   except HTTPError as e:r=e
   assert r.status==status,(path,r.status);assert kind in r.headers.get('Content-Type','')
 check('HTTP routing, PDFs, JSON, true 404 and hidden PHP source',http)
 (m.OUT/'extra-results.json').write_text(json.dumps(R,ensure_ascii=False,indent=2));print(sum(x['passed'] for x in R),'/',len(R),'passed')
if __name__=='__main__':main()
