/** Normal-origin browser acceptance; requires the production build, no virtual-origin adapter. */
import {expect} from '@playwright/test'
import {readFileSync} from 'node:fs'
import {browser,startServer,noOverflow} from './browser-utils.mjs'
const server=await startServer('preview-server.mjs',4183),chrome=await browser()
try {
  const noJs=await chrome.newContext({javaScriptEnabled:false})
  const page=await noJs.newPage()
  await page.goto(server.url+'/')
  await expect(page.locator('#domy article')).toHaveCount(5)
  await expect(page.locator('#domy')).toContainText('Przed sprzedażą')
  await expect(page.locator('#domy')).not.toContainText('779 000')
  for(const [path,title] of [['polityka-prywatnosci','Polityka prywatności'],['polityka-cookies','Polityka cookies']]) {
    await page.goto(`${server.url}/${path}/`)
    await expect(page.locator('h1')).toHaveText(title)
    await expect(page.locator('section h2').first()).toBeVisible()
  }
  const missing=await page.goto(server.url+'/missing-test-url')
  if(missing.status()!==404)throw Error('Missing URL must return real HTTP 404')
  await expect(page.locator('h1')).toContainText('Nie znaleźliśmy')
  await noJs.close()
  const ctx=await chrome.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'})
  const app=await ctx.newPage(),errors=[];app.on('pageerror',e=>errors.push(e.message))
  await app.goto(server.url+'/?dom=A',{waitUntil:'networkidle'})
  await app.getByRole('button',{name:'Tylko niezbędne',exact:true}).click()
  await expect(app.locator('.house-card__price')).toContainText('Już wkrótce')
  const priced=JSON.parse(readFileSync('tests/fixtures/selling-baseline.json','utf8'));priced.revision=100;priced.houses[0].price=700001
  await app.route('**/data/site-data.json',route=>route.fulfill({json:priced}))
  await app.reload({waitUntil:'networkidle'})
  await expect(app.locator('.house-card__price')).toContainText('700 001 zł')
  await expect(app.locator('.hero__facts')).toContainText('700 001 zł')
  await expect(app.locator('header .site-header__nav')).toContainText('Domy i ceny')
  // A legitimate cache rollback must never resurrect stale content.
  priced.revision=1
  await app.reload({waitUntil:'networkidle'})
  await expect(app.locator('.site-data-warning')).toBeVisible()
  await expect(app.locator('.house-card__price')).toContainText('Już wkrótce')
  for(const width of [320,390,768,1440]){await app.setViewportSize({width,height:900});await noOverflow(app)}
  if(errors.length)throw Error(errors.join('\n'))
  console.log('PASS normal-origin prelaunch/selling, stale-data rejection, no-JS legal/404 and responsive layout')
}finally{await chrome.close();server.child.kill('SIGTERM')}
