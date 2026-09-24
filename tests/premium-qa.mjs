import {chromium,expect} from '@playwright/test'
import {startServer,noOverflow} from './browser-utils.mjs'
import {mkdirSync,writeFileSync} from 'node:fs'
const server=await startServer('preview-server.mjs',4173)
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--enable-unsafe-swiftshader']})
const output='docs/audit-premium/qa';mkdirSync(output,{recursive:true})
const report={viewports:[],errors:[],broken:[],axe:[],interactions:[]}
try{
 for(const width of [320,390,768,1024,1440,1920]){
  console.log('Viewport',width)
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'})
  page.on('pageerror',e=>report.errors.push(e.message))
  page.on('response',r=>{if(r.status()>=400)report.broken.push([r.status(),r.url()])})
  await page.goto(server.url,{waitUntil:'networkidle'})
  await page.getByRole('button',{name:'Tylko niezbędne',exact:true}).click()
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('.plot-label[aria-pressed=true]')).toHaveCount(0)
  for(const id of ['start','domy','dom','uklad','lokalizacja','galeria','standard','bezpieczenstwo','harmonogram','dziennik','zespol','faq','kontakt']){
   console.log('Section',id);const section=page.locator('#'+id);await section.evaluate(e=>e.scrollIntoView({block:'start'}));
   await section.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode().catch(()=>{})})));
   await noOverflow(page)
   if([390,1440].includes(width))await section.screenshot({path:`${output}/${width}-${id}.png`})
  }
  const brokenImages=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src));expect(brokenImages).toEqual([])
  const sizes=await page.locator('.contact-form input:not([type=checkbox])').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>parseFloat(getComputedStyle(e).fontSize)));expect(sizes.every(n=>n>=16)).toBeTruthy()
  if([390,1440].includes(width)&&process.env.AXE_PATH){
   await page.addScriptTag({path:process.env.AXE_PATH});
   const results=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
   report.axe.push({width,violations:results.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))})
  }
  await page.locator('.plot-label').filter({hasText:'C'}).click()
  if(width<=960){await expect(page.locator('.house-sheet')).toBeVisible();await page.locator('.house-sheet').getByRole('button',{name:'Zapytaj o dom C'}).click()}
  else await page.locator('.house-card').getByRole('button',{name:'Zapytaj o dom C'}).click()
  await expect(page.locator('select[name=house]')).toHaveValue('C');await expect(page.locator('#contact-name')).toBeFocused()
  await page.locator('.contact-form button[type=submit]').click();await expect(page.locator('#contact-name')).toBeFocused();await expect(page.locator('#contact-name')).toHaveAttribute('aria-invalid','true')
  await page.locator('#contact-name').fill('Test jakości');await page.locator('#contact-phone').fill('600000000');await page.locator('#contact-consentContact').check();await page.locator('#contact-consentPrivacy').check()
  await page.route('**/api/contact.php',r=>r.fulfill({status:503,json:{ok:false,message:'Serwer chwilowo niedostępny.'}}))
  await page.locator('.contact-form button[type=submit]').click();await expect(page.locator('.contact-form__status')).toContainText('Serwer chwilowo');await expect(page.locator('#contact-name')).toHaveValue('Test jakości')
  await page.unroute('**/api/contact.php');await page.locator('.contact-form button[type=submit]').click();await expect(page.locator('.contact-form__status')).toContainText('Tryb podglądu')
  await page.locator('#layout-tab-layout').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#layout-tab-zones')).toHaveAttribute('aria-selected','true')
  await page.locator('.gallery-tile').first().click();await expect(page.locator('[role=dialog]')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('[role=dialog]')).toHaveCount(0)
  if(width<=960){await page.getByRole('button',{name:'Otwórz menu',exact:true}).click();await expect(page.locator('#mobile-menu')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Otwórz menu',exact:true})).toBeFocused()}
  report.viewports.push({width,overflow:0,images:'loaded',form:'validation,503,preview success',selection:'C → form'})
  await page.close()
 }
 report.interactions.push('House selection, focus after modal close, invalid form, 503 preserves fields, successful preview, keyboard tabs, gallery Escape, mobile menu Escape')
}finally{writeFileSync(`${output}/results.json`,JSON.stringify(report,null,2));await browser.close();server.child.kill()}
expect(report.errors).toEqual([])
// One expected API 503 per viewport belongs to the controlled failure test.
expect(report.broken.filter(x=>!x[1].endsWith('/api/contact.php'))).toEqual([])
console.log(JSON.stringify({viewports:report.viewports,axe:report.axe.map(x=>({width:x.width,violations:x.violations.length}))},null,2))
