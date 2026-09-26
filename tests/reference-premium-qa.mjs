import { chromium, expect } from '@playwright/test'
import { startServer } from './browser-utils.mjs'
import { mkdirSync, writeFileSync } from 'node:fs'
const server = await startServer('preview-server.mjs', 4187)
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] })
const report = { viewports: [], interactions: [], errors: [] }
const out='docs/reference-audit';mkdirSync(out,{recursive:true})
try {
 for (const width of [320,390,768,1024,1440]) {
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'})
  page.on('pageerror',e=>report.errors.push(e.message))
  await page.goto(server.url,{waitUntil:'networkidle'})
  await page.getByRole('button',{name:'Tylko niezbędne',exact:true}).click()
  await page.evaluate(()=>document.fonts.ready)
  await expect(page.locator('.plot-label[aria-pressed="true"]')).toHaveCount(0)
  await expect(page.locator('.hero__image-caption,.hero__discover')).toHaveCount(0)
  await expect(page.locator('.comparison-promise,.homes__showcase > .house-card')).toHaveCount(0)
  const mapGeometry=await page.locator('.masterplan').evaluate(el=>{
    const b=el.getBoundingClientRect(),i=el.querySelector('img').getBoundingClientRect(),s=el.querySelector('svg').getBoundingClientRect()
    return {width:b.width,screen:document.body.clientWidth,ratio:b.width/b.height,image:i.height,svg:s.height,height:b.height}
  })
  expect(Math.abs(mapGeometry.width-mapGeometry.screen)).toBeLessThan(1)
  expect(Math.abs(mapGeometry.ratio-1672/941)).toBeLessThan(.002)
  expect(Math.abs(mapGeometry.image-mapGeometry.svg)).toBeLessThan(1)

  await page.locator('#layout-plan-panel').scrollIntoViewIfNeeded()
  const geometry=await page.locator('#layout-plan-panel').evaluate(el=>{
    const box=el.getBoundingClientRect(),img=el.querySelector('img').getBoundingClientRect(),svg=el.querySelector('svg').getBoundingClientRect()
    return {ratio:box.width/box.height,imageHeight:img.height,svgHeight:svg.height,height:box.height}
  })
  expect(Math.abs(geometry.ratio-1195/896)).toBeLessThan(.003)
  expect(Math.abs(geometry.imageHeight-geometry.height)).toBeLessThan(1)
  expect(Math.abs(geometry.svgHeight-geometry.height)).toBeLessThan(1)
  await page.locator('.room-selector select').selectOption('kitchen')
  await expect(page.locator('.room-panel h3')).toContainText('Kuchnia')
  const kitchen=page.locator('#layout-plan-panel path[aria-label^="Kuchnia"]')
  await expect(kitchen).toHaveAttribute('aria-pressed','true')
  expect(await kitchen.evaluate(el=>getComputedStyle(el).stroke)).toBe('rgb(201, 243, 126)')
  if(width===1440 || width===390) await page.locator('#layout-plan-panel').screenshot({path:`docs/reference-audit/plan-laser-${width}.png`})
  await page.locator('#layout-tab-furniture').click()
  await expect(page.locator('#layout-plan-panel > svg')).toHaveCount(0)
  await page.locator('#layout-tab-layout').click()

  await page.locator('.homes-table tbody button').filter({hasText:'Dom C'}).click()
  await expect(page.locator('select[name="house"]')).toHaveValue('C')
  if(width<=960){await expect(page.locator('.house-sheet')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('.house-sheet')).toHaveCount(0)}
  else await expect(page.locator('.comparison-aside .house-card h3')).toContainText('Dom C')
  await page.getByRole('tab',{name:'Wnętrza',exact:true}).click()
  await expect(page.locator('#gallery-panel .gallery-tile')).toHaveCount(3)
  await page.locator('#gallery-panel .gallery-tile').first().click()
  await expect(page.locator('.gallery-lightbox')).toBeVisible()
  await page.keyboard.press('ArrowRight');await page.keyboard.press('Escape')
  await expect(page.locator('.gallery-lightbox')).toHaveCount(0)
  const faq=page.locator('.faq-item button').first();await faq.click();await expect(faq).toHaveAttribute('aria-expanded','true');await faq.click()
  const standard=page.locator('.standard-accordion button').first();await standard.click();await expect(standard).toHaveAttribute('aria-expanded','true');await standard.click()
  await page.locator('.contact-form button[type=submit]').click();await expect(page.locator('#contact-name')).toHaveAttribute('aria-invalid','true')
  await page.locator('#contact-name').fill('Test wizualny');await page.locator('#contact-phone').fill('600000000')
  await page.locator('#contact-consentContact').check();await page.locator('#contact-consentPrivacy').check()
  await page.route('**/api/contact.php',r=>r.fulfill({status:503,json:{ok:false,message:'Test błędu połączenia'}}))
  await page.locator('.contact-form button[type=submit]').click();await expect(page.locator('.contact-form__status')).toContainText('Test błędu');await expect(page.locator('#contact-name')).toHaveValue('Test wizualny')
  await page.locator('.presale-form button[type=submit]').click();await expect(page.locator('#presale-email')).toHaveAttribute('aria-invalid','true')
  await page.locator('#layout-tab-layout').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#layout-tab-zones')).toHaveAttribute('aria-selected','true')
  if(width===1440 || width===390){
   await page.locator('#choose-tour').click();await expect(page.locator('.tour-choice-modal')).toBeVisible();await page.locator('.tour-choice-option--interior').click()
   const frame=page.frameLocator('.tour-frame-modal iframe');await expect(frame.locator('#tourApp')).toHaveAttribute('data-scene','int01-wejscie-do-domu')
   if(await frame.locator('#tourDisclaimer').isVisible())await frame.locator('#tourDisclaimerAccept').click()
   await frame.locator('#closeTour').click();await expect(page.locator('.tour-frame-modal')).toHaveCount(0)
  }
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
  const tileOverlap=await page.locator('.gallery-benefits').evaluate(e=>e.getBoundingClientRect().top < document.querySelector('#gallery-panel').getBoundingClientRect().bottom)
  expect(tileOverlap).toBe(false)
  report.viewports.push({width,overflow,passed:true});await page.close()
 }
 report.interactions=['Dom C: plan/lista → karta i formularz','Galeria: zakładki, lightbox, klawiatura','FAQ i standard: rozwijanie','Formularz: walidacja i zachowanie danych po błędzie','Przedsprzedaż: walidacja e-mail','Układ: obsługa zakładek klawiaturą','Spacer wnętrza: uruchomienie i zamknięcie, 390 i 1440 px']
 expect(report.errors).toEqual([])
} finally {writeFileSync(out+'/interaction-report.json',JSON.stringify(report,null,2));await browser.close();server.child.kill()}
console.log(JSON.stringify(report,null,2))
