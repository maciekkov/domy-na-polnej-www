import {chromium,expect} from '@playwright/test'
import {startServer} from './browser-utils.mjs'
import {writeFileSync} from 'node:fs'
const server=await startServer('preview-server.mjs',4187)
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined})
const report=[]
try{for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'})
 await page.goto(server.url);await page.getByRole('button',{name:'Tylko niezbędne',exact:true}).click()
 await page.addScriptTag({path:process.env.AXE_PATH})
 const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}))
 report.push({width,violations:result.violations});await page.close()
}}finally{writeFileSync('docs/audit-rc3/accessibility.json',JSON.stringify(report,null,2));await browser.close();server.child.kill()}
expect(report.flatMap(r=>r.violations)).toEqual([]);console.log('Axe: zero violations at 390 and 1440px')
