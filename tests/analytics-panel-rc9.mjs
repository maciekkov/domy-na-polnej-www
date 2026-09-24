import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {startServer,browser,noOverflow} from './browser-utils.mjs';
const {child,url}=await startServer('preview-server.mjs',4199),chrome=await browser();
try{
 const page=await chrome.newPage({viewport:{width:1360,height:950}}), errors=[];page.on('pageerror',error=>errors.push(error.message));
 let authorized=false,details=0;
 const summary={ok:true,rangeDays:30,uniqueVisitors:2,uniqueVisits:3,returningVisitors:1,engagedDurationMs:27000,devices:{desktop:9,mobile:4},sources:{google:10,direct:3},sections:[{id:'homes',views:2,durationMs:13000},{id:'hero',views:1,durationMs:5000}],tours:[{mode:'interior',views:1,durationMs:9000}],houses:{B:{select:1,pdf:0,contact:1}},visitors:[{id:'visitor1234…',lookup:'a'.repeat(64),firstSeen:'2026-09-18T12:00:00Z',lastSeen:'2026-09-20T12:00:00Z',visits:2,durationMs:22000,device:'desktop',lastPath:'/'}]};
 const first='b'.repeat(64),last='c'.repeat(64);
 const visits=[{id:last,firstSeen:'2026-09-20T12:00:00Z',durationMs:9000,source:'direct',device:'mobile',events:1},{id:first,firstSeen:'2026-09-18T12:00:00Z',durationMs:13000,source:'google',device:'desktop',events:3}];
 await page.route('**/api/analytics-summary.php',route=>route.fulfill({status:authorized?200:401,contentType:'application/json',body:JSON.stringify(authorized?summary:{ok:false})}));
 await page.route('**/api/analytics-journey.php',async route=>{details++;const posted=route.request().postDataJSON();const selected=posted.visit||last;const events=selected===last?[{at:'2026-09-20T12:00:09Z',type:'tour_scene_time',tour:'interior',scene:'salon',durationMs:9000,house:'B'}]:[{at:'2026-09-18T12:00:00Z',type:'visit_start'},{at:'2026-09-18T12:00:01Z',type:'section_view',section:'homes'},{at:'2026-09-18T12:00:13Z',type:'section_time',section:'homes',durationMs:13000,house:'B'}];await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,visits,selectedVisit:selected,events})});});
 await page.goto(url+'/administrator-control/');assert.equal(await page.locator('#dashboard').isVisible(),false);
 await page.locator('#login').fill('analityka');await page.locator('#key').fill('wrong');await page.locator('#key').press('Enter');await page.waitForFunction(()=>document.querySelector('#loginMsg').textContent.includes('Nieprawidłowy'));assert.equal(await page.locator('#dashboard').isVisible(),false);
 authorized=true;await page.locator('#signIn').click();await page.locator('#dashboard').waitFor();assert.match(await page.locator('#visitors').innerText(),/visitor1234/);
 mkdirSync('docs/rc9',{recursive:true});await page.screenshot({path:'docs/rc9/analytics-desktop.png',fullPage:true});
 await page.locator('.visitor').first().click();await page.waitForTimeout(400);if(!(await page.getByRole('heading',{name:'Przebieg wizyty'}).isVisible()))throw new Error('Dialog: '+await page.locator('#journeyDialog').innerText()+'; errors: '+errors.join('|'));
 assert.match(await page.locator('#journeyBody').innerText(),/Spacer wnętrza/);assert.match(await page.locator('.visit-switch').innerText(),/Wizyta 1/);
 await page.locator('.visit-switch button').last().click();await page.waitForFunction(()=>document.querySelector('#journeyBody').textContent.includes('Domy i działki'));
 assert.equal(details,2);await page.screenshot({path:'docs/rc9/historia-desktop.png',fullPage:true});
 await page.locator('#closeJourney').click();await page.locator('#demo').click();await page.waitForFunction(()=>document.querySelectorAll('.step-list li').length===19);
 assert.match(await page.locator('#journeyKind').innerText(),/SYMULACJA/);assert.match(await page.locator('#journeyBody').innerText(),/22 min 30 s/);
 await page.screenshot({path:'docs/rc9/demo-desktop.png',fullPage:true});await page.locator('#closeJourney').click();
 await page.setViewportSize({width:390,height:844});await noOverflow(page);await page.screenshot({path:'docs/rc9/analytics-mobile.png',fullPage:true});
 await page.locator('.visitor').first().click();await page.getByRole('heading',{name:'Przebieg wizyty'}).waitFor();await page.screenshot({path:'docs/rc9/historia-mobile.png',fullPage:true});
 assert.equal(errors.length,0,errors.join('\n'));console.log('PASS: production summary, login Enter/error, history with two visits, 19-step demo separate, mobile no overflow. API mocked.');
}finally{await chrome.close();child.kill();}
