import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {startServer,browser,noOverflow} from './browser-utils.mjs';
const server=await startServer('preview-server.mjs',4198), b=await browser();
try {
 const page=await b.newPage();let allowed=false,requests=0;
 await page.route('**/api/analytics-summary.php',route=>{requests++;return route.fulfill({status:allowed?200:403,contentType:'application/json',body:JSON.stringify(allowed?{ok:true,uniqueVisitors:12,uniqueVisits:18,devices:{mobile:10}}:{ok:false})})});
 await page.goto(server.url+'/administrator-control/');
 assert.equal(await page.locator('#dashboard').isVisible(),false);
 await page.locator('#login').fill('analityka');await page.locator('#key').fill('test-password');await page.locator('#key').press('Enter');
 await page.waitForFunction(()=>document.querySelector('#loginMsg').textContent.includes('Nieprawidłowy'));
 assert.equal(await page.locator('#dashboard').isVisible(),false);
 allowed=true;await page.locator('#signIn').click();await page.locator('#dashboard').waitFor();
 assert.match(await page.locator('#summary').innerText(),/12/);assert.equal(await page.getByText('Włącz publikację',{exact:true}).count(),0);
 await page.locator('#clearKey').click();assert.equal(await page.locator('#dashboard').isVisible(),false);
 await page.locator('#login').fill('analityka');await page.locator('#key').fill('test-password');await page.locator('#key').press('Enter');await page.locator('#dashboard').waitFor();
 mkdirSync('docs/rc8',{recursive:true});await page.screenshot({path:'docs/rc8/panel-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await noOverflow(page);await page.screenshot({path:'docs/rc8/panel-mobile.png',fullPage:true});
 assert.equal(requests,3);console.log('PASS: invalid credentials, login button, Enter, clear, mobile layout. API responses mocked.');
} finally {await b.close();server.child.kill();}
