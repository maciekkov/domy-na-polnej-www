import {chromium,expect} from '@playwright/test'
import {startServer} from './browser-utils.mjs'
import {mkdirSync} from 'node:fs'
const server=await startServer('preview-server.mjs',4196)
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined});mkdirSync('docs/rc6',{recursive:true})
for(const width of [320,390,430,760,1440]){
 const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'})
 await page.goto(server.url);await page.getByRole('button',{name:'Tylko niezbędne',exact:true}).click();await page.waitForTimeout(200)
 if(width<=760){
 await expect(page.locator('.hero__bottom')).toHaveCount(0);await expect(page.locator('.hero__tour-link')).toBeHidden()
 await expect(page.locator('.homes-table')).toBeVisible();await expect(page.locator('.mobile-contact-bar')).toHaveCount(0)
 await page.locator('.masterplan .plot-label').nth(3).click();await expect(page.locator('.house-sheet')).toBeVisible();await expect(page.locator('.house-sheet .house-card__cta')).toBeHidden()
 await page.goBack();await expect(page.locator('.house-sheet')).toHaveCount(0);expect(new URL(page.url()).pathname).toBe('/')
 await page.locator('.masterplan .plot-label').nth(1).click();await page.getByRole('button',{name:'Zamknij kartę domu'}).click();await expect(page.locator('.house-sheet')).toHaveCount(0)
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);expect(overflow).toBe(false)
 for(const sel of ['.hero','.homes','.editorial-gallery','.immersive-grid']){await page.locator(sel).scrollIntoViewIfNeeded();await page.locator(sel).locator('img').evaluateAll(imgs=>Promise.all(imgs.map(img=>{img.loading='eager';return img.decode().catch(()=>{})})));await page.locator(sel).screenshot({path:`docs/rc6/${width}-${sel.slice(1)}.png`})}
 }else{await expect(page.locator('.hero__bottom')).toHaveCount(0);await expect(page.locator('.homes__showcase>.house-card')).toBeVisible()}
 console.log('PASS',width);await page.close()
}
await browser.close();server.child.kill()
