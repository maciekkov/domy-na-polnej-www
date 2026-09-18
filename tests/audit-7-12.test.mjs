import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,existsSync,mkdirSync,cpSync,rmSync,mkdtempSync,writeFileSync} from 'node:fs'
import {join,resolve} from 'node:path'
import {tmpdir} from 'node:os'
import {createHash} from 'node:crypto'
import {availablePrice,offerLead,pageMeta,structuredData,safeJson} from '../src/lib/offers.mjs'
import {validateContact} from '../src/lib/contactValidation.mjs'
import {generateSourcePages,refreshPublishedSeo} from '../scripts/generate-seo.mjs'
import {resolveSiteDocuments} from '../src/data/runtime/siteSchema.mjs'
import {walk} from '../scripts/asset-inventory.mjs'
const root=resolve(import.meta.dirname,'..'),read=p=>readFileSync(join(root,p),'utf8')
const snapshot=JSON.parse(read('public/data/site-data.json')),data=resolveSiteDocuments(snapshot),copy=()=>structuredClone(data)
const valid={name:'Jan',phone:'+48 600 123 456',email:'jan@example.test',message:'Pytanie',consentContact:true,consentPrivacy:true}
test('Dostępne domy: cena wyłącznie z aktywnej oferty',()=>assert.equal(availablePrice(data.houses),779000))
test('Sprzedany najtańszy dom nie wpływa na cenę od',()=>{const d=copy();d.houses[0].status='Sprzedany';assert.equal(availablePrice(d.houses),789000)})
test('Rezerwacja najtańszego domu nie wpływa na cenę od',()=>{const d=copy();d.houses[0].status='Rezerwacja';assert.equal(availablePrice(d.houses),789000)})
test('Wyprzedanie całej inwestycji: brak Infinity/0/poprzedniej ceny',()=>{const d=copy();d.houses.forEach(h=>h.status='Sprzedany');assert.equal(availablePrice(d.houses),null);assert.equal(offerLead(d.houses),'Zapytaj o dostępność');assert.ok(!pageMeta(d).description.includes('779'))})
test('Dane wejściowe polityki ceny nie są mutowane',()=>{const before=JSON.stringify(data);pageMeta(data);structuredData(data,'A');assert.equal(JSON.stringify(data),before)})
test('Nowa cena jest spójna w hero, meta i Offer',()=>{const d=copy();d.houses[0].price=750123;assert.match(offerLead(d.houses),/750 123/);assert.match(pageMeta(d).description,/750 123/);assert.equal(structuredData(d,'A')['@graph'].find(x=>x['@type']==='Offer').price,750123)})
test('Nieznany dom nie dostaje oferty A',()=>assert.throws(()=>pageMeta(data,'F')))
test('Sitemap nie publikuje osobnych stron domów',()=>{const xml=read('public/sitemap.xml');for(const id of ['a','b','c','d','e'])assert.ok(!xml.includes(`/dom-${id}/`));assert.ok(!xml.includes('administrator'))})
test('Publikacja aktualizuje stronę główną i SEO bez osobnych stron domów',()=>{
 const tmp=mkdtempSync(join(tmpdir(),'dnp-seo-'))
 try{mkdirSync(join(tmp,'assets/data'),{recursive:true});cpSync(join(root,'public/assets/data/asset-versions.json'),join(tmp,'assets/data/asset-versions.json'));cpSync(join(root,'index.html'),join(tmp,'index.html'));const d=copy();d.houses[0].status='Sprzedany';d.houses[1].price=765432;refreshPublishedSeo(tmp,d);const h=readFileSync(join(tmp,'index.html'),'utf8');assert.ok(h.includes('765 432 zł'));assert.ok(!h.includes('779 000 zł'));assert.ok(!h.includes('/dom-a/'));const once=readFileSync(join(tmp,'index.html'),'utf8');refreshPublishedSeo(tmp,d);assert.equal(readFileSync(join(tmp,'index.html'),'utf8'),once)}finally{rmSync(tmp,{recursive:true,force:true})}
})
test('JSON-LD jest escapowany, nie wykonuje tekstu oferty',()=>{const d=copy();d.houses[0].name='<img src=x onerror=alert(1)>';assert.ok(!safeJson(structuredData(d)).includes('<img'))})
test('Prawidłowy formularz przechodzi walidację',()=>assert.deepEqual(validateContact(valid),{}))
for(const [name,value]of [['name',''],['phone','123'],['phone','telefon1234567'],['phone','1234567890123456'],['email','zly-adres'],['email','a@@b.pl'],['consentContact',false],['consentPrivacy',false],['message','a'.repeat(3001)]])test('Błędne pole formularza: '+name+' '+String(value).slice(0,20),()=>assert.ok(validateContact({...valid,[name]:value})[name]))
test('E-mail i wiadomość mogą pozostać puste',()=>assert.deepEqual(validateContact({...valid,email:'',message:''}),{}))
test('Błąd formularza ma powiązanie z polem i przenosi fokus',()=>{const form=read('src/sections/FaqContact/FaqContact.tsx');assert.ok(form.includes('aria-invalid'));assert.ok(form.includes('aria-describedby'));assert.ok(form.includes("?.focus()"));assert.ok(form.includes('if (sending.current) return'));assert.ok(form.includes("if (!previewOnly) track('contact_submit'"))})
test('Kontakt: kompaktowy desktop i bezpieczny mobile',()=>{const css=read('src/styles/sections/contact.css');for(const token of ['font: 16px/1.3','min-height: 44px','min-height: 48px','focus-visible'])assert.ok(css.includes(token));assert.ok(!css.includes('!important'));assert.ok(css.includes('min-height: 84px'))})
test('Jeden katalog eventów JS/PHP, realny hook PDF i odsłony karty',()=>{const names=JSON.parse(read('api/event-names.json'));assert.ok(names.length>=18);assert.ok(read('src/lib/analytics.ts').includes('../../api/event-names.json'));assert.ok(read('api/analytics.php').includes('/event-names.json'));const card=read('src/components/house-selector/HouseCard.tsx');assert.ok(card.includes("track('house_pdf_download'"));assert.ok(card.includes("trackOnce('house_card_open'"));assert.ok(!existsSync(join(root,'src/components/house-selector/HouseModal.tsx')))})
test('Błędy fetch i storage nie przerywają działania',()=>{const s=read('src/lib/analytics.ts');assert.ok(s.includes(".catch(() => {})"));assert.ok(s.includes('memoryConsent'));assert.ok(!s.includes('fields.email'))})
test('CSS komponentów nie używa !important ani plików Refinement',()=>{const files=walk(join(root,'src'));assert.ok(!files.some(x=>x.endsWith('Refinement.css')));const css=files.filter(x=>x.includes('/styles/sections/')&&x.endsWith('.css')).map(x=>readFileSync(x,'utf8')).join('');assert.ok(!css.includes('!important'));assert.ok(read('src/styles/globals.css').split('\n').length<500)})
test('Pozostała tylko aktualna kolekcja renderów',()=>assert.ok(!existsSync(join(root,'public/assets/images/floorplan.webp'))))
test('Sekrety i prywatne endpointy nie są w paczce',()=>{assert.ok(!existsSync(join(root,'api/config.php')));assert.ok(read('api/.htaccess').includes('(?:data|lib)'));assert.ok(read('api/lib/security.php').includes('LOCK_EX | LOCK_NB'))})

test('Brak osobnych stron i linków Pełna oferta',()=>{const homes=read('src/sections/Homes/Homes.tsx'),card=read('src/components/house-selector/HouseCard.tsx'),seo=read('scripts/generate-seo.mjs');assert.ok(!homes.includes('Pełna oferta'));assert.ok(!card.includes('Pełna oferta'));assert.ok(!seo.includes('housePath(h.id)'));for(const id of ['a','b','c','d','e'])assert.ok(!existsSync(join(root,'dom-'+id)))})
