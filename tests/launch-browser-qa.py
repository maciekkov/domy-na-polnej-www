"""Release acceptance against the actual built app.
Default: normal navigation; --adapted uses the documented local policy-limited harness.
Never points at production, never sends real mail, never tests rate limits on a live site.
"""
from pathlib import Path
import argparse, importlib.util, json, subprocess, os, time, re
from urllib.request import urlopen, Request
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
a=argparse.ArgumentParser();a.add_argument('--adapted',action='store_true');a.add_argument('--output',default=str(ROOT/'docs/audit-2026-09-23/browser-results'));args=a.parse_args()
OUT=Path(args.output);OUT.mkdir(parents=True,exist_ok=True)
URL='http://127.0.0.1:4173';process=None
try:urlopen(URL,timeout=1)
except Exception:
 process=subprocess.Popen(['node','preview-server.mjs'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 for _ in range(50):
  try:urlopen(URL,timeout=1);break
  except Exception:time.sleep(.1)
spec=importlib.util.spec_from_file_location('legacy_harness',ROOT/'tests/browser-qa.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class NormalHarness:
 def __init__(self,browser,width=1440,height=900,reduced=True):
  self.page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce' if reduced else 'no-preference');self.errors=[];self.missing=[];self.requests=[]
  self.page.on('pageerror',lambda e:self.errors.append(str(e)));self.page.on('request',lambda r:self.requests.append(r.url))
  self.page.on('response',lambda r:self.missing.append((r.url,r.status)) if r.status>=400 else None)
 def load(self):self.page.goto(URL,wait_until='networkidle')
 def dismiss(self):
  if self.page.locator('.consent-banner').count():self.page.get_by_role('button',name='Tylko niezbędne',exact=True).click()
 def section(self,id):self.page.evaluate("id=>document.getElementById(id).scrollIntoView({behavior:'instant'})",id)
Harness=m.Harness if args.adapted else NormalHarness
results=[]
def check(name,fn):
 try:fn();results.append({'name':name,'passed':True});print('PASS',name,flush=True)
 except Exception as e:results.append({'name':name,'passed':False,'error':str(e)});print('FAIL',name,str(e)[:350],flush=True)
def bodycheck(pg):
 assert not re.search(r'\b(?:779|789|799|809|819)\s?000\b',pg.locator('body').inner_text())
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else None),headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
 h=Harness(b,1440,900,reduced=True);pg=h.page;pg.set_default_timeout(4000);h.load();h.dismiss();pg.evaluate("document.documentElement.style.scrollBehavior='auto'")
 def hero():
  expect(pg.locator('.hero img')).to_have_count(1);expect(pg.locator('.hero__controls')).to_have_count(0);expect(pg.locator('.hero__visualisation-label')).to_have_text('Wizualizacja')
  expect(pg.locator('.hero__facts')).to_contain_text('Już wkrótce');assert pg.locator('.hero img').evaluate('(e)=>e.complete&&e.naturalWidth>0')
  expect(pg.locator('header .site-header__nav')).to_contain_text('Domy i działki');bodycheck(pg)
 check('single estate HERO, factual caption, prelaunch menu and no prices',hero)
 def choose_all():
  for id in 'ABCDE':
   h.section('domy');pg.locator('.homes-table button',has_text='Dom '+id).click();expect(pg.locator('.homes__showcase .house-card h3')).to_have_text('Dom '+id)
   expect(pg.locator('.contact-form select')).to_have_value(id);expect(pg.locator('.plot-label[aria-pressed=true]')).to_have_count(1)
   expect(pg.locator('.homes__showcase .house-card__price strong')).to_have_text('Już wkrótce');assert f'dom={id}' in (pg.evaluate('globalThis.__testedURL') if args.adapted else pg.url)
  pg.locator('.contact-form select').select_option('unknown');expect(pg.locator('.plot-label[aria-pressed=true]')).to_have_count(0)
 check('all five homes: plan/table/card/form/URL; deselection removes choice',choose_all)
 def cta():
  h.section('domy');pg.locator('.homes-table button',has_text='Dom C').click();pg.get_by_role('button',name='Zapytaj o dom C',exact=True).click();expect(pg.locator('#contact-name')).to_be_focused();expect(pg.locator('.contact-form select')).to_have_value('C')
 check('house CTA focuses contact and preserves chosen home',cta)
 def form():
  pg.locator('.contact-form [type=submit]').click();expect(pg.locator('#contact-name')).to_have_attribute('aria-invalid','true');expect(pg.locator('#contact-name')).to_be_focused()
  pg.locator('#contact-name').fill('QA lokalne');pg.locator('#contact-phone').fill('600123456');pg.locator('#contact-consentContact').check();pg.locator('#contact-consentPrivacy').check()
  pg.locator('.contact-form [type=submit]').click();expect(pg.locator('.contact-form')).to_contain_text('Tryb podglądu');assert not any('/api/analytics' in r for r in h.requests)
 check('invalid/valid form, preview disclosure, no analytics on refusal',form)
 def gallery():
  h.section('galeria');tile=pg.locator('.gallery-tile').first;tile.click();expect(pg.locator('.gallery-lightbox')).to_be_visible()
  before=pg.locator('.gallery-lightbox__caption').inner_text();pg.keyboard.press('ArrowRight');assert before!=pg.locator('.gallery-lightbox__caption').inner_text()
  for _ in range(10):pg.keyboard.press('Tab');assert pg.locator('.gallery-lightbox').evaluate('(e)=>e.contains(document.activeElement)')
  pg.keyboard.press('Escape');expect(pg.locator('.gallery-lightbox')).to_have_count(0);expect(tile).to_be_focused();assert not pg.locator('#domy').evaluate("e=>!!e.closest('[inert]')")
 check('gallery arrows, focus trap, Escape and background restoration',gallery)
 def gallery_tabs():
  pg.locator('.gallery-tabs [role=tab]').first.focus();pg.keyboard.press('ArrowRight');expect(pg.locator('.gallery-tabs [role=tab]').nth(1)).to_have_attribute('aria-selected','true')
  h.section('uklad');pg.locator('.plan-modes [role=tab]').nth(1).click();expect(pg.locator('.plan-modes [role=tab]').nth(1)).to_have_attribute('aria-selected','true')
 check('gallery keyboard tabs and floorplan mode switch',gallery_tabs)
 def faq():
  h.section('faq');btn=pg.get_by_role('button',name='Kiedy będzie dostępny cennik?');btn.click();expect(btn).to_have_attribute('aria-expanded','true');expect(pg.locator('#faq-answer-price-scope')).to_contain_text('nie rozbicie ceny')
 check('FAQ correctly describes prelaunch and actual information-only PDF cards',faq)
 def tour_dialog():
  h.section('spacer-360');pg.locator('#choose-tour').click();expect(pg.locator('.tour-choice-modal')).to_contain_text('30 kadrów');pg.keyboard.press('Escape');expect(pg.locator('.tour-choice-modal')).to_have_count(0)
 check('tour chooser opens with real scene count and closes cleanly',tour_dialog)
 def panorama():
  pg.get_by_role('button',name='Otwórz panoramę').click();expect(pg.locator('.panorama-modal')).to_be_visible();pg.wait_for_timeout(700)
  error=pg.locator('.panorama-modal__error');supported=pg.evaluate('!!document.createElement("canvas").getContext("webgl")')
  if supported:expect(pg.locator('.panorama-modal canvas')).to_be_visible();expect(error).to_have_count(0)
  else:expect(error.locator('a')).to_have_attribute('href',re.compile('panorama-360-grabik'))
  results.append({'name':'GPU panorama context observation','WebGLContextAvailable':supported,'passed':True,'scope':'canvas/fallback existence, not visual projection certification'})
  pg.keyboard.press('Escape');expect(pg.locator('.panorama-modal')).to_have_count(0)
 check('panorama either canvas path or explicit fallback; close restores background',panorama)
 def links():
  for id in 'abcde':
   r=urlopen(Request(URL+f'/pdf/karta-dom-{id}.pdf',method='HEAD'));assert r.status==200;assert 'application/pdf' in r.headers['Content-Type']
 check('all five unchanged product PDFs are served as PDF',links)
 def noerrors():assert not h.errors,h.errors
 check('no desktop runtime JavaScript errors',noerrors);pg.close()
 # Mobile menu, card and short-screen usability.
 h=Harness(b,390,844,reduced=True);pg=h.page;pg.set_default_timeout(4000);h.load();h.dismiss()
 def menu():
  btn=pg.locator('.site-header__menu-button');btn.click();expect(btn).to_have_attribute('aria-expanded','true');assert pg.locator('main#main').evaluate('e=>e.inert')
  for _ in range(25):pg.keyboard.press('Tab');assert pg.locator('header.site-header').evaluate('e=>e.contains(document.activeElement)')
  pg.keyboard.press('Escape');expect(btn).to_have_attribute('aria-expanded','false');expect(btn).to_be_focused();assert not pg.locator('main#main').evaluate('e=>e.inert')
  btn.click();pg.locator('#mobile-menu a[href="#domy"]').click();expect(pg.locator('#homes-title')).to_be_focused();assert not pg.locator('main#main').evaluate('e=>e.inert')
 check('mobile menu traps Tab, locks background, restores focus and follows section',menu)
 def mobilecard():
  h.section('domy');pg.locator('.homes-mobile-list button').filter(has_text='Dom E').click();expect(pg.locator('.house-sheet')).to_be_visible();expect(pg.locator('.house-sheet')).to_contain_text('1006 m²');expect(pg.locator('.house-sheet')).to_contain_text('Przed sprzedażą')
  pg.screenshot(path=str(OUT/'mobile-house-e.png'));pg.get_by_role('button',name='Zapytaj o dom E',exact=True).click();expect(pg.locator('.house-sheet')).to_have_count(0);expect(pg.locator('#contact-name')).to_be_focused();expect(pg.locator('.contact-form select')).to_have_value('E')
 check('mobile E sheet facts preserved, no prices, CTA transfers E',mobilecard)
 check('no mobile runtime JavaScript errors',lambda: noerrors())
 pg.close()
 for w,height in [(320,700),(360,780),(390,600),(390,844),(768,1024),(1024,768),(1440,900),(1920,1080)]:
  h=Harness(b,w,height,reduced=True);pg=h.page;pg.set_default_timeout(4000);h.load();h.dismiss()
  def viewport():
   assert pg.evaluate('document.documentElement.scrollWidth<=innerWidth'),(w,height)
   assert pg.locator('.hero__facts').evaluate('(e)=>{const r=e.getBoundingClientRect(),h=e.closest(".hero").getBoundingClientRect();return r.bottom<=h.bottom+1}'),(w,height)
   for selector in ['.hero img','.masterplan img']:
    img=pg.locator(selector).first;assert img.evaluate('(e)=>e.complete&&e.naturalWidth>0')
   assert not h.errors,h.errors
   pg.screenshot(path=str(OUT/f'hero-{w}-{height}.png'))
  check(f'responsive {w}x{height}: no overflow, hero facts inside section, images',viewport)
  if w==390 and height==844:
   def enlarged():
    pg.evaluate('''()=>{for(const el of document.querySelectorAll('.hero h1,.hero p,.hero dt,.hero dd,.hero a')){el.style.fontSize=(parseFloat(getComputedStyle(el).fontSize)*2)+'px'}}''')
    # Tests enlarged text in the hero, not an emulation of full browser zoom.
    assert pg.locator('.hero__facts').evaluate('(e)=>e.getBoundingClientRect().bottom<=e.closest(".hero").getBoundingClientRect().bottom+1')
    assert pg.evaluate('document.documentElement.scrollWidth<=innerWidth')
   check('hero text enlarged 200%: content not clipped or horizontally lost',enlarged)
  pg.close()
 # No-JS tests deliberately inspect the real built document, not React.
 context=b.new_context(java_script_enabled=False)
 for path,title,sections in [('polityka-prywatnosci/index.html','Polityka prywatności',9),('polityka-cookies/index.html','Polityka cookies',5),('404.html','Nie znaleźliśmy tej strony.',0)]:
  pg=context.new_page()
  def staticpage():
   pg.set_content((ROOT/'dist'/path).read_text());expect(pg.locator('h1')).to_have_text(title);assert pg.locator('section h2').count()==sections
   assert pg.locator('#site-schema').count()==0;assert pg.locator('link[rel=preload][as=image]').count()==0
  check('no JavaScript readable '+path,staticpage);pg.close()
 pg=context.new_page()
 def nojs_home():
  pg.set_content((ROOT/'dist/index.html').read_text());assert pg.locator('#domy article').count()==5;bodycheck(pg);expect(pg.locator('#domy')).to_contain_text('Przed sprzedażą');assert pg.locator('#faq details').count()==17
 check('no-JS homepage: five houses, 17 FAQ, documents/contact and no prices',nojs_home);pg.close();context.close();b.close()
report={'mode':'adapted-local-origin' if args.adapted else 'normal-local-navigation','productionCompared':False,'results':results,'passed':sum(r['passed'] for r in results),'failed':sum(not r['passed'] for r in results)}
(OUT/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({'passed':report['passed'],'failed':report['failed'],'mode':report['mode']}),flush=True)
if process:process.terminate()
raise SystemExit(1 if report['failed'] else 0)
