import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require=createRequire(import.meta.url),ts=require('../vendor/typescript.cjs')
const source=readFileSync(new URL('../src/lib/analytics.ts',import.meta.url),'utf8')
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText
const catalog=JSON.parse(readFileSync(new URL('../api/event-names.json',import.meta.url),'utf8'))
function fixture({local=false,storageThrows=false,setThrows=false,cookieThrows=false,beacon=true,legacy=null}={}) {
  const calls=[],listeners={},docListeners={},store=new Map(),sessions=new Map(),cookies=new Map()
  if(legacy)store.set('dnp-analytics-consent-v1',legacy)
  const storage=map=>({getItem(k){if(storageThrows)throw Error('disabled');return map.get(k)??null},setItem(k,v){if(storageThrows||setThrows)throw Error('quota');map.set(k,String(v))},removeItem(k){if(storageThrows)throw Error('disabled');map.delete(k)}})
  let counter=0,perf=1000
  const location={hostname:local?'localhost':'domynapolnej.pl',pathname:'/',search:'',protocol:'https:'}
  const window={location,innerWidth:1280,screen:{width:1280},addEventListener(name,fn){(listeners[name]??=[]).push(fn)},dispatchEvent(event){for(const fn of listeners[event.type]??[])fn(event)}}
  const document={referrer:'',visibilityState:'visible',addEventListener(name,fn){(docListeners[name]??=[]).push(fn)},get cookie(){if(cookieThrows)throw Error("Cookie blocked");return [...cookies].map(([k,v])=>`${k}=${encodeURIComponent(v)}`).join('; ')},set cookie(value){if(cookieThrows)throw Error("Cookie blocked");const first=value.split(';')[0],at=first.indexOf('='),name=decodeURIComponent(first.slice(0,at)),val=decodeURIComponent(first.slice(at+1));const max=/Max-Age=(\d+)/i.exec(value);if(max&&Number(max[1])===0)cookies.delete(name);else cookies.set(name,val)}}
  const context={exports:{},require:name=>name.includes('event-names')?catalog:require(name),localStorage:storage(store),sessionStorage:storage(sessions),window,document,navigator:{maxTouchPoints:0,sendBeacon:(url,payload)=>{if(beacon)calls.push({url,payload,type:'beacon'});return beacon}},screen:{width:1280},fetch:(url,options)=>{calls.push({url,options,type:'fetch'});return Promise.reject(Error('offline'))},URLSearchParams,URL,Event,Blob,Uint8Array,crypto:{randomUUID:()=>`qa-event-${++counter}`},Date,Map,Set,performance:{now:()=>perf}}
  vm.runInNewContext(compiled,context)
  return {api:context.exports,window,document,calls,store,sessions,cookies,advance(ms){perf+=ms},visibility(value){document.visibilityState=value;for(const fn of docListeners.visibilitychange??[])fn()}}
}
test('necessary-only never enables analytics or visitor cookies',()=>{const f=fixture();f.api.setConsent('necessary');assert.equal(f.api.track('page_view'),false);assert.equal(f.cookies.has('dnp_vid'),false);assert.equal(f.calls.length,0)})
test('all consent creates 180-day pseudonymous visitor/visit identity and event',async()=>{const f=fixture();f.api.setConsent('all');f.api.trackPageView();assert.ok(f.cookies.get('dnp_vid'));assert.ok(f.cookies.get('dnp_visit'));assert.equal(f.api.track('gallery_open'),true);const p=JSON.parse(await f.calls.at(-1).payload.text());assert.equal(p.eventName,'gallery_open');assert.equal(p.deviceClass,'desktop');assert.ok(p.visitorId);assert.ok(p.visitId);assert.equal(p.houseCode,'unknown')})
test('legacy accepted migrates to all, legacy necessary stays rejected',()=>{const a=fixture({legacy:'accepted'});assert.equal(a.api.analyticsAllowed(),true);const b=fixture({legacy:'necessary'});assert.equal(b.api.analyticsAllowed(),false)})
test('section time is measured and sent without PII',async()=>{const f=fixture();f.api.setConsent('all');f.api.trackSection('gallery','A');f.advance(4200);f.api.trackSection('standard','A');const payloads=[];for(const c of f.calls)payloads.push(JSON.parse(await c.payload.text()));const t=payloads.find(x=>x.eventName==='section_time');assert.equal(t.sectionId,'gallery');assert.equal(t.durationMs,4200);assert.equal('email' in t,false);assert.equal('phone' in t,false)})
test('tour scene duration supports mode, scene and duration',async()=>{const f=fixture();f.api.setConsent('all');f.api.track('tour_scene_time','B',{tourMode:'interior',sceneId:'int05',durationMs:12345});const p=JSON.parse(await f.calls.at(-1).payload.text());assert.equal(p.tourMode,'interior');assert.equal(p.sceneId,'int05');assert.equal(p.durationMs,12345)})
test('trackOnce prevents duplicate impression',()=>{const f=fixture();f.api.setConsent('all');f.api.trackOnce('house_card_open','A','masterplan');f.api.trackOnce('house_card_open','A','masterplan');assert.equal(f.calls.filter(x=>x.type==='beacon').length,1)})
test('revocation deletes analytical identifiers and local diagnostics',()=>{const f=fixture({local:true});f.api.setConsent('all');f.api.track('house_select','A');assert.ok(f.store.has('dnp-analytics-events-v3'));f.api.setConsent('necessary');assert.equal(f.cookies.has('dnp_vid'),false);assert.equal(f.cookies.has('dnp_visit'),false);assert.equal(f.store.has('dnp-analytics-events-v3'),false);assert.equal(f.sessions.has('dnp-analytics-session-v2'),false)})
test('explicit necessary choice wins when localStorage write fails',()=>{const f=fixture({setThrows:true,legacy:'accepted'});f.api.setConsent('necessary');assert.equal(f.api.analyticsAllowed(),false);assert.equal(f.api.track('page_view'),false)})
test('local development keeps consented diagnostics local',()=>{const f=fixture({local:true});f.api.setConsent('all');f.api.track('house_select','C');assert.equal(f.calls.length,0);assert.equal(JSON.parse(f.store.get('dnp-analytics-events-v3'))[0].houseCode,'C')})

test("denial remains effective with blocked cookies and storage",()=>{const f=fixture({cookieThrows:true,storageThrows:true});assert.doesNotThrow(()=>f.api.setConsent("necessary"));assert.equal(f.api.analyticsAllowed(),false);assert.equal(f.api.track("page_view"),false);assert.equal(f.calls.length,0)})

test('foreground time resumes after return and excludes the hidden interval',async()=>{
 const f=fixture();f.api.setConsent('all');f.api.trackSection('homes','A');f.advance(1800);f.visibility('hidden');f.advance(60000);f.visibility('visible');f.advance(2200);f.api.flushSectionTime();
 const events=await Promise.all(f.calls.map(async c=>JSON.parse(await c.payload.text())));const times=events.filter(e=>e.eventName==='section_time');
 assert.deepEqual(times.map(e=>e.durationMs),[1800,2200]);assert.ok(times.every(e=>e.sectionId==='homes'));
})
test('revocation while hidden never resumes analytics',()=>{
 const f=fixture();f.api.setConsent('all');f.api.trackSection('homes');f.advance(1000);f.visibility('hidden');f.api.setConsent('necessary');const before=f.calls.length;f.visibility('visible');f.advance(1000);f.api.flushSectionTime();assert.equal(f.calls.length,before);
})
test('changing selected house in the same section separates attribution',async()=>{
 const f=fixture();f.api.setConsent('all');f.api.trackSection('homes','A');f.advance(1000);f.api.trackSection('homes','B');f.advance(2000);f.api.flushSectionTime();
 const events=await Promise.all(f.calls.map(async c=>JSON.parse(await c.payload.text())));assert.deepEqual(events.filter(e=>e.eventName==='section_time').map(e=>e.houseCode),['A','B']);
})
