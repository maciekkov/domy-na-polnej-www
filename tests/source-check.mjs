import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const read = (path) => readFileSync(resolve(root, path), 'utf8')
const has = (path) => existsSync(resolve(root, path))
const assert = (condition, message) => { if (!condition) throw new Error(message) }

const required = [
  'src/main.tsx', 'src/app/App.tsx',
  'src/components/navigation/Header.tsx', 'src/components/common/ConsentBanner.tsx',
  'src/components/house-selector/Masterplan.tsx',
  'src/sections/Hero/Hero.tsx', 'src/sections/Homes/Homes.tsx', 'src/sections/WhyHome/WhyHome.tsx',
  'src/sections/Location/Location.tsx', 'src/sections/Layout/Layout.tsx', 'src/sections/Gallery/Gallery.tsx',
  'src/sections/Gallery/GalleryLightbox.tsx', 'src/sections/Gallery/TourChoiceModal.tsx',
  'src/sections/Gallery/TourFrameModal.tsx', 'src/sections/Gallery/PanoramaModal.tsx',
  'src/sections/Standard/Standard.tsx', 'src/sections/SecurityProcess/SecurityProcess.tsx',
  'src/sections/Schedule/Schedule.tsx', 'src/sections/Journal/Journal.tsx', 'src/sections/Team/Team.tsx',
  'src/sections/FaqContact/FaqContact.tsx', 'src/sections/Footer/Footer.tsx',
  'src/pages/PrivacyPolicy.tsx', 'src/pages/CookiePolicy.tsx', 'src/pages/NotFound.tsx',
  'src/lib/analytics.ts', 'src/data/runtime/SiteDataProvider.tsx',
  'api/contact.php', 'api/analytics.php', 'api/config.example.php', 'api/.htaccess', 'api/data/.gitkeep',
  'scripts/prepare-dist.mjs', 'public/.htaccess', 'public/robots.txt', 'public/sitemap.xml',
  'public/assets/images/hero-all-houses.webp', 'public/assets/images/hero-front-photoreal.webp',
  'public/assets/images/dnp-masterplan.svg', 'public/assets/images/ui/masterplan-compass.png',
  'public/assets/images/location-map.webp', 'public/assets/images/layout/plan-2d-precise.webp',
  'public/assets/images/layout/plan-3d.webp', 'public/assets/images/neighborhood/panorama-360-grabik.webp',
  'public/assets/images/team/maciej-kowalski.webp', 'public/assets/images/team/mateusz-kempinski-site-manager-v108.webp',
  'public/assets/images/team/mr-atelier-portfolio-panel.webp',
  'public/documents/Domy_na_Polnej_Standard_Techniczny_1.0.pdf',
  ...['a','b','c','d','e'].map((id) => `public/pdf/karta-dom-${id}.pdf`),
]
required.forEach((path) => assert(has(path), `Brak wymaganego pliku: ${path}`))

for (const obsolete of [
  'public/assets/images/location-map.png',
  'public/assets/images/layout/plan-2d-precise.svg',
  'public/assets/images/masterplan.webp', 'public/assets/images/ui/masterplan-compass.webp',
  'public/assets/images/hero-desktop.webp', 'public/assets/images/hero-mobile.webp',
  'public/assets/images/spacer-360/exterior/originals', 'public/assets/images/schedule/originals',
  'public/assets/images/standard/originals',
]) assert(!has(obsolete), `Ciężki lub nieużywany asset nadal jest w paczce: ${obsolete}`)

assert(!has('api/config.php'), 'Prywatny api/config.php nie może być częścią paczki źródłowej')
assert(read('.gitignore').includes('api/config.php'), 'api/config.php nie jest chroniony przez .gitignore')

const pkg = JSON.parse(read('package.json'))
assert(pkg.scripts.build?.includes('scripts/prepare-dist.mjs'), 'Build nie przygotowuje kompletnego dist z API i stronami statycznymi')
assert(pkg.scripts['test:all']?.includes('test:visual'), 'Brak pełnego testu wizualnego w test:all')

const main = read('src/main.tsx')
assert(main.includes("route === '/polityka-prywatnosci'") && main.includes("route === '/polityka-cookies'"), 'Brak routingu stron prawnych')
assert(main.includes('isLocalHost') && main.includes("route === '/administrator'"), 'Panel demo nie jest ograniczony do hosta lokalnego')
assert(main.includes('<NotFound />'), 'Brak strony 404 dla nieznanej trasy')

const html = read('index.html')
for (const token of ['rel="canonical"', 'property="og:url"', 'name="twitter:card"', 'application/ld+json', 'hero-all-houses.webp']) assert(html.includes(token), `SEO: brak ${token}`)
assert(!html.includes('hero-desktop.webp') && !html.includes('hero-mobile.webp'), 'HTML nadal preloaduje stare obrazy Hero')
assert(read('public/robots.txt').includes('Sitemap: https://domynapolnej.pl/sitemap.xml'), 'robots.txt nie wskazuje sitemap.xml')
assert(read('public/.htaccess').includes('ErrorDocument 404 /404.html') && read('public/.htaccess').includes('R=404'), 'Routing Apache nie zapewnia prawdziwego 404')

const houses = read('src/data/houses.ts')
for (const id of ['A','B','C','D','E']) assert(houses.includes(`id: '${id}'`), `Brak domu ${id}`)

const app = read('src/app/App.tsx')
for (const component of ['<WhyHome />','<Location />','<Layout />','<Standard pdfUrl={data.standardPdf} />','<SecurityProcess />','<Schedule stages={data.schedule} />','<Journal entries={data.journal} />','<Team />','<Footer contact={data.contact} />']) assert(app.includes(component), `Brak sekcji w App: ${component}`)
assert(app.includes('trackPageView()'), 'Powracająca zaakceptowana sesja nie rejestruje page_view')

const header = read('src/components/navigation/Header.tsx')
assert(header.includes('Zadzwoń') && header.includes("track('phone_click')"), 'Header nie ma jednoznacznego CTA telefonicznego i trackingu')

const hero = read('src/sections/Hero/Hero.tsx')
assert(hero.indexOf('hero-all-houses.webp') < hero.indexOf('hero-front-photoreal.webp'), 'Hero nie startuje od zdjęcia całej inwestycji')
assert(hero.includes('prefers-reduced-motion') && hero.includes('heroSlides[activeSlide]'), 'Hero nie ogranicza renderu do aktywnego slajdu lub nie respektuje reduced motion')
assert(hero.includes('od 779 000 zł'), 'Cena wejściowa nie jest pokazana w Hero')

const masterplan = read('src/components/house-selector/Masterplan.tsx')
assert(masterplan.includes('dnp-masterplan.svg') && masterplan.includes('masterplan-compass.png'), 'Masterplan nie używa oryginalnego SVG i oryginalnego kompasu')
assert((masterplan.match(/^  [A-E]: 'M /gm) ?? []).length === 5, 'Masterplan nie ma pięciu ścieżek działek')

const why = read('src/sections/WhyHome/WhyHome.tsx')
assert(why.includes('Dom bez prowadzenia budowy samemu') && why.includes('określony standard'), 'Brak argumentu względem samodzielnej budowy')

const location = read('src/sections/Location/Location.tsx')
assert(location.includes('location-map.webp') && location.includes('loading="lazy"') && location.includes("track('directions_click')"), 'Lokalizacja nie jest zoptymalizowana lub nie ma trackingu trasy')

const layout = read('src/sections/Layout/Layout.tsx')
assert(layout.includes('plan-2d-precise.webp'), 'Rzut 2D nadal używa ciężkiego SVG')
assert(layout.includes('aria-controls="layout-plan-panel"') && layout.includes('ArrowRight') && layout.includes('tabIndex={mode === item.id ? 0 : -1}'), 'Zakładki rzutu nie mają pełnej obsługi klawiatury')

const gallery = read('src/sections/Gallery/Gallery.tsx')
assert(gallery.includes('aria-controls="gallery-panel"') && gallery.includes('onGalleryTabKeyDown'), 'Zakładki galerii nie mają pełnej obsługi klawiatury')
assert(gallery.includes("track('tour_engaged'"), 'Spacer 360 nie rejestruje faktycznego zaangażowania')
assert(gallery.includes("loading={index === 0 ? 'eager' : 'lazy'}"), 'Galeria nadal ładuje zbyt wiele zdjęć eager')
const tourChoice = read('src/sections/Gallery/TourChoiceModal.tsx')
const tourFrame = read('src/sections/Gallery/TourFrameModal.tsx')
assert(tourChoice.includes("event.key !== 'Tab'") && tourFrame.includes("event.key !== 'Tab'"), 'Modale spaceru nie mają focus-trapa')
assert(tourFrame.includes('12_000'), 'Brak progu zaangażowania spaceru 360')

const schedule = read('src/data/schedule.ts')
assert((schedule.match(/state: 'completed'/g) ?? []).length === 0, 'Harmonogram błędnie pokazuje etap zakończony')
assert((schedule.match(/state: 'current'/g) ?? []).length === 1 && (schedule.match(/state: 'planned'/g) ?? []).length === 4, 'Harmonogram nie ma stanu 0/1/4')

const journalData = read('src/data/journal.ts')
const journal = read('src/sections/Journal/Journal.tsx')
assert(journalData.includes('journalEntries: JournalEntry[] = []'), 'Dziennik zawiera fikcyjne wpisy')
assert(!journal.includes('journal-newsletter') && !journal.includes('localStorage'), 'Newsletter-demo nadal jest aktywny')
assert(journal.includes('Instagram'), 'Placeholder dziennika nie ma prawdziwego CTA')

const faq = read('src/data/faq.ts')
assert((faq.match(/\n    question:/g) ?? []).length === 17, 'FAQ powinno mieć dokładnie 17 aktualnych pytań')
const faqContact = read('src/sections/FaqContact/FaqContact.tsx')
for (const token of ['Inwestycja i dom','Zakup i formalności','Cena i bezpieczeństwo','aria-expanded','aria-controls','/polityka-prywatnosci','emailPattern']) assert(faqContact.includes(token), `FAQ/formularz: brak ${token}`)
assert(!faqContact.includes('faq-section__image'), 'FAQ nadal zawiera usunięte zdjęcie')

const styles = read('src/styles/globals.css')
assert(styles.includes('@media (min-width:880px) and (max-width:1100px)') && styles.includes('grid-template-columns: repeat(2,minmax(0,1fr)) !important'), 'FAQ nie przechodzi na 2 kolumny w 880–1100 px')
assert(styles.includes('.faq-item button { font-size: 12.5px;') && styles.includes('.contact-form label { font-size: 11px;'), 'Minimalna czytelność FAQ/formularza nie została poprawiona')
assert(styles.includes('.legal-page__footer'), 'Brak stylów stron prawnych')

const contact = read('src/data/contact.ts')
assert(contact.includes('biuro@domynapolnej.pl') && contact.includes('+48 455 563 962'), 'Kontakt nie jest spójny z wersją produkcyjną')
const fallback = read('src/data/runtime/fallback.ts')
assert(fallback.includes("publicUrl: '/polityka-prywatnosci/'") && fallback.includes("publicUrl: '/polityka-cookies/'"), 'Dokumenty prawne nie są aktywne w runtime')
const provider = read('src/data/runtime/SiteDataProvider.tsx')
assert(provider.includes("['localhost', '127.0.0.1', '::1']"), 'Dane demo administratora mogą wyciekać na produkcję')

const contactApi = read('api/contact.php')
for (const token of ["$_SESSION['dnp_contact_last']", "$data['website']", 'strip_tags', 'FILTER_VALIDATE_EMAIL', 'AUTH LOGIN']) assert(contactApi.includes(token), `Endpoint kontaktowy: brak ${token}`)
assert(!contactApi.includes('smtp.gmail.com') && !contactApi.includes('UZUPELNIJ_WYŁĄCZNIE_NA_SERWERZE'), 'Sekret/placeholder hasła nie powinien znajdować się w contact.php')
const configExample = read('api/config.example.php')
assert(configExample.includes('biuro@domynapolnej.pl') && configExample.includes('smtp.hostinger.com'), 'Przykład SMTP nie ma produkcyjnej domeny')
const analytics = read('src/lib/analytics.ts')
assert(analytics.includes('sessionStorage') && analytics.includes("navigator.sendBeacon('/api/analytics.php'"), 'Analityka nie jest first-party lub nie mierzy sesji poprawnie')
const analyticsApi = read('api/analytics.php')
assert(analyticsApi.includes("'tour_engaged'") && analyticsApi.includes('analytics-') && !analyticsApi.includes('REMOTE_ADDR') && !analyticsApi.includes('HTTP_USER_AGENT'), 'Endpoint analityki zbiera niewłaściwe dane lub nie obsługuje zdarzeń')

const footer = read('src/sections/Footer/Footer.tsx')
for (const token of ['/polityka-prywatnosci','/polityka-cookies','X-SMART DEVELOP sp. z o.o.','KRS 0001091198']) assert(footer.includes(token), `Footer: brak ${token}`)

function sizeOf(path) {
  const full = resolve(root, path)
  const stats = statSync(full)
  if (stats.isFile()) return stats.size
  return readdirSync(full).reduce((sum, child) => sum + sizeOf(`${path}/${child}`), 0)
}
const publicBytes = sizeOf('public')
assert(publicBytes < 40 * 1024 * 1024, `public jest nadal zbyt ciężki: ${(publicBytes/1024/1024).toFixed(1)} MB`)
assert(statSync(resolve(root, 'public/assets/images/location-map.webp')).size < 400_000, 'Mapa lokalizacji nadal jest za ciężka')

console.log(`PASS source-check V6: routing/404, API, first-party analytics, SEO, 17 FAQ, 0/1/4 harmonogram, dostępność, optymalizacja assetów (${(publicBytes/1024/1024).toFixed(1)} MB public)`) 
