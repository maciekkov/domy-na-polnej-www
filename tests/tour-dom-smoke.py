"""Component smoke test with the real standalone HTML/CSS/player in Chromium.
Uses an about:blank DOM and local resource fixtures; no top-level navigation or
cross-tour navigation is validated. Not a React/Vite build or end-to-end test.
"""
from pathlib import Path
from urllib.parse import urlparse, unquote
import json,re,mimetypes,os
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];PUBLIC=ROOT/'public';OUT=ROOT/'docs/cleanup-six'
config={mode:json.loads((PUBLIC/f'assets/data/spacer-360-{stem}.json').read_text()) for mode,stem in [('interior','wewnetrzny'),('exterior','zewnetrzny')]}
result={'scope':'Chromium DOM component smoke; local resources, no real top-level/cross-tour navigation','sceneStates':0,'internalClicks':0,'checks':0,'pageErrors':[]}
def check(ok,label):
 result['checks']+=1
 if not ok:raise AssertionError(label)
def setup(page,mode):
 def serve(route):
  file=(PUBLIC/unquote(urlparse(route.request.url).path).lstrip('/')).resolve()
  if not file.is_relative_to(PUBLIC) or not file.is_file():route.fulfill(status=404,body='missing fixture');return
  mime='text/javascript' if file.suffix=='.js' else mimetypes.guess_type(str(file))[0] or 'application/octet-stream'
  route.fulfill(body=file.read_bytes(),content_type=mime,headers={'Access-Control-Allow-Origin':'*'})
 page.route('http://dnp.fixture/**',serve)
 page.on('pageerror',lambda e:result['pageErrors'].append(str(e)))
 stem='wewnatrz' if mode=='interior' else 'zewnatrz'
 html=(PUBLIC/f'tour/spacer-360-{stem}.html').read_text().replace('<head>','<head><base href="http://dnp.fixture/">')
 html=re.sub(r'<script type="module" src="[^\"]+"></script>','',html)
 page.set_content(html,wait_until='load')
 # A public test hook for the exact production player, not a replacement implementation.
 page.add_script_tag(content=(PUBLIC/'tour/spacer-360-player.js').read_text()+'\nwindow.__componentTest={showScene,positionHotspots,validateConfig};')
 page.wait_for_selector('#tourApp[data-scene]')
 if page.locator('#tourDisclaimer').is_visible():page.locator('#tourDisclaimerAccept').click()
def show(page,sid):
 page.evaluate('(id)=>window.__componentTest.showScene(id)',sid)
 page.wait_for_function('(id)=>document.querySelector("#tourApp").dataset.scene===id&&document.querySelector("#tourApp").getAttribute("aria-busy")==="false"',arg=sid)
 page.wait_for_timeout(10)
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
  for mode in config:
   page=browser.new_page(viewport={'width':1440,'height':900},reduced_motion='reduce');setup(page,mode)
   for width,height in [(1440,900),(390,844)]:
    page.set_viewport_size({'width':width,'height':height})
    for s in config[mode]['scenes']:
     show(page,s['id'])
     info=page.evaluate('''()=>{const i=document.querySelector('.tour-image-layer.is-active');return {src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0,title:document.querySelector('#sceneText').textContent,pins:document.querySelectorAll('.tour-hotspot').length,thumbs:document.querySelectorAll('.tour-thumb').length,error:!document.querySelector('#tourError').hidden}}''')
     check(info['loaded'] and info['src']==s['image'],f'{s["id"]}: versioned image {width}')
     check(info['title']==s['title'] and info['pins']==len(s['hotspots']) and info['thumbs']==3 and not info['error'],f'{s["id"]}: title and controls {width}')
     result['sceneStates']+=1
   page.set_viewport_size({'width':1440,'height':900})
   for s in config[mode]['scenes']:
    for i,h in enumerate(s['hotspots']):
     if h.get('tour'):continue
     show(page,s['id'])
     page.locator('.tour-hotspot__core').nth(i).click(timeout=3000)
     page.wait_for_function('(id)=>document.querySelector("#tourApp").dataset.scene===id',arg=h['target'])
     check(page.locator('#tourApp').get_attribute('data-scene')==h['target'],f'{s["id"]}: internal mouse click {i}')
     result['internalClicks']+=1
   show(page,config[mode]['startScene'])
   page.screenshot(path=str(OUT/f'{mode}-component-smoke.png'))
   page.close()
  browser.close()
 check(not result['pageErrors'],'No uncaught JavaScript errors')
 result['passed']=True
except Exception as e:
 result['passed']=False;result['failure']=str(e);raise
finally:
 (OUT/'tour-dom-smoke.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps(result,ensure_ascii=False,indent=2))
