import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const base=process.env.PHP_WASM_NODE_MODULES;
if(!base)throw new Error('Set PHP_WASM_NODE_MODULES');
const {PHP}=await import(pathToFileURL(base+'/@php-wasm/universal/index.js'));
const {loadNodeRuntime}=await import(pathToFileURL(base+'/@php-wasm/node/index.js'));
const php=new PHP(await loadNodeRuntime('8.3',{emscriptenOptions:{processId:process.pid}}));
try{
 for(const directory of ['/www','/www/api','/www/api/lib','/private','/private/analytics'])php.mkdir(directory);
 for(const name of ['lib/security.php','analytics-summary.php','analytics-journey.php'])php.writeFile('/www/api/'+name,readFileSync('api/'+name));
 const password='test-password-long-and-isolated';
 php.writeFile('/www/api/config.php',`<?php return ['admin'=>['login'=>'analityka','password_sha256'=>'${createHash('sha256').update(password).digest('hex')}'],'security'=>['storage_dir'=>'/private','allowed_origins'=>['https://domynapolnej.pl']]];`);
 const stamp=new Date(Date.now()-15000).toISOString(), later=new Date(Date.now()-1000).toISOString(), date=stamp.slice(0,10);
 const events=[
  {visitorId:'visitor12345678',visitId:'visitA12345678',eventName:'visit_start',createdAt:stamp,source:'google',deviceClass:'mobile'},
  {visitorId:'visitor12345678',visitId:'visitA12345678',eventName:'section_view',sectionId:'homes',createdAt:stamp},
  {visitorId:'visitor12345678',visitId:'visitA12345678',eventName:'section_time',sectionId:'homes',durationMs:13000,createdAt:stamp},
  {visitorId:'visitor12345678',visitId:'visitB12345678',eventName:'tour_scene_time',tourMode:'interior',sceneId:'salon',durationMs:9000,createdAt:later},
  {visitorId:'visitor87654321',visitId:'visitC12345678',eventName:'section_time',sectionId:'contact',durationMs:5000,createdAt:stamp},
 ];
 php.writeFile(`/private/analytics/analytics-${date}.ndjson`,events.map(v=>JSON.stringify({pagePath:'/',houseCode:'B',...v})).join('\n')+'\n');
 let n=1;
 async function request(file,body,headers={},expected=200){const result=await php.run({scriptPath:'/www/api/'+file,method:'POST',relativeUri:'/api/'+file,headers:{'Origin':'https://domynapolnej.pl','Content-Type':'application/json','X-DNP-Admin-Login':'analityka','X-DNP-Admin-Password':password,...headers},body:new TextEncoder().encode(JSON.stringify(body)),$_SERVER:{REMOTE_ADDR:`192.0.2.${n++}`}});assert.equal(result.httpStatusCode,expected,result.text);return JSON.parse(result.text);}
 const summary=await request('analytics-summary.php',{rangeDays:30});
 assert.equal(summary.uniqueVisitors,2);assert.equal(summary.uniqueVisits,3);assert.equal(summary.returningVisitors,1);
 const visitor=summary.visitors.find(v=>v.visits===2);assert.match(visitor.lookup,/^[a-f0-9]{64}$/);assert.equal(visitor.durationMs,22000);
 const detail=await request('analytics-journey.php',{visitor:visitor.lookup,rangeDays:30});
 assert.equal(detail.visits.length,2);assert.equal(detail.events.length,1);assert.equal(detail.events[0].tour,'interior');
 const first=await request('analytics-journey.php',{visitor:visitor.lookup,visit:detail.visits.find(v=>v.events===3).id,rangeDays:30});
 assert.equal(first.events.length,3);assert.equal(first.events.find(v=>v.type==='section_time').durationMs,13000);
 assert.equal(JSON.stringify(first).includes('visitor12345678'),false);
 await request('analytics-journey.php',{visitor:'0'.repeat(64)}, {},404);
 await request('analytics-journey.php',{visitor:visitor.lookup},{'X-DNP-Admin-Password':'incorrect'},401);
 console.log('PASS: PHP 2 odwiedzających, 3 wizyty, powrót, sekcje i scena, HMAC lookup, brak obcych zdarzeń oraz autoryzacja.');
}finally{php.exit();}
