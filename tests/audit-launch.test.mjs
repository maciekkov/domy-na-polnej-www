import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,cpSync,rmSync} from 'node:fs'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {execFileSync} from 'node:child_process'
import {parseSiteData} from '../src/data/runtime/siteSchema.mjs'
import {publicSnapshot,publicStatus} from '../src/lib/sales.mjs'
import {pageMeta,structuredData,offerLead} from '../src/lib/offers.mjs'
import {prepareSourcePages,generateSourcePages,homeSnapshot} from '../scripts/generate-seo.mjs'
import {mergePublicPriceHistory} from '../scripts/publish-site-data.mjs'
import {legalContent,legalMarkup} from '../src/lib/legalContent.mjs'
const root=join(import.meta.dirname,'..'),read=p=>readFileSync(join(root,p),'utf8')
const launch=()=>JSON.parse(read('public/data/site-data.json')),selling=()=>JSON.parse(read('tests/fixtures/selling-baseline.json'))
test('explicit launch stage required; missing flag is not an automatic start',()=>{const d=launch();delete d.salesStage;assert.throws(()=>parseSiteData(d),/salesStage/)})
for(const field of ['price','priceHistory','mandatoryPayments']) test('prelaunch rejects accidental public '+field,()=>{const d=launch();d.houses[0][field]=field==='price'?779000:field==='priceHistory'?[{price:779000,validFrom:'2026-01-01',validTo:'2026-09-23'}]:[{name:'Droga',amount:1000}];assert.throws(()=>parseSiteData(d),/kwot/)})
test('selling requires all five actual prices, never null/zero placeholders',()=>{const d=selling();d.houses[3].price=null;assert.throws(()=>parseSiteData(d),/ceny/);d.houses[3].price=0;assert.throws(()=>parseSiteData(d))})
test('private prelaunch draft can retain amounts; export scrubs without mutating draft',()=>{const d=launch();d.houses[0].price=800001;assert.doesNotThrow(()=>parseSiteData(d,{allowDraftPrices:true}));const exported=publicSnapshot(d);assert.equal(exported.houses[0].price,null);assert.equal(d.houses[0].price,800001);assert.doesNotThrow(()=>parseSiteData(exported))})
test('future approved selling preserves prices in hero/meta/schema and no-JS',()=>{const d=selling();parseSiteData(d);assert.match(offerLead(d.houses,d.salesStage),/779 000/);assert.match(pageMeta(d).description,/779 000/);const graph=structuredData(d)['@graph'];assert.equal(graph[2].itemListElement[0].item.offers.price,779000);assert.match(homeSnapshot(d),/779 000 zł/);assert.match(homeSnapshot(d),/7029,42 zł/);})
test('no phantom zero/Offer in prelaunch or HTML',()=>{const d=launch();assert.ok(!JSON.stringify(structuredData(d)).includes('"offers"'));assert.ok(!homeSnapshot(d).includes('0 zł'));assert.match(homeSnapshot(d),/Przed sprzedażą/);assert.equal(publicStatus(d,'Dostępny'),'Przed sprzedażą')})
test('launch from unpublished draft does not create fake price history',()=>{const previous=launch(),next=selling();next.publishedAt='2026-10-01';assert.deepEqual(mergePublicPriceHistory(next,previous).houses[0].priceHistory,[])})
test('selling cannot erase published history by relabelling as prelaunch',()=>assert.throws(()=>mergePublicPriceHistory(launch(),selling()),/historii/))
test('selling no-JS keeps price history and extra compulsory costs',()=>{const d=selling();d.houses[0].priceHistory=[{price:799000,validFrom:'2026-09-01',validTo:'2026-09-22'}];d.houses[0].mandatoryPayments=[{name:'Udział w drodze',amount:10000}];const html=homeSnapshot(d);assert.match(html,/Historia ceny/);assert.match(html,/799 000 zł/);assert.match(html,/Udział w drodze: 10 000 zł/)})
test('SEO generation is byte-idempotent in an isolated fixture',()=>{
 const dir=mkdtempSync(join(tmpdir(),'dnp-idempotent-'));
 try{for(const path of ['public/data','public/assets/data','src/styles/sections'])mkdirSync(join(dir,path),{recursive:true});for(const path of ['index.html','public/data/site-data.json','public/assets/data/asset-versions.json','src/styles/tokens.css','src/styles/globals.css','src/styles/sections/hero.css'])cpSync(join(root,path),join(dir,path));generateSourcePages(dir);const first=readFileSync(join(dir,'index.html'),'utf8');generateSourcePages(dir);assert.equal(readFileSync(join(dir,'index.html'),'utf8'),first)}finally{rmSync(dir,{recursive:true,force:true})}
})
test('hero preload and picture reference identical versioned image URLs',()=>{const d=launch(),manifest=JSON.parse(read('public/assets/data/asset-versions.json')).assets;const html=homeSnapshot(d,manifest);for(const width of [640,1024,1672])assert.ok(html.includes(`/assets/images/responsive/hero-0-${width}.webp?v=${manifest[`/assets/images/responsive/hero-0-${width}.webp`]} ${width}w`));assert.ok(read('src/sections/Hero/Hero.tsx').includes('assetUrl('))})
test('legal static HTML contains all source policy sections and escapes substitutions',()=>{for(const [name,n] of [['privacy',9],['cookies',5]]){const p=legalContent(name,launch().contact);assert.equal((p.body.match(/<h2>/g)||[]).length,n);assert.match(legalMarkup(name,launch().contact),/<h1>/)}const contact={...launch().contact,email:'<img src=x onerror=evil()>',phoneDisplay:'<script>evil()</script>'};const html=legalMarkup('privacy',contact);assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;img'))})
test('admin key not persisted and server values never written as HTML',()=>{const js=read('public/administrator-control/control.js');assert.ok(!js.includes('.innerHTML'));assert.ok(!js.includes('sessionStorage.setItem'));assert.ok(!js.includes('localStorage.setItem'));assert.ok(js.includes('.textContent'));assert.ok(!/<script>/.test(read('public/administrator-control/index.html')));assert.match(read('public/administrator-control/.htaccess'),/frame-ancestors 'none'/)})
test('Gov rejects prelaunch; incomplete official transport is not called ready',()=>{const program=`require '${join(root,'api/lib/gov-sync.php')}'; $data=json_decode(file_get_contents('${join(root,'public/data/site-data.json')}'),true); try{dnpGovPayload([], $data);exit(9);}catch(RuntimeException $e){echo $e->getMessage();} if(dnpGovTransportReady(['gov_sync'=>['mode'=>'http','endpoint'=>'https://example.invalid']])['ready'])exit(10);`;const text=execFileSync('php',['-r',program],{encoding:'utf8'});assert.match(text,/rozpoczęciem sprzedaży/)})
test('source upload protection exists; strict script CSP is explicitly report-only on public site',()=>{const s=read('public/.htaccess');assert.match(s,/Content-Security-Policy-Report-Only/);assert.match(s,/src\|scripts\|tests\|vendor/);assert.match(s,/frame-ancestors 'self'/)})

test('all 17 authored FAQ answers are also available in static HTML without JS',()=>{const html=homeSnapshot(launch());assert.equal((html.match(/<details>/g)||[]).length,17);assert.match(html,/Kiedy będzie dostępny cennik/);assert.match(html,/Standard techniczny/)})
