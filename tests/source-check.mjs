import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { inventory } from '../scripts/asset-inventory.mjs'
import { parseSiteData } from '../src/data/runtime/siteSchema.mjs'
if (!existsSync(resolve(import.meta.dirname,'../public/administrator-control/index.html'))) throw new Error('Brak produkcyjnego panelu kontroli serwera')
const root = resolve(import.meta.dirname, '..')
const read = path => readFileSync(resolve(root,path), 'utf8')
const has = path => existsSync(resolve(root,path))
let count = 0
const check = (condition,message) => { assert.ok(condition,message); count++ }
// Explicit contracts, not historical copies of implementation snippets.
export const required = [
  'src/main.tsx','src/app/App.tsx','src/data/runtime/SiteDataProvider.tsx',
  'src/data/runtime/demoMode.ts','src/data/runtime/siteSchema.mjs','public/data/site-data.json',
  'src/components/house-selector/Masterplan.tsx','src/sections/FaqContact/FaqContact.tsx',
  'src/sections/Layout/Layout.tsx','src/data/layoutRooms.ts','src/data/gallery.ts',
  'src/pages/PrivacyPolicy.tsx','src/pages/CookiePolicy.tsx','src/pages/NotFound.tsx',
  'api/contact.php','api/analytics.php','api/analytics-summary.php','api/gov-sync.php','api/gov-sync-cron.php','api/lib/gov-sync.php','api/config.example.php','api/.htaccess',
  'public/.htaccess','public/robots.txt','public/sitemap.xml','scripts/prepare-dist.mjs',
  'scripts/version-assets.mjs','scripts/publish-site-data.mjs','scripts/build-cache.htaccess',
  'public/assets/images/dnp-masterplan.webp','src/components/house-selector/NorthIndicator.tsx',
  'public/assets/images/layout/plan-2d-precise.webp','public/assets/images/layout/plan-3d.webp',
  'public/assets/images/neighborhood/panorama-360-grabik.webp',
  'public/tour/spacer-360-player.js','public/tour/spacer-360-player.css',
  ...['a','b','c','d','e'].map(id => `public/pdf/karta-dom-${id}.pdf`),
]
const obsolete = JSON.parse(read('docs/cleanup-six/removed-assets.json')).map(item => item.file)
check(!required.some(item => obsolete.includes(item)), 'Listy wymagane i usunięte muszą być rozłączne')
for (const file of required) check(has(file), `Brak ${file}`)
for (const file of obsolete) check(!has(file), `Powrócił nieużywany plik ${file}`)
check(!has('api/config.php'), 'Paczka nie może zawierać sekretów SMTP')
check(read('.gitignore').includes('api/config.php'), 'Brak wykluczenia sekretów')
const app = read('src/app/App.tsx'), main = read('src/main.tsx'), form = read('src/sections/FaqContact/FaqContact.tsx')
check(!/selectedId\s*\?\?\s*['"]A['"]/.test(app), 'Brak domyślnego Domu A')
check((app.match(/selectedId \?\? 'unknown'/g) || []).length === 2, 'Galeria i formularz otrzymują unknown')
check(form.includes('value="unknown"') && form.includes('onHouseChange(value)'), 'Formularz pozwala wycofać wybór')
check(app.includes("params.delete('dom')") && app.includes('isHouseId(initial)'), 'Synchronizacja wyboru z URL')
check(!/import\s+\{\s*recordDemoLead\s*\}\s+from/.test(form), 'Brak statycznego importu CRM demo')
check(form.includes('import.meta.env.DEV && demoAdminAllowed()') && form.includes('result.preview === true'), 'Demo i podgląd nie udają wysłania wiadomości')
check(!/import\s+\{\s*AdminApp\s*\}\s+from/.test(main) && main.includes('import.meta.env.DEV\n  ? lazy('), 'Admin nie może wejść do builda produkcyjnego')
check(read('src/data/runtime/demoMode.ts').includes("VITE_ENABLE_DEMO_ADMIN === 'true'"), 'Demo wymaga jawnego włączenia')
check(!main.includes("import './styles/admin.css'"), 'CSS administratora ładowany tylko z modułem demo')
const provider=read('src/data/runtime/SiteDataProvider.tsx')
check(provider.includes('fetch(SITE_DATA_URL') && provider.includes('parseSiteData(await response.json())'), 'Produkcja pobiera i waliduje JSON')
check(provider.includes('AbortController') && provider.includes('setError('), 'Błędy JSON/połączenia mają kontrolowany fallback')
check(read('src/admin/AdminApp.tsx').includes('Eksport danych produkcyjnych'), 'Publiczny eksport jest oddzielony od prywatnej kopii demo')
const content=parseSiteData(JSON.parse(read('public/data/site-data.json')))
check(content.houses.length===5 && content.schedule.length===5, 'Zachowane pięć domów i pięć etapów')
const masterplan=read('src/components/house-selector/Masterplan.tsx')
const fixture=JSON.parse(read('tests/fixtures/masterplan.json'))
check(masterplan.includes('dnp-masterplan.webp') && !masterplan.includes('dnp-masterplan.svg'), 'Tło nie jest już rastrem base64 wewnątrz SVG')
for (const [id,path] of Object.entries(fixture.paths)) check(masterplan.includes(`${id}: '${path}'`), `Geometria działki ${id} jest niezmieniona`)
check(masterplan.includes(`viewBox="${fixture.viewBox}"`), 'Ten sam viewBox')
check(masterplan.includes('width="1672" height="941"'), 'Te same proporcje bazowego obrazu')
check(statSync(resolve(root,'public/assets/images/dnp-masterplan.webp')).size<900_000,'Masterplan mieści się w budżecie 900 kB')
check(read('src/sections/Layout/Layout.tsx').includes('plan-2d-precise.webp'),'Rzut 2D używa aktywnego WebP')
const inv=inventory(root)
check(inv.missing.length===0, `Brakujące zasoby: ${JSON.stringify(inv.missing)}`)
check(inv.unused.length===0, `Nieodwoływane zasoby: ${JSON.stringify(inv.unused)}`)
// User-supplied 15-page raster PDF is an on-demand download, not a page-load asset.
const suppliedStandardBytes=statSync(resolve(root,'public/documents/Domy_na_Polnej_Standard_Techniczny_1.0.pdf')).size
check(inv.publicBytes-suppliedStandardBytes < 32*1024*1024,'Budżet zasobów bez pobieranego na żądanie standardu: 32 MiB')
check(suppliedStandardBytes < 30*1024*1024,'Budżet dostarczonego PDF standardu: 30 MiB')
const access=read('public/.htaccess')
check(access.includes('no-cache, max-age=0, must-revalidate') && access.includes('no-store'), 'Rewalidacja plików i brak starego JSON-a w cache')
check(!access.includes('2592000'), 'Usunięty 30-dniowy cache zmiennych plików')
check(read('scripts/build-cache.htaccess').includes('immutable'),'Długi cache wyłącznie dla hashowanych plików Vite')
check(read('scripts/prepare-dist.mjs').includes('scripts/build-cache.htaccess'), 'Build kopiuje właściwą politykę cache')
check(access.includes('R=404') && access.includes('ErrorDocument 404'),'Prawdziwy 404 zachowany')
for (const route of ['/polityka-prywatnosci','/polityka-cookies']) check(main.includes(route),`Routing ${route}`)
for (const token of ['rel="canonical"','property="og:url"','application/ld+json']) check(read('index.html').includes(token),`Zachowano SEO ${token}`)
check(JSON.parse(read('src/data/faq-content.json')).length===17, 'Nie zmieniono 17 pytań FAQ')
for (const field of ['galleryImages','layoutRooms']) {
  const text = read(field==='galleryImages' ? 'src/data/gallery.ts' : 'src/data/layoutRooms.ts')
  check(text.includes('spacer-360/interior/webp/'), `${field}: nadal nowy zestaw renderów`)
}
for (const token of ["dnpLimit($privateDir,'contact-send'","$data['website']",'FILTER_VALIDATE_EMAIL','AUTH LOGIN']) check((read('api/contact.php')+read('api/lib/smtp.php')).includes(token),`Zachowano zabezpieczenie kontaktu: ${token}`)
check(read('api/contact.php').includes("'unknown'"), 'Backend akceptuje brak wyboru domu')
const pkg=JSON.parse(read('package.json'))
check(pkg.scripts.prebuild.includes('version-assets.mjs') && pkg.scripts.build.includes('prepare-dist.mjs'),'Wersje zasobów powstają PRZED hashowaniem Vite')
console.log(`PASS source-check: ${count} warunków; ${(inv.publicBytes/1048576).toFixed(2)} MiB public; brak brakujących i nieodwoływanych zasobów.`)
