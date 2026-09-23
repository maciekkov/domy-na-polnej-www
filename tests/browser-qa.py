"""Actual Chromium DOM/interaction QA. Rendering harness does not change production files.
This environment blocks all top-level URL navigation by Chrome policy. Resources are
served by the project's own Node preview server, through Playwright route fulfillment.
Only location/history are adapted to a virtual test origin inside the bundle.
Use normal browser navigation instead on a workstation without that policy.
"""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
import json, time, re
ROOT=Path(__file__).resolve().parents[1]
ORIGIN='http://dnp.test'
OUT=ROOT/'docs/qa';OUT.mkdir(parents=True,exist_ok=True)
ADAPTER="""
const __testLocation={url:new URL('http://dnp.test/')} ;
const __bound=new Set(['addEventListener','removeEventListener','dispatchEvent','setTimeout','clearTimeout','setInterval','clearInterval','matchMedia','scrollTo','scrollBy','requestAnimationFrame','cancelAnimationFrame']);
const window=new Proxy(globalThis.window,{get(t,p){if(p==='location')return __testLocation.url;if(p==='history')return {replaceState:(a,b,url)=>{__testLocation.url=new URL(url,__testLocation.url);globalThis.__testedURL=__testLocation.url.href;},pushState:(a,b,url)=>{__testLocation.url=new URL(url,__testLocation.url);globalThis.__testedURL=__testLocation.url.href;}};const v=Reflect.get(t,p,t);return __bound.has(p)?v.bind(t):v;}});
"""
class Harness:
 def __init__(self,browser,width=1440,height=1000,reduced=False):
  self.page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1,reduced_motion='reduce' if reduced else 'no-preference')
  self.errors=[];self.console=[];self.missing=[];self.requests=[]
  self.page.on('pageerror',lambda e:self.errors.append(str(e)))
  self.page.on('console',lambda m:self.console.append(m.text) if m.type=='error' else None)
  self.page.route('**/*',self.handle)
 def handle(self,route):
  req=route.request
  if not req.url.startswith(ORIGIN+'/'):
   route.abort();return
  url=req.url.replace(ORIGIN,'http://127.0.0.1:4173',1)
  self.requests.append(req.url)
  try:
   headers={'Content-Type':req.header_value('content-type') or 'application/json'}
   body=(req.post_data or '').encode() if req.method in ('POST','PUT') else None
   try:resp=urlopen(Request(url,data=body,method=req.method,headers=headers))
   except HTTPError as ex:resp=ex
   h=dict(resp.headers);h['Access-Control-Allow-Origin']='*';h['Cache-Control']='public, max-age=600'
   data=resp.read()
   if resp.status>=400:self.missing.append((req.url,resp.status))
   if '/assets/build/site-' in url and urlsplit(url).path.endswith('.js'):
    data=ADAPTER+data.decode()
   route.fulfill(status=resp.status,headers=h,body=data)
  except Exception as e:
   self.missing.append((url,str(e)));route.fulfill(status=500,body=str(e))
 def load(self,path='/'):
  f=ROOT/'dist'/('index.html' if path=='/' else path.strip('/')+'/index.html')
  html=f.read_text().replace('<head>','<head><base href="'+ORIGIN+'/">')
  self.page.set_content(html,wait_until='networkidle');self.page.wait_for_timeout(500)
 def dismiss(self):
  if self.page.locator('.consent-banner').count():self.page.get_by_role('button',name='Tylko niezbędne',exact=True).click()
 def section(self,id):
  self.page.evaluate("id=>document.getElementById(id).scrollIntoView({behavior:'instant',block:'start'})",id)
  self.page.wait_for_timeout(500)
 def image(self,name,full=False):self.page.screenshot(path=str(OUT/name),full_page=full)
 def overflow(self):
  return self.page.evaluate("""()=>[...document.querySelectorAll('body *')].filter(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return r.width && r.height && s.visibility!=='hidden' && !e.closest('[hidden],[inert],[aria-hidden=true]') && (r.right>document.documentElement.clientWidth+1 || r.left<-1) && !['path','svg','g','circle','rect'].includes(e.tagName);}).map(e=>({tag:e.tagName,class:e.className,left:Math.round(e.getBoundingClientRect().left),right:Math.round(e.getBoundingClientRect().right)})).slice(0,40)""")

def main():
 results=[]
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
  for width,height in [(320,740),(390,844),(768,1024),(1024,900),(1440,1000),(1920,1080)]:
   h=Harness(browser,width,height);h.load();h.dismiss();h.page.evaluate("()=>document.documentElement.style.scrollBehavior='auto'")
   h.image(f'{width}-hero.png')
   for sid in ['domy','dom','lokalizacja','uklad','galeria','standard','bezpieczenstwo','harmonogram','dziennik','zespol','faq','kontakt']:
    h.section(sid)
    if width in (390,1440):h.image(f'{width}-{sid}.png')
   overflow=h.overflow()
   results.append({'viewport':[width,height],'errors':h.errors,'consoleErrors':h.console,'missing':h.missing,'overflow':overflow,'documentWidth':h.page.evaluate('document.documentElement.scrollWidth'),'viewportWidth':h.page.evaluate('document.documentElement.clientWidth')})
   h.page.close()
  browser.close()
 (OUT/'responsive-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
 print(json.dumps(results,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
