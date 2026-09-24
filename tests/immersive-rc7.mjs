import {expect} from '@playwright/test'
import {browser,startServer} from './browser-utils.mjs'
import {mkdirSync} from 'node:fs'
const server=await startServer('preview-server.mjs',4197),chrome=await browser();mkdirSync('docs/rc7',{recursive:true})
try{
 const page=await chrome.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,reducedMotion:'reduce'})
 await page.goto(server.url);await page.getByRole('button',{name:'Tylko niezbędne',exact:true}).click()
 await page.reload();await expect(page.locator('.consent-banner')).toBeVisible();await expect(page.locator('.consent-banner')).toContainText('tylko niezbędne');await page.getByRole('button',{name:'Tylko niezbędne',exact:true}).click()
 for(const mode of ['interior','exterior']){
  await page.locator('#choose-tour').click();await page.locator(mode==='interior'?'.tour-choice-option--interior':'.tour-choice-option').first().click();const f=page.frameLocator('.tour-frame-modal iframe')
  await expect(f.locator('#tourApp')).toHaveAttribute('aria-busy','false',{timeout:15000});if(await f.locator('#tourDisclaimer').isVisible())await f.locator('#tourDisclaimerAccept').click()
  await page.setViewportSize({width:844,height:390});await page.waitForTimeout(150)
  const geometry=await f.locator('#tourApp').evaluate(el=>({picture:JSON.parse(el.dataset.imageRect),width:innerWidth,height:innerHeight,fit:getComputedStyle(el.querySelector('.tour-image-layer.is-active')).objectFit}))
  expect(geometry.fit).toBe('cover');expect(geometry.picture.width).toBeGreaterThanOrEqual(843);expect(geometry.picture.height).toBeGreaterThanOrEqual(389)
  await page.screenshot({path:`docs/rc7/${mode}-landscape.png`})
  await f.locator('#switchTour').click();await page.waitForTimeout(600)
  await page.goBack();await expect(page.locator('.tour-frame-modal')).toHaveCount(0);expect(new URL(page.url()).pathname).toBe('/')
  await page.setViewportSize({width:390,height:844});console.log('PASS tour rotate/switch/back',mode)
 }
 await page.getByRole('button',{name:'Otwórz panoramę'}).click();await expect(page.locator('.panorama-modal__loading')).toHaveCount(0,{timeout:15000});await expect(page.locator('.panorama-modal__error')).toHaveCount(0)
 const canvas=page.locator('.panorama-modal canvas');console.log('Panorama',await canvas.evaluate(c=>({source:c.dataset.sourceResolution,precision:c.dataset.shaderPrecision,width:c.width,height:c.height})))
 await page.goBack();await expect(page.locator('.panorama-modal')).toHaveCount(0)
 await page.getByRole('button',{name:'Otwórz panoramę'}).click();await page.getByRole('button',{name:'Zamknij panoramę',exact:true}).click();await expect(page.locator('.panorama-modal')).toHaveCount(0)
 console.log('PASS panorama back/X and cookies reload')
}finally{await chrome.close();server.child.kill()}
