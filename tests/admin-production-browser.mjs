import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { browser } from './browser-utils.mjs'

const chrome = await browser()
try {
  const t = Date.now()
  const stamp = seconds => new Date(t + seconds * 1000).toISOString()
  const page = await chrome.newPage({viewport:{width:1440,height:900}})
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', route => {
    const pathname = new URL(route.request().url()).pathname
    if (pathname === '/administrator/') return route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><html lang="pl"><head><meta charset="utf-8"><link rel="stylesheet" href="/administrator/assets/admin-app.css"><script type="module" src="/administrator/assets/admin-app.js"></script></head><body><div id="admin-root" data-server-session="active"></div></body></html>'})
    if (pathname === '/administrator/assets/admin-app.js' || pathname === '/administrator/assets/admin-app.css') return route.fulfill({status:200,contentType:pathname.endsWith('.js')?'text/javascript':'text/css',body:readFileSync('dist' + pathname)})
    if (pathname === '/administrator/analytics.php') return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,events:4,uniqueVisitors:1,uniqueVisits:2,returningVisitors:1,engagedDurationMs:150000,devices:{mobile:1},sections:[{id:'hero',views:1,durationMs:120000},{id:'homes',views:1,durationMs:30000}],tours:[],visitors:[{id:'anon…',lookup:'a'.repeat(64),visits:2,durationMs:150000,device:'mobile',lastPath:'/',firstSeen:stamp(-86400),lastSeen:stamp(180)}],sources:{},houses:{}})})
    if (pathname === '/administrator/journey.php') return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,visits:[{id:'b'.repeat(64),firstSeen:stamp(0),lastSeen:stamp(180),durationMs:150000,source:'direct',device:'mobile',events:4},{id:'c'.repeat(64),firstSeen:stamp(-86400),lastSeen:stamp(-86200),durationMs:200000,source:'direct',device:'mobile',events:2}],selectedVisit:'b'.repeat(64),events:[{at:stamp(0),type:'section_view',section:'hero',scene:'',tour:'',house:'',path:'/',durationMs:0},{at:stamp(120),type:'section_time',section:'hero',scene:'',tour:'',house:'',path:'/',durationMs:120000},{at:stamp(150),type:'section_view',section:'homes',scene:'',tour:'',house:'',path:'/',durationMs:0},{at:stamp(180),type:'section_time',section:'homes',scene:'',tour:'',house:'',path:'/',durationMs:30000}],truncated:false})})
    return route.fulfill({status:404,body:''})
  })
  await page.goto('http://dnp.test/administrator/',{waitUntil:'networkidle'})
  if (await page.locator('.admin-topbar h1').count() === 0) throw new Error(`Panel nie wyrenderował się: ${JSON.stringify({errors,body:(await page.locator('body').innerText()).slice(0,260)})}`)
  assert.equal(await page.locator('.admin-topbar h1').textContent(),'Analityka')
  assert.match(await page.locator('.admin-demo-badge').textContent(),/Panel serwera/i)
  for (const name of ['Domy i ceny','Budowa','Dokumenty','Zapytania','Analityka','Ustawienia']) {
    await page.locator('.admin-sidebar nav').getByRole('button',{name,exact:true}).click()
    assert.equal(await page.locator('.admin-topbar h1').textContent(),name)
  }
  await page.getByRole('button',{name:'Analityka',exact:true}).click()
  assert.equal(await page.getByLabel('Klucz administratora').count(),0)
  await page.getByText('Aktualne dane · 30 dni').waitFor()
  await page.getByRole('heading',{name:'Przebieg wizyt'}).waitFor()
  assert.equal(await page.locator('.dnp-a-chart-row').count(),2)
  assert.equal(await page.locator('.dnp-a-visit-picker button').count(),2)
  assert.equal(await page.getByText('Anna Nowak').count(),0)
  await page.setViewportSize({width:390,height:844})
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth)) <= 390, 'Panel wychodzi poza ekran telefonu')
  assert.ok(await page.locator('.dnp-a-chart-scroll').evaluate(el=>el.scrollWidth > el.clientWidth), 'Oś czasu powinna przewijać się we własnym obszarze na telefonie')
  assert.deepEqual(errors,[])
  console.log('PASS: panel v5.1, rzeczywiste dane bez klucza w UI, historia wizyt i mobile bez poziomego przelewania.')
} finally { await chrome.close() }
