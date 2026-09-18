/** Actual React/Vite production E2E. Run only after npm run build. */
import { expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { browser, startServer, noOverflow } from './browser-utils.mjs'
const server=await startServer('preview-server.mjs',4183), chrome=await browser()
try {
  const noJs=await chrome.newContext({javaScriptEnabled:false})
  for(const id of ['a','b','c','d','e']) {
    const page=await noJs.newPage(),response=await page.goto(`${server.url}/dom-${id}/`)
    if(response.status()!==200)throw Error('Offer HTTP status')
    await expect(page.locator('h1')).toContainText('Dom '+id.toUpperCase())
    await expect(page.locator('.offer-price strong')).toBeVisible()
    await expect(page.locator('a.offer-pdf').first()).toHaveAttribute('href',/\.pdf/)
    await page.close()
  }
  await noJs.close()
  const context=await chrome.newContext({viewport:{width:1440,height:1000}})
  await context.addInitScript(()=>localStorage.setItem('dnp-analytics-consent-v1','accepted'))
  const page=await context.newPage(),errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  await page.goto(server.url+'/',{waitUntil:'networkidle'})
  await page.locator('.plot-label').filter({hasText:'B'}).click()
  await page.locator('.house-card').scrollIntoViewIfNeeded()
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dnp-analytics-events-v2')||'[]').filter(e=>e.eventName==='house_card_open'&&e.houseCode==='B').length)).toBe(1)
  const popup=page.waitForEvent('popup');await page.locator('.house-card__pdf').click();await(await popup).close()
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dnp-analytics-events-v2')||'[]').filter(e=>e.eventName==='house_pdf_download'&&e.houseCode==='B').length)).toBe(1)
  const form=page.locator('.contact-form')
  await form.getByRole('button',{name:'Poproś o kontakt'}).click()
  await expect(form.locator('#contact-name')).toBeFocused()
  await expect(form.locator('#contact-name')).toHaveAttribute('aria-invalid','true')
  for(const width of [360,390,768,1440]){
    await page.setViewportSize({width,height:900});await noOverflow(page)
    const sizes=await form.locator('input:not([type=checkbox]),select,textarea').evaluateAll(nodes=>nodes.filter(e=>!e.closest('.contact-form__honeypot')).map(e=>parseFloat(getComputedStyle(e).fontSize)))
    if(sizes.some(n=>n<16))throw Error('Form input font too small')
  }
  await page.goto(server.url+'/dom-a/',{waitUntil:'networkidle'})
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://domynapolnej.pl/dom-a/')
  const updated=JSON.parse(readFileSync('public/data/site-data.json','utf8'))
  updated.revision++;updated.houses[0].status='Sprzedany';updated.houses[0].price=700001
  await page.route('**/data/site-data.json',route=>route.fulfill({json:updated}))
  await page.reload({waitUntil:'networkidle'})
  await expect(page.locator('.offer-price')).toContainText('700 001 zł')
  await expect(page.locator('.offer-status')).toHaveText('Sprzedany')
  await expect(page.locator('.offer-summary .offer-button')).toHaveAttribute('href','/#kontakt')
  for(const width of [360,768,1440]){await page.setViewportSize({width,height:900});await noOverflow(page)}
  await page.unroute('**/data/site-data.json')
  await page.goto(server.url+'/dom-z/');await expect(page.locator('h1')).toContainText(/404|znalez/i)
  if(errors.length)throw Error(errors.join('\n'))
  console.log('PASS actual offer/form React E2E: static HTML, live price/status, consent events, PDF, field errors, responsive layout')
} finally { await chrome.close();server.child.kill('SIGTERM') }
