import {chromium,expect} from '@playwright/test'
import {startServer,noOverflow} from './browser-utils.mjs'
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs'
const server=await startServer('preview-server.mjs',4191)
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined})
const output='docs/rc4';mkdirSync(output,{recursive:true});const report={viewports:[],errors:[],axe:[],checks:[]}
try{
 for(const width of [320,390,768,1024,1440,1920]){
  console.log('viewport',width)
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});page.setDefaultTimeout(10000);page.on('pageerror',e=>report.errors.push(e.message))
  console.log('goto',server.url)
  await page.goto(server.url,{waitUntil:'networkidle'});await page.getByRole('button',{name:'Tylko niezbędne',exact:true}).click()
  await expect(page.locator('#dokumenty .document-shelf__files>a')).toHaveCount(2)
  await expect(page.locator('#dokumenty')).toContainText('Przykładowa karta domu')
  await expect(page.locator('.homes-table thead')).toContainText('Cena brutto')
  await expect(page.locator('.homes-table tbody .pricing-pending')).toHaveCount(5)
  await expect(page.locator('.masterplan-north')).toHaveAttribute('data-north-angle','135')
  for(const id of ['domy','dom','lokalizacja','standard','dokumenty','dziennik','przedsprzedaz']){
   console.log('section',width,id)
   const section=page.locator('#'+id);await section.scrollIntoViewIfNeeded();await section.locator('img').evaluateAll(images=>Promise.all(images.map(img=>{img.loading="eager";return img.decode().catch(()=>{})})));await noOverflow(page)
   if([390,1440].includes(width))await section.screenshot({path:`${output}/${width}-${id}.png`})
  }
  console.log('carousel',width)
  await expect(page.locator('.news-card')).toHaveCount(4)
  const rail=page.locator('.journal-carousel__rail');await rail.scrollIntoViewIfNeeded()
  await page.getByRole('button',{name:'Następne aktualności'}).click();await expect.poll(()=>rail.evaluate(el=>el.scrollLeft)).toBeGreaterThan(20)
  await page.getByRole('button',{name:'Poprzednie aktualności'}).click();await expect.poll(()=>rail.evaluate(el=>el.scrollLeft)).toBe(0)
  if(width>960){
   const align=await page.evaluate(()=>({standard:Math.abs(document.querySelector('.standard-section__visuals').getBoundingClientRect().top-document.querySelector('.standard-section__body').getBoundingClientRect().top),garden:Math.abs(document.querySelector('.why-home__visual').getBoundingClientRect().top-document.querySelector('.why-home__lead').getBoundingClientRect().top)}))
   expect(align.standard).toBeLessThan(2);expect(align.garden).toBeLessThan(2)
  }else{
   await expect(page.locator('.location__mobile-map')).toBeVisible();expect(await page.locator('.location__mobile-map').evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThan(200)
  }
  console.log('presale',width)
  await page.locator('.presale-form button[type=submit]').click();await expect(page.locator('#presale-email')).toBeFocused()
  await page.locator('#presale-email').fill('qa@example.invalid');await page.locator('.presale-form button[type=submit]').click();await expect(page.locator('#presale-consent')).toBeFocused()
  await page.locator('#presale-consent').check()
  await page.route('**/api/presale.php',r=>r.fulfill({status:503,json:{ok:false,message:'Zapisy chwilowo niedostępne.'}}))
  await page.locator('.presale-form button[type=submit]').click();await expect(page.locator('#presale-status')).toContainText('chwilowo');await expect(page.locator('#presale-email')).toHaveValue('qa@example.invalid')
  await page.unroute('**/api/presale.php');await page.locator('.presale-form button[type=submit]').click();await expect(page.locator('#presale-status')).toContainText('Tryb podglądu')
  await page.locator('.presale-unsubscribe summary').click();await page.locator('#unsubscribe-email').fill('qa@example.invalid');await page.getByRole('button',{name:'Usuń mnie z listy'}).click();await expect(page.locator('.presale-unsubscribe [role=status]')).toContainText('Tryb podglądu')
  if([390,1440].includes(width)&&process.env.AXE_PATH){await page.addScriptTag({path:process.env.AXE_PATH});const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));report.axe.push({width,violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))})}
  report.viewports.push({width,overflow:0,carousel:'arrows work',signup:'validation,503,preview,unsubscribe',images:'aligned'});await page.close()
 }
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'})
 const data=JSON.parse(readFileSync('public/data/site-data.json','utf8'))
 data.journal=[{id:'test-real-entry',date:'Test wpisu',title:'Test rzeczywistego wpisu',description:'Treść fixture wyłącznie w teście.',photoCount:1,cover:'/assets/images/neighborhood/plots-aerial.webp',coverAlt:'Teren',photos:[{src:'/assets/images/neighborhood/plots-aerial.webp',title:'Teren',alt:'Teren inwestycji'}]}]
 await page.route('**/data/site-data.json',r=>r.fulfill({json:data}));await page.goto(server.url);await expect(page.locator('.news-card')).toHaveCount(1);await expect(page.locator('.journal-carousel__notice')).toHaveCount(0)
 await page.getByRole('button',{name:'Zobacz zdjęcia',exact:true}).click();await expect(page.locator('[role=dialog]')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('[role=dialog]')).toHaveCount(0)
 report.checks.push('Real journal entry replaces previews and opens gallery')
 await page.close()
}finally{writeFileSync(output+'/browser.json',JSON.stringify(report,null,2));await browser.close();server.child.kill()}
expect(report.errors).toEqual([]);expect(report.axe.flatMap(x=>x.violations)).toEqual([]);console.log(JSON.stringify(report,null,2))
