import {expect} from '@playwright/test'
import {browser,startServer} from './browser-utils.mjs'
import {writeFileSync} from 'node:fs'
const server=await startServer(),chrome=await browser(),report={tours:[],panorama:null}
try{
 const page=await chrome.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'})
 await page.goto(server.url,{waitUntil:'networkidle'});await page.getByRole('button',{name:'Tylko niezbędne',exact:true}).click()
 for(const mode of ['interior','exterior']){
  await page.locator('#choose-tour').click();await page.locator(mode==='interior'?'.tour-choice-option--interior':'.tour-choice-option').first().click();const f=page.frameLocator('.tour-frame-modal iframe')
  await expect(f.locator('#tourApp')).toHaveAttribute('aria-busy','false',{timeout:15000});if(await f.locator('#tourDisclaimer').isVisible())await f.locator('#tourDisclaimerAccept').click()
  report.tours.push({mode,scene:await f.locator('#tourApp').getAttribute('data-scene')})
  await f.locator('#closeTour').click();await expect(page.locator('.tour-frame-modal')).toHaveCount(0)
 }
 await page.getByRole('button',{name:'Otwórz panoramę'}).click();await expect(page.locator('.panorama-modal__loading')).toHaveCount(0,{timeout:15000})
 report.panorama=await page.locator('.panorama-modal__error').count()?'fallback':'WebGL rendered'
 await page.locator('.panorama-modal').screenshot({path:'docs/audit-premium/qa/panorama.png'})
 await page.keyboard.press('Escape');await expect(page.locator('.panorama-modal')).toHaveCount(0)
 console.log(report)
}finally{writeFileSync('docs/audit-premium/qa/immersive.json',JSON.stringify(report,null,2));await chrome.close();server.child.kill()}
