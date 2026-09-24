import { expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { browser, startServer, noOverflow } from './browser-utils.mjs'
import { parseSiteData } from '../src/data/runtime/siteSchema.mjs'
// Admin is tested in explicit development mode, NEVER in the production preview.
const server=await startServer('scripts/dev-admin.mjs',4190,['--port','4190','--strictPort'],{DNP_NO_OPEN:'1'}),chrome=await browser()
try{
  const context=await chrome.newContext({viewport:{width:1440,height:1000}})
  const page=await context.newPage(),errors=[]
  page.on('pageerror',error=>errors.push(error.message))
  await page.goto(server.url+'/administrator',{waitUntil:'networkidle'})
  await page.getByLabel('Login').fill('admin');await page.getByLabel('Hasło').fill('admin');await page.getByRole('button',{name:'Zaloguj'}).click()
  await expect(page.getByRole('heading',{name:'Pulpit',exact:true})).toBeVisible()
  await expect(page.locator('.admin-safety-banner')).toContainText('tylko w tej przeglądarce')
  for(const name of ['Domy i ceny','Budowa','Dokumenty','Zapytania','Analityka','Ustawienia']){
    await page.locator('.admin-sidebar nav').getByRole('button',{name,exact:true}).click()
    await expect(page.locator('.admin-topbar h1')).toHaveText(name)
  }
  const data=JSON.parse(readFileSync('tests/fixtures/selling-baseline.json','utf8'));data.revision=100;data.houses[0].price=888000
  await page.locator('.admin-topbar input[type=file]').setInputFiles({name:'site-data.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))})
  await page.getByRole('button',{name:'Zapisz podgląd demo'}).click()
  const local=await page.evaluate(()=>JSON.parse(localStorage.getItem('dnp-published-site-data-v1')))
  if(local.houses[0].price!==888000)throw new Error('Nie zapisano lokalnego snapshotu')
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Eksport danych produkcyjnych'}).click()
  const file=await download
  const exported=parseSiteData(JSON.parse(readFileSync(await file.path(),'utf8')))
  if('leads' in exported||exported.houses[0].price!==888000)throw new Error('Zły eksport publiczny')
  const disk=JSON.parse(readFileSync('public/data/site-data.json','utf8'))
  if(disk.houses[0].price===888000)throw new Error('Demo nadpisało plik produkcyjny')
  await page.setViewportSize({width:390,height:844});await noOverflow(page)
  if(errors.length)throw new Error(errors.join('\n'))
  console.log('PASS demo: jawne włączenie, moduły, import, lokalny zapis, publiczny eksport bez CRM, brak zapisu na serwer i mobile.')
}finally{await chrome.close();server.child.kill('SIGTERM')}
