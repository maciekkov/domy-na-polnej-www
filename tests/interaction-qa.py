"""Interaction regression against the built production UI. See browser-qa.py for
this environment's explicit virtual-origin limitation; no production data is changed."""
from pathlib import Path
import importlib.util,json,traceback
from playwright.sync_api import sync_playwright,expect
spec=importlib.util.spec_from_file_location('render',Path(__file__).with_name('browser-qa.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
RESULT=[]
def check(name,fn):
 try:fn();RESULT.append({'name':name,'passed':True});print('PASS',name,flush=True)
 except Exception as e:RESULT.append({'name':name,'passed':False,'error':str(e)});print('FAIL',name,str(e)[:500],flush=True)

def main():
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
  h=m.Harness(b,1440,1000);h.load();h.dismiss();pg=h.page;pg.set_default_timeout(5000)
  def no_optional():
   assert not pg.locator('.consent-banner').count()
   assert not any('/api/analytics' in x for x in h.requests)
   assert not any('panorama-360-grabik' in x for x in h.requests)
   assert not any('spacer-360-wewnetrzny.json' in x for x in h.requests)
   assert not any('/fonts/' in x or '.woff' in x for x in h.requests)
  check('Necessary consent closes banner; no tracking, full panorama, scene graph or fonts on first screen',no_optional)
  def hero():
   pg.get_by_role('button',name='Następny widok inwestycji').click();expect(pg.locator('.hero__image-caption')).to_contain_text('02 / 04');pg.wait_for_timeout(300)
   assert pg.locator('.hero img').evaluate('(e)=>e.complete && e.naturalWidth>0')
   pg.wait_for_timeout(1100);expect(pg.locator('.hero__image-caption')).to_contain_text('02 / 04')
   pg.get_by_role('button',name='Poprzedni widok inwestycji').click()
  check('Hero manual next/previous, responsive asset and no autonomous change',hero)
  def choose():
   h.section('domy');pg.locator('.homes-table button',has_text='Dom B').click();expect(pg.locator('.house-card h3')).to_have_text('Dom B')
   expect(pg.locator('.house-card__price strong')).to_contain_text('789 000')
   assert 'dom=B' in pg.evaluate('globalThis.__testedURL')
   expect(pg.locator('.plot-label[aria-pressed="true"]')).to_have_count(1)
   pg.locator('.house-card__price-history summary').click();expect(pg.locator('.house-card__price-history')).to_contain_text('Brak wcześniejszych')
   pg.get_by_role('button',name='Zapytaj o dom B',exact=True).click();expect(pg.locator('.contact-form select')).to_have_value('B');expect(pg.locator('#contact-name')).to_be_focused()
  check('House B synchronizes plan/table/card/URL/form and focuses contact',choose)
  def form():
   pg.locator('.contact-form [type=submit]').click();expect(pg.locator('#contact-name')).to_have_attribute('aria-invalid','true');expect(pg.locator('#contact-name')).to_be_focused()
   pg.locator('#contact-name').fill('Test QA');pg.locator('#contact-phone').fill('600123456');pg.locator('#contact-consentContact').check();pg.locator('#contact-consentPrivacy').check()
   pg.locator('.contact-form [type=submit]').click();expect(pg.locator('.contact-form')).to_contain_text('Tryb podglądu')
   assert not any('/api/analytics' in x for x in h.requests)
  check('Form invalid/valid states; local preview never pretends to send mail',form)
  def gallery():
   h.section('galeria');first=pg.locator('.gallery-tile').first;first.click();expect(pg.locator('.gallery-lightbox')).to_be_visible()
   expect(pg.get_by_role('button',name='Zamknij',exact=True)).to_be_focused()
   before=pg.locator('.gallery-lightbox__caption').inner_text();pg.keyboard.press('ArrowRight');assert pg.locator('.gallery-lightbox__caption').inner_text()!=before
   assert pg.locator('.gallery-lightbox').evaluate('(e)=>e.contains(document.activeElement)')
   pg.keyboard.press('Shift+Tab');expect(pg.get_by_role('button',name='Następne zdjęcie')).to_be_focused()
   pg.keyboard.press('Tab');expect(pg.get_by_role('button',name='Zamknij',exact=True)).to_be_focused()
   h.image('1440-gallery-dialog.png');pg.keyboard.press('Escape');expect(pg.locator('.gallery-lightbox')).to_have_count(0);expect(first).to_be_focused()
   assert not pg.locator('#domy').evaluate("(e)=>!!e.closest('[inert]')");assert not pg.locator('body').evaluate("e=>e.classList.contains('modal-open')")
  check('Gallery arrows, focus trap, Escape, return focus, inert cleanup',gallery)
  def tabs():
   pg.locator('.gallery-tabs [role=tab]').first.focus();pg.keyboard.press('ArrowRight');expect(pg.locator('.gallery-tabs [role=tab]').nth(1)).to_have_attribute('aria-selected','true')
   expect(pg.locator('.gallery-tile')).not_to_have_count(0)
   h.section('uklad');pg.locator('.plan-modes [role=tab]').nth(1).click();expect(pg.locator('.plan-modes [role=tab]').nth(1)).to_have_attribute('aria-selected','true')
  check('Gallery keyboard tabs and floor-plan mode switch',tabs)
  def faq():
   h.section('faq');btn=pg.locator('.faq-item button').first;btn.click();expect(btn).to_have_attribute('aria-expanded','true');btn.click();expect(btn).to_have_attribute('aria-expanded','false')
  check('FAQ explicit expanded/collapsed states',faq)
  def panorama():
   h.section('spacer-360');pg.get_by_role('button',name='Otwórz panoramę').click()
   supported=pg.evaluate('!!document.createElement("canvas").getContext("webgl")')
   if supported:
    expect(pg.locator('.panorama-modal canvas')).to_be_visible();expect(pg.locator('.panorama-modal__loading')).to_have_count(0,timeout=15000);assert not pg.locator('.panorama-modal__error').count()
    pg.get_by_role('button',name='Obróć w prawo').click();pg.get_by_role('button',name='Przybliż',exact=True).click()
   else:
    expect(pg.locator('.panorama-modal__error a')).to_have_attribute('href',__import__('re').compile('panorama-360-grabik'))
    (m.OUT/'webgl-limitation.json').write_text(json.dumps({'WebGLContextAvailable':False,'GPUProjectionTested':False,'fallbackAndCloseTested':True,'note':'Renderer cannot be certified in this Chromium environment; original photo fallback is available.'},indent=2))
   pg.wait_for_timeout(200);h.image('1440-panorama.png')
   pg.keyboard.press('Escape');expect(pg.locator('.panorama-modal')).to_have_count(0);assert not pg.locator('#domy').evaluate("(e)=>!!e.closest('[inert]')");assert not pg.locator('body').evaluate("e=>e.classList.contains('modal-open')")
  check('Panorama supported-renderer path or explicit unavailable-WebGL fallback; close',panorama)
  def tours():
   h.section('spacer-360');pg.locator('#choose-tour').click();expect(pg.locator('.tour-choice-modal')).to_be_visible();expect(pg.locator('.tour-choice-modal')).to_contain_text('30 kadrów')
   pg.get_by_role('button',name='Zamknij wybór spaceru').focus();pg.keyboard.press('Shift+Tab');assert pg.locator('.tour-choice-option').last.evaluate('(e)=>e===document.activeElement')
   pg.locator('.tour-choice-option--interior').click();expect(pg.locator('.tour-frame-modal')).to_be_visible();assert not h.errors,h.errors
   # Managed browser policy prevents iframe navigation here; test loading/cancel,
   # and the unchanged standalone player separately, without spoofing readiness.
   pg.get_by_role('button',name='Zamknij ładowanie spaceru').click();expect(pg.locator('.tour-frame-modal')).to_have_count(0);assert not pg.locator('#domy').evaluate("(e)=>!!e.closest('[inert]')");assert not pg.locator('body').evaluate("e=>e.classList.contains('modal-open')")
  check('Tour choice focus trap; real React iframe mount and cancel loading',tours)
  check('No runtime JS errors on desktop interactions',lambda: (_ for _ in ()).throw(AssertionError(h.errors)) if h.errors else None)
  h.page.close()
  h=m.Harness(b,390,844);h.load();h.dismiss();pg=h.page;pg.set_default_timeout(5000)
  def mobile():
   h.section('domy');pg.locator('.homes-mobile-list button').filter(has_text='Dom E').click();expect(pg.locator('.house-sheet')).to_be_visible();expect(pg.locator('.house-sheet')).to_contain_text('819 000');expect(pg.locator('.house-sheet')).to_contain_text('1006 m²')
   pg.wait_for_timeout(300);h.image('390-house-sheet.png');assert pg.evaluate('document.documentElement.scrollWidth<=innerWidth');assert pg.locator('.house-sheet').evaluate('(e)=>e.parentElement===document.body && e.getBoundingClientRect().height===innerHeight');assert pg.evaluate("!!document.elementFromPoint(15,innerHeight-5)?.closest('.house-sheet')")
   pg.get_by_role('button',name='Zapytaj o dom E',exact=True).click();expect(pg.locator('.house-sheet')).to_have_count(0);expect(pg.locator('.contact-form select')).to_have_value('E');expect(pg.locator('#contact-name')).to_be_focused()
   expect(pg.locator('.mobile-contact-bar')).not_to_be_visible()
  check('Mobile E bottom sheet, factual price/plot, CTA closes and selects E',mobile)
  def menu():
   pg.evaluate("()=>scrollTo(0,0)");pg.wait_for_timeout(600);btn=pg.locator('header button[aria-expanded]');btn.click();expect(btn).to_have_attribute('aria-expanded','true');pg.keyboard.press('Escape');expect(btn).to_have_attribute('aria-expanded','false');expect(btn).to_be_focused()
  check('Mobile navigation toggles and Escape restores focus',menu)
  check('No mobile runtime errors',lambda: (_ for _ in ()).throw(AssertionError(h.errors)) if h.errors else None)
  pg.close()
  h=m.Harness(b,390,844,reduced=True);h.load();h.dismiss();pg=h.page
  def reduced():
   assert pg.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
   assert pg.evaluate("getComputedStyle(document.documentElement).scrollBehavior")=='auto'
   pg.get_by_role('link',name='Wybierz dom i sprawdź cenę').click();expect(pg.locator('#homes-title')).to_be_focused()
  check('Reduced-motion preference and accessible anchor focus',reduced);pg.close()
  b.close()
 (m.OUT/'interaction-results.json').write_text(json.dumps(RESULT,ensure_ascii=False,indent=2));print(sum(x['passed'] for x in RESULT),'/',len(RESULT),'passed')
if __name__=='__main__':main()
