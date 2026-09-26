/** Runs against the actual production build. No mocked React or demo-only data. */
import { expect } from '@playwright/test'
import { readFileSync, mkdirSync } from 'node:fs'
import { browser, startServer, noOverflow } from './browser-utils.mjs'
const server=await startServer(), chrome=await browser()
try {
  const context=await chrome.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'})
  await context.addInitScript(()=>localStorage.setItem('dnp-cookie-consent-v2','all'))
  const page=await context.newPage(), errors=[]
  page.on('pageerror',error=>errors.push(error.message))
  await page.goto(server.url+'/',{waitUntil:'networkidle'})
  const form=page.locator('.contact-form'),select=form.locator('select')
  await expect(select).toHaveValue('unknown')
  await expect(page.locator('.plot-label.is-active')).toHaveCount(0)
  await page.locator('.plot-label').filter({hasText:'C'}).click()
  await expect(select).toHaveValue('C');await expect(page).toHaveURL(/dom=C/)
  await select.selectOption('unknown')
  await expect(page.locator('.plot-label.is-active')).toHaveCount(0)
  if(new URL(page.url()).searchParams.has('dom'))throw new Error('Wycofany wybór pozostał w URL')
  await page.locator('#choose-tour').click()
  await page.locator('.tour-choice-option--interior').click()
  const frame=page.frameLocator('.tour-frame-modal iframe')
  await expect(frame.locator('#tourApp')).toHaveAttribute('data-scene','int01-wejscie-do-domu')
  if(await frame.locator('#tourDisclaimer').isVisible())await frame.locator('#tourDisclaimerAccept').click()
  await frame.locator('#closeTour').click()
  const events=await page.evaluate(()=>JSON.parse(localStorage.getItem('dnp-analytics-events-v3')||'[]'))
  if(!events.some(event=>event.eventName==='tour_start'&&event.houseCode==='unknown'))throw new Error('Spacer bez wyboru przypisany do konkretnego domu')
  if(events.some(event=>event.houseCode==='A'))throw new Error('Fikcyjne przypisanie do A')
  await page.goto(server.url+'/?dom=B',{waitUntil:'networkidle'});await expect(select).toHaveValue('B')
  await page.goto(server.url+'/?dom=Z',{waitUntil:'networkidle'});await expect(select).toHaveValue('unknown')
  await form.getByLabel(/^Imię/).fill('Test kontrolny')
  await form.getByLabel(/^Telefon/).fill('600000000')
  for(const checkbox of await form.locator('input[type=checkbox]').all())await checkbox.check()
  const request=page.waitForRequest(request=>request.url().endsWith('/api/contact.php')&&request.method()==='POST')
  await form.getByRole('button',{name:'Poproś o kontakt'}).click()
  if((await request).postDataJSON().house!=='unknown')throw new Error('Formularz wysyła fikcyjny dom')
  await expect(form.locator('[role=status]')).toContainText('Tryb podglądu')

  // The file can change without rebuilding the React application.
  const data=JSON.parse(readFileSync('tests/fixtures/selling-baseline.json','utf8'))
  data.revision=100;data.houses[1].status='Sprzedany';data.houses[1].price=890000
  data.documents.find(document=>document.type==='house_card'&&document.houseId==='B').active=false
  await page.route('**/data/site-data.json',route=>route.fulfill({json:data}))
  await page.evaluate(()=>localStorage.setItem('dnp-published-site-data-v1',JSON.stringify({revision:999,houses:[{id:'B',price:1}]})))
  await page.goto(server.url+'/?dom=B',{waitUntil:'networkidle'})
  await expect(page.locator('.house-card__price')).toContainText('890 000 zł')
  await expect(page.locator('.house-card .status-badge')).toHaveText('Sprzedany')
  await expect(page.locator('.house-card__pdf')).toHaveCount(0)
  await page.unroute('**/data/site-data.json')
  await page.route('**/data/site-data.json',route=>route.fulfill({status:200,json:{houses:[]}}))
  await page.reload({waitUntil:'networkidle'})
  await expect(page.locator('.site-data-warning')).toBeVisible()
  await expect(page.locator('.house-card__price')).toContainText('Już wkrótce')
  await page.unroute('**/data/site-data.json')
  await page.goto(server.url+'/',{waitUntil:'networkidle'})

  await page.locator('.gallery-tabs button').nth(1).click()
  await expect(page.locator('.gallery-tile')).toHaveCount(5)
  for(const path of await page.locator('.interactive-plan svg path').all()){
    await path.focus();await page.keyboard.press('Enter')
    await page.waitForFunction(()=>{const img=document.querySelector('.room-panel__image img');return img?.complete&&img.naturalWidth>0})
  }
  for(const width of [390,768,1440]){
    await page.setViewportSize({width,height:900});await noOverflow(page)
    await page.evaluate(()=>document.querySelectorAll('img').forEach(img=>{img.loading='eager'}))
    await page.waitForFunction(()=>[...document.images].filter(img=>img.getAttribute('src')).every(img=>img.complete&&img.naturalWidth>0))
  }
  for(const url of ['/administrator','/administracja','/nie-istnieje']){
    const response=await page.goto(server.url+url);if(response.status()!==404)throw new Error(`${url}: oczekiwano HTTP 404`)
  }
  if(errors.length)throw new Error(errors.join('\n'))
  console.log('PASS produkcyjny UI: unknown/A–E, URL, formularz, analityka, runtime JSON, fallback, obrazy, rzut 2D, galerie i brak admina produkcyjnego.')
}finally{await chrome.close();server.child.kill('SIGTERM')}
