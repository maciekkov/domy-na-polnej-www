import test from 'node:test'
import { runInNewContext } from 'node:vm'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, mkdtempSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { tmpdir } from 'node:os'
import { parseSiteData, resolveSiteDocuments } from '../src/data/runtime/siteSchema.mjs'
import { versionText, versionSiteData, assetVersions, syncAssetVersions, portablePath } from '../scripts/version-assets.mjs'
import { preparePublication, publishFile, mergePublicPriceHistory } from '../scripts/publish-site-data.mjs'
import { cacheControl } from '../scripts/http-cache.mjs'
const root=resolve(import.meta.dirname,'..')
const readJson=path=>JSON.parse(readFileSync(join(root,path),'utf8'))
const fresh=()=>readJson('public/data/site-data.json')
const selling=()=>readJson('tests/fixtures/selling-baseline.json')
const removeVersions = data => JSON.parse(JSON.stringify(data).replace(/\?v=[a-f0-9]{12,64}/g,''))

test('Prelaunch rc.4: parametry inwestycji zachowane, aktualizacja dokumentu standardu zatwierdzona',()=>{
  const current=removeVersions(parseSiteData(fresh())), baseline=readJson('tests/fixtures/business-baseline.json')
  assert.equal(current.salesStage,'prelaunch');assert.equal(current.revision,5)
  for (const h of current.houses) { assert.equal(h.price,null);assert.deepEqual(h.priceHistory,[]);assert.deepEqual(h.mandatoryPayments,[]) }
  delete current.salesStage;delete current.revision;delete current.publishedAt
  delete baseline.revision;delete baseline.publishedAt
  for(const data of [current,baseline]) for(const house of data.houses) delete house.price
  assert.equal(current.documents.find(d=>d.id==='standard').version,'1.0')
  assert.equal(current.documents.find(d=>d.id==='standard').updatedAt,'23.09.2026')
  // Authorized new PDF changes only its descriptive size/date; preserve all other business fields.
  for(const data of [current,baseline]) { const document=data.documents.find(d=>d.id==='standard');delete document.updatedAt;delete document.sizeLabel }
  assert.equal(current.contact.email,'mkdevelop2026@gmail.com')
  assert.equal(current.contact.emailHref,'mailto:mkdevelop2026@gmail.com')
  baseline.contact.email=current.contact.email;baseline.contact.emailHref=current.contact.emailHref
  assert.deepEqual(current,baseline)
})
for (const which of ['wewnetrzny','zewnetrzny']) test(`Spacer ${which}: wszystkie kadry, piny i współrzędne niezmienione`,()=>{
  assert.deepEqual(removeVersions(readJson(`public/assets/data/spacer-360-${which}.json`)), readJson(`tests/fixtures/tour-${which}.json`))
})
const badCases = [
  ['null',()=>null], ['tablica',()=>[]],
  ['prywatny CRM',d=>({...d,leads:[{name:'private'}]})],
  ['sekret SMTP',d=>({...d,smtpPassword:'do-not-export'})],
  ['brak domu',d=>{d.houses.pop();return d}],
  ['powtórzony dom',d=>{d.houses[1].id='A';return d}],
  ['nieistniejący dom',d=>{d.houses[1].id='F';return d}],
  ['cena ujemna',d=>{d.houses[0].price=-1;return d}],
  ['cena tekst',d=>{d.houses[0].price='779000';return d}],
  ['cena NaN',d=>{d.houses[0].price=NaN;return d}],
  ['niewłaściwy status',d=>{d.houses[0].status='available';return d}],
  ['etykieta poza obrazem',d=>{d.houses[0].mapLabel.x=101;return d}],
  ['nieprawidłowy mailto',d=>{d.contact.emailHref='mailto:someone@example.test';return d}],
  ['złośliwy protokół',d=>{d.houses[0].image='javascript:alert(1)';return d}],
  ['data URL',d=>{d.houses[0].image='data:image/svg+xml,<svg/>';return d}],
  ['zewnętrzny protokół-relative',d=>{d.houses[0].image='//evil.test/x.webp';return d}],
  ['traversal',d=>{d.houses[0].pdf='/documents/../api/config.php';return d}],
  ['traversal zakodowany',d=>{d.houses[0].pdf='/documents/%2e%2e/api/config.php';return d}],
  ['aktywny pusty dokument',d=>{d.documents[0].publicUrl='';return d}],
  ['dwie aktywne karty',d=>{d.documents.push({...d.documents[0],id:'duplicate'});return d}],
  ['brak etapu',d=>{d.schedule.pop();return d}],
  ['powtórzony etap',d=>{d.schedule[1].id='I';return d}],
  ['nieznany stan etapu',d=>{d.schedule[1].state='fake';return d}],
  ['niespójna liczba zdjęć',d=>{d.journal=[{id:'x',date:'2026-09-18',title:'Test',description:'Test',photoCount:2,cover:'/assets/test.webp',coverAlt:'Test',photos:[]}];return d}],
]
for (const [name,mutate] of badCases) test(`Walidacja odrzuca: ${name}`,()=>assert.throws(()=>parseSiteData(mutate(fresh()))))
test('Dezaktywowany PDF nie pojawia się w linkach, wejście nie jest mutowane',()=>{
  const d=fresh(); d.documents[0].active=false
  const original=JSON.stringify(d); const resolved=resolveSiteDocuments(d)
  assert.equal(resolved.houses[0].pdf,''); assert.equal(JSON.stringify(d),original)
})
test('Nowa aktywna wersja PDF ma pierwszeństwo nad polem historycznym',()=>{
  const d=fresh();d.documents[0].publicUrl='/pdf/new-card-a.pdf'
  assert.equal(resolveSiteDocuments(d).houses[0].pdf,'/pdf/new-card-a.pdf')
})
test('Eksport produkcyjny nie zawiera prywatnych leadów, a zawiera publiczną historię cen',()=>{
  const result=parseSiteData(fresh()); assert.equal('leads' in result,false); assert.ok(result.houses.every(h=>Array.isArray(h.priceHistory) && Array.isArray(h.mandatoryPayments)))
})
test('Cennik używa dokładnej powierzchni użytkowej i wyliczalnej ceny brutto za m²',()=>{
  const result=parseSiteData(selling());
  for(const house of result.houses){ assert.equal(house.area,110.82); assert.ok(Number.isFinite(house.price/house.area)); assert.ok(house.price/house.area>0) }
})
test('Publikator dopisuje poprzednią cenę z poprawnymi datami i nie tworzy historii bez zmiany ceny',()=>{
  const before=selling(); const same=structuredClone(before); same.revision++; same.publishedAt='2026-09-18T12:00:00+02:00';
  assert.deepEqual(mergePublicPriceHistory(same,before).houses[0].priceHistory, before.houses[0].priceHistory);
  const changed=structuredClone(same); changed.houses[0].price+=10000; const merged=mergePublicPriceHistory(changed,before);
  assert.deepEqual(merged.houses[0].priceHistory[0],{price:before.houses[0].price,validFrom:before.publishedAt.slice(0,10).split('.').reverse().join('-'),validTo:'2026-09-18'});
  assert.doesNotThrow(()=>parseSiteData(merged));
})
test('Wersjonowanie URL nie zmienia identyfikatorów, etykiet i pinezek',()=>{
  const original=readJson('tests/fixtures/tour-wewnetrzny.json')
  assert.deepEqual(removeVersions(versionSiteData(original,assetVersions(join(root,'public')))), original)
})
test('Ten sam zasób ma tę samą wersję, zmieniona treść dostaje nowy URL',()=>{
  const dir=mkdtempSync(join(tmpdir(),'dnp-hash-'))
  try {
    mkdirSync(join(dir,'assets'),{recursive:true});writeFileSync(join(dir,'assets/test.webp'),'image-v1')
    const a=assetVersions(dir), b=assetVersions(dir)
    assert.deepEqual(a,b);writeFileSync(join(dir,'assets/test.webp'),'image-v2')
    const c=assetVersions(dir);assert.notEqual(a['/assets/test.webp'],c['/assets/test.webp'])
    const source='const image="/assets/test.webp"'
    const first=versionText(source,a),second=versionText(first,c)
    assert.equal((second.match(/\?v=/g)||[]).length,1);assert.notEqual(first,second)
  } finally {rmSync(dir,{recursive:true,force:true})}
})
test('Generator assetów jest idempotentny',()=>{
  const first=syncAssetVersions(root),second=syncAssetVersions(root)
  assert.equal(second.changed,0);assert.equal(first.release,second.release)
})
test('Rewalidacja zmiennych plików; immutable ograniczone do katalogu build',()=>{
  for(const url of ['/assets/images/dnp-masterplan.webp','/tour/spacer-360-player.js','/pdf/karta-dom-a.pdf'])assert.match(cacheControl(url),/no-cache/)
  for(const url of ['/index.html','/data/site-data.json','/assets/data/spacer-360-wewnetrzny.json','/api/contact.php'])assert.equal(cacheControl(url),'no-store')
  assert.match(cacheControl('/assets/build/index-abc12345.js'),/immutable/)
})
test('Publikator sprawdza wszystkie aktywne zasoby',()=>{
  const d=fresh();d.houses[0].image='/assets/missing.webp'
  assert.throws(()=>preparePublication(d,join(root,'public')),/Nie ma pliku/)
})
test('Publikacja: nowa rewizja, atomowy zapis, kopia poza public, rollback jawny',()=>{
  const dir=mkdtempSync(join(tmpdir(),'dnp-publish-'))
  try {
    cpSync(join(root,'public'),join(dir,'public'),{recursive:true})
    const input=join(dir,'incoming.json'), output=join(dir,'public/data/site-data.json')
    const d=fresh();d.revision++;d.houses[0].status='Sprzedany';writeFileSync(input,JSON.stringify(d))
    const before=readFileSync(output,'utf8')
    assert.equal(publishFile(input,{projectRoot:dir,checkOnly:true}).written,false)
    assert.equal(readFileSync(output,'utf8'),before)
    assert.equal(publishFile(input,{projectRoot:dir}).written,true)
    assert.equal(JSON.parse(readFileSync(output)).houses[0].status,'Sprzedany')
    assert.ok(existsSync(join(dir,'backups/site-data')));assert.ok(!existsSync(join(dir,'public/backups')))
    assert.throws(()=>publishFile(input,{projectRoot:dir}),/rewizja/)
    const good=readFileSync(output,'utf8');writeFileSync(input,'{"bad": true}')
    assert.throws(()=>publishFile(input,{projectRoot:dir}));assert.equal(readFileSync(output,'utf8'),good)
    writeFileSync(input,before);assert.equal(publishFile(input,{projectRoot:dir,allowRollback:true}).written,true)
    assert.throws(()=>publishFile(input,{projectRoot:dir,target:'../outside'}),/target/)
  }finally{rmSync(dir,{recursive:true,force:true})}
})

test('Generator rozpoznaje także ścieżki Windows',()=>{
 assert.equal(portablePath(String.raw`C:\projekty\dnp\public\tour\spacer-360-player.js`),'C:/projekty/dnp/public/tour/spacer-360-player.js')
})

// Run the real migration function from the native player, not a rewritten copy.
test('Stary szkic edytora: odświeżenie URL zdjęć bez utraty ręcznych pinezek',()=>{
 const source=readFileSync(join(root,'public/tour/spacer-360-player.js'),'utf8')
 const extract=name=>source.match(new RegExp(`^function ${name}\\([^]*?^}`, 'm'))?.[0]
 const validate=extract('validateConfig'), load=extract('loadEditorDraft')
 assert.ok(validate && load)
 const base=readJson('public/assets/data/spacer-360-wewnetrzny.json'), draft=structuredClone(base)
 draft.scenes[0].image=draft.scenes[0].image.split('?')[0]
 draft.scenes[0].hotspots[0].x=42.5;draft.scenes[0].hotspots[0].label='Moja pinezka'
 const returned=runInNewContext(`${validate}\n${load}\nloadEditorDraft(base)`, {
   base,editMode:true,EDIT_DRAFT_KEY:'test',TOUR_URLS:{interior:'in',exterior:'out'},
   console,localStorage:{getItem:()=>JSON.stringify(draft),removeItem:()=>assert.fail('Nie wolno kasować poprawnego szkicu')},
 })
 assert.equal(returned.scenes[0].image,base.scenes[0].image)
 assert.equal(returned.scenes[0].hotspots[0].x,42.5)
 assert.equal(returned.scenes[0].hotspots[0].label,'Moja pinezka')
 assert.equal(returned.scenes.length,30)
})
