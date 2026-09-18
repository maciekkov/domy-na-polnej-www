"""Run the unchanged native tour player in Chromium over a real loopback HTTP server.
No script injection, React substitutes or policy workarounds. Requires Python
Playwright + Chromium. The React page is separately tested by visual-qa.mjs.
"""
from pathlib import Path
from urllib.parse import urlparse,unquote
import os,json,subprocess,time,socket,urllib.request
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];PUBLIC=ROOT/'public';OUT=ROOT/'docs/cleanup-six'
CONFIG={m:json.loads((PUBLIC/f'assets/data/spacer-360-{f}.json').read_text()) for m,f in [('interior','wewnetrzny'),('exterior','zewnetrzny')]}
STEMS={'interior':'wewnatrz','exterior':'zewnatrz'}
result={'scope':'Real Chromium / native tour HTTP; not the React app','sceneStates':0,'hotspotClicks':0,'checks':0,'errors':[],'warnings':[]}
def check(ok,label):
 result['checks']+=1
 if not ok:raise AssertionError(label)
with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
base=f'http://127.0.0.1:{port}'
server=subprocess.Popen(['node','preview-tour.mjs'],cwd=ROOT,env={**os.environ,'PORT':str(port)},stdout=subprocess.DEVNULL)
def url(mode,sid='',edit=False):return base+f'/tour/spacer-360-{STEMS[mode]}.html'+('?edit=1' if edit else '')+('#'+sid if sid else '')
def ready(page,sid=None):
 page.wait_for_function('(id)=>{const a=document.querySelector("#tourApp");return a?.dataset.scene&&(!id||a.dataset.scene===id)&&a.getAttribute("aria-busy")==="false"}',arg=sid,timeout=15000)
 if page.locator('#tourDisclaimer').is_visible():page.locator('#tourDisclaimerAccept').click()
 page.wait_for_timeout(25)
def scene(page,mode,sid):
 if f'spacer-360-{STEMS[mode]}.html' not in page.url:page.goto(url(mode,sid),wait_until='load')
 else:page.evaluate('(id)=>location.hash=id',sid)
 ready(page,sid)
try:
 for _ in range(80):
  try:urllib.request.urlopen(base+'/').read();break
  except OSError:time.sleep(.1)
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
  context=browser.new_context(viewport={'width':1440,'height':900},reduced_motion='reduce')
  page=context.new_page();page.on('pageerror',lambda e:result['errors'].append(str(e)))
  page.goto(url('interior'),wait_until='load');ready(page,CONFIG['interior']['startScene'])
  check(page.locator('#tourDisclaimer').is_hidden(),'Interior disclaimer dismissed')
  for mode in CONFIG:
   page.goto(url(mode),wait_until='load');ready(page,CONFIG[mode]['startScene'])
   for size in [(1440,900),(390,844)]:
    page.set_viewport_size({'width':size[0],'height':size[1]})
    for s in CONFIG[mode]['scenes']:
     scene(page,mode,s['id'])
     info=page.evaluate('''()=>{const i=document.querySelector('.tour-image-layer.is-active');return {src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0,title:document.querySelector('#sceneText').textContent,pins:document.querySelectorAll('.tour-hotspot').length,thumbs:document.querySelectorAll('.tour-thumb').length,error:!document.querySelector('#tourError').hidden}}''')
     check(info['loaded'] and info['src']==s['image'],f'{mode}/{s["id"]}: correct versioned image {size}')
     check(info['pins']==len(s['hotspots']) and info['thumbs']==3 and info['title']==s['title'],f'{mode}/{s["id"]}: title and controls')
     check(not info['error'],f'{mode}/{s["id"]}: no player error');result['sceneStates']+=1
   page.set_viewport_size({'width':1440,'height':900})
   for s in CONFIG[mode]['scenes']:
    for index,h in enumerate(s['hotspots']):
     scene(page,mode,s['id'])
     pin=page.locator('.tour-hotspot__core').nth(index)
     # This is an actual mouse click; do not force-through overlay elements.
     pin.click(timeout=2500)
     ready(page,h['target'])
     check(page.locator('#tourApp').get_attribute('data-scene')==h['target'],f'{mode}/{s["id"]}: point {index} target')
     result['hotspotClicks']+=1
   print(f'{mode}: all scenes and pointer clicks checked',flush=True)
  # Accepted once per tour mode, including reload and cross-tour navigation.
  for mode in CONFIG:
   page.goto(url(mode));ready(page)
   check(page.locator('#tourDisclaimer').is_hidden(),f'{mode}: disclaimer does not return')
  # Legacy local draft survives; image URL versions upgrade without altering edits.
  draft=json.loads(json.dumps(CONFIG['interior']))
  first=draft['scenes'][0];first['image']=first['image'].split('?')[0]
  first['hotspots'][0]['x']=42.5;first['hotspots'][0]['label']='Zachowaj moje ustawienie'
  page.evaluate('(draft)=>localStorage.setItem("dnp-tour-editor-draft:interior:v5",JSON.stringify(draft))',draft)
  page.goto(url('interior',first['id'],True));ready(page)
  pin=page.locator('.tour-hotspot').first();pin.locator('.tour-hotspot__core').click()
  check(page.locator('[data-editor-field="label"]').input_value()=='Zachowaj moje ustawienie','Draft pin label preserved')
  check(float(page.locator('[data-editor-field="x"]').input_value())==42.5,'Draft coordinate preserved')
  check(page.locator('.tour-image-layer.is-active').get_attribute('src')==CONFIG['interior']['scenes'][0]['image'],'Draft image URL refreshed to current content hash')
  preview=page.locator('[data-editor-target-image]')
  page.wait_for_function('()=>{const img=document.querySelector("[data-editor-target-image]");return img?.complete&&img.naturalWidth>0}')
  check(preview.is_visible(),'Editor target thumbnail actually loaded')
  OUT.mkdir(parents=True,exist_ok=True)
  page.screenshot(path=str(OUT/'editor-cache-check.png'))
  check(not result['errors'],'No uncaught browser JS errors')
  result['passed']=True
  browser.close()
finally:
 server.terminate();server.wait(timeout=5)
 (OUT/'tour-browser-test.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
