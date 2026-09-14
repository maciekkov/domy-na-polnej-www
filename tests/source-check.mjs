import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const required = [
  'src/components/navigation/Header.tsx',
  'src/sections/Hero/Hero.tsx',
  'src/sections/Homes/Homes.tsx',
  'src/sections/WhyHome/WhyHome.tsx',
  'src/sections/Location/Location.tsx',
  'src/sections/Layout/Layout.tsx',
  'src/sections/Gallery/Gallery.tsx',
  'src/sections/Gallery/GalleryLightbox.tsx',
  'src/sections/Gallery/TourFrameModal.tsx',
  'src/sections/Gallery/PanoramaModal.tsx',
  'src/sections/Standard/Standard.tsx',
  'src/sections/SecurityProcess/SecurityProcess.tsx',
  'src/sections/Schedule/Schedule.tsx',
  'src/sections/Journal/Journal.tsx',
  'src/data/schedule.ts',
  'src/data/journal.ts',
  'src/sections/Team/Team.tsx',
  'src/sections/FaqContact/FaqContact.tsx',
  'src/sections/Footer/Footer.tsx',
  'src/data/team.ts',
  'src/data/faq.ts',
  'src/data/contact.ts',
  'src/admin/AdminApp.tsx',
  'src/admin/demoStore.ts',
  'src/data/runtime/SiteDataProvider.tsx',
  'src/components/common/ConsentBanner.tsx',
  'public/assets/images/team/maciej-kowalski.webp',
  'public/assets/images/team/mateusz-kempinski-site-manager-v108.png',
  'public/assets/images/team/mr-atelier-portfolio-panel.png',
  'public/assets/images/team/mr-atelier-logo.png',
  'public/assets/images/botanical-corner.svg',
  'api/contact.php',
  'api/config.example.php',
  'src/data/houses.ts',
  'public/assets/images/hero-desktop.webp',
  'public/assets/images/masterplan.webp',
  'public/assets/images/dnp-masterplan.svg',
  'public/assets/images/why-home.webp',
  'public/assets/images/location-map.png',
  'public/assets/images/layout/plan.webp',
  'public/assets/images/gallery/front.webp',
  'public/tour/dnp-spacer-12-kadrow.html',
  'public/assets/images/neighborhood/panorama-360-grabik.webp',
  'public/assets/images/standard/standard-cover.webp',
  'public/documents/Domy_na_Polnej_Standard_Techniczny_1.0.pdf',
  ...['a', 'b', 'c', 'd', 'e'].map((id) => `public/pdf/karta-dom-${id}.pdf`),
]

for (const path of required) {
  if (!existsSync(resolve(root, path))) throw new Error(`Brak wymaganego pliku: ${path}`)
}

const houses = readFileSync(resolve(root, 'src/data/houses.ts'), 'utf8')
for (const id of ['A', 'B', 'C', 'D', 'E']) {
  if (!houses.includes(`id: '${id}'`)) throw new Error(`Brak domu ${id} w modelu danych`)
}
if (!houses.includes("status: 'Rezerwacja'")) throw new Error('Brak statusu Rezerwacja')

const header = readFileSync(resolve(root, 'src/components/navigation/Header.tsx'), 'utf8')
if (!header.includes('window.scrollY > 90')) throw new Error('Brak zmiany stanu headera po scrollu')
if (!header.includes('aria-expanded')) throw new Error('Brak dostępnego mobile menu')
if (!header.includes("href: '#lokalizacja', available: true")) throw new Error('Lokalizacja nie jest aktywna w headerze')

const app = readFileSync(resolve(root, 'src/app/App.tsx'), 'utf8')
if (!app.includes('<WhyHome />') || !app.includes('<Location />')) throw new Error('Sekcje 03–04 nie są podłączone')
if (!app.includes('<Layout />') || !app.includes('<Gallery selectedHouse={selectedId} />')) throw new Error('Sekcje 05–06 nie są podłączone')
if (!app.includes('<Standard pdfUrl={data.standardPdf} />') || !app.includes('<SecurityProcess />')) throw new Error('Sekcje 07–08 nie są podłączone')
if (!app.includes('<Schedule stages={data.schedule} />') || !app.includes('<Journal entries={data.journal} />')) throw new Error('Sekcje 09–10 nie są podłączone do runtime data')
if (!app.includes('<Team />') || !app.includes('<FaqContact selectedHouse={selectedId} contact={data.contact} />') || !app.includes('<Footer contact={data.contact} />')) throw new Error('Sekcje 11–12 lub footer nie są podłączone')

const layout = readFileSync(resolve(root, 'src/sections/Layout/Layout.tsx'), 'utf8')
if (!layout.includes('interactive-plan') || !layout.includes('role="tablist"')) throw new Error('Sekcja układu nie ma interaktywnego planu i trybów')

const gallery = readFileSync(resolve(root, 'src/sections/Gallery/Gallery.tsx'), 'utf8')
if (!gallery.includes('GalleryLightbox') || !gallery.includes('TourFrameModal') || !gallery.includes('PanoramaModal')) throw new Error('Galeria, spacer lub panorama nie są podłączone')
if (!gallery.includes('Dwa sposoby oglądania')) throw new Error('Spacer i panorama nie są rozdzielone opisowo')

const standard = readFileSync(resolve(root, 'src/data/standard.ts'), 'utf8')
if ((standard.match(/label:/g) ?? []).length < 8) throw new Error('Sekcja Standard nie ma ośmiu wyróżników')
if ((standard.match(/title:/g) ?? []).length < 6) throw new Error('Sekcja Standard nie ma sześciu grup akordeonu')

const process = readFileSync(resolve(root, 'src/data/purchaseProcess.ts'), 'utf8')
if (!process.includes('Mieszkaniowy rachunek powierniczy') || !process.includes('Deweloperski Fundusz Gwarancyjny')) throw new Error('Brak wymaganych mechanizmów ochrony zakupu')
if ((process.match(/id: '0[1-5]'/g) ?? []).length !== 5) throw new Error('Proces zakupu nie ma pięciu kroków')

const schedule = readFileSync(resolve(root, 'src/data/schedule.ts'), 'utf8')
if ((schedule.match(/state: 'completed'/g) ?? []).length !== 2) throw new Error('Harmonogram nie ma dwóch zakończonych etapów referencyjnych')
if (!schedule.includes("state: 'current'") || (schedule.match(/state: 'planned'/g) ?? []).length !== 2) throw new Error('Harmonogram nie odwzorowuje stanów zakończony / aktualny / planowany')

const journal = readFileSync(resolve(root, 'src/data/journal.ts'), 'utf8')
if (!journal.includes('journalEntries: JournalEntry[] = []')) throw new Error('Dziennik powinien startować bez fikcyjnych wpisów')

const journalSection = readFileSync(resolve(root, 'src/sections/Journal/Journal.tsx'), 'utf8')
if (!journalSection.includes('GalleryLightbox') || !journalSection.includes("params.set('wpis'") || !journalSection.includes('journal-placeholder')) throw new Error('Dziennik nie ma placeholdera lub obsługi przyszłych wpisów')

const team = readFileSync(resolve(root, 'src/data/team.ts'), 'utf8')
if (!team.includes('Maciej Kowalski') || !team.includes('Mateusz Kempiński') || !team.includes('Małgorzata Rusiniak')) throw new Error('Zespół nie korzysta z potwierdzonych danych projektowych')
if ((team.match(/\n    id: '/g) ?? []).length !== 3) throw new Error('Sekcja zespołu nie ma trzech potwierdzonych osób / kart')

const faq = readFileSync(resolve(root, 'src/data/faq.ts'), 'utf8')
if ((faq.match(/\n    question:/g) ?? []).length !== 10) throw new Error('FAQ nie ma dziesięciu pytań referencyjnych')
if (!faq.includes('Kiedy planowane jest zakończenie?') || !faq.includes('Jak zabezpieczony jest zakup?')) throw new Error('FAQ nie odwzorowuje wymaganych pytań')

const faqContact = readFileSync(resolve(root, 'src/sections/FaqContact/FaqContact.tsx'), 'utf8')
if (!faqContact.includes('selectedHouse') || !faqContact.includes("fetch('/api/contact.php'") || !faqContact.includes('contact-form__honeypot')) throw new Error('Formularz nie przejmuje domu albo nie ma endpointu/honeypotu')
if (!faqContact.includes('aria-expanded') || !faqContact.includes('aria-controls')) throw new Error('FAQ nie ma dostępnej semantyki accordionu')

const endpoint = readFileSync(resolve(root, 'api/contact.php'), 'utf8')
if (!endpoint.includes("$_SESSION['dnp_contact_last']") || !endpoint.includes("$data['website']") || !endpoint.includes('strip_tags')) throw new Error('Endpoint nie ma rate limitu, honeypotu lub sanityzacji')
if (endpoint.includes('smtp.gmail.com') || endpoint.includes('password =>')) throw new Error('Endpoint zawiera dane SMTP na sztywno')

const footer = readFileSync(resolve(root, 'src/sections/Footer/Footer.tsx'), 'utf8')
if (!footer.includes('Polityka prywatności') || !footer.includes('Dane dewelopera') || !footer.includes('BrandLogo')) throw new Error('Footer nie ma struktury dokumentów i marki')

const masterplan = readFileSync(resolve(root, 'src/components/house-selector/Masterplan.tsx'), 'utf8')
if (!masterplan.includes('dnp-masterplan.svg') || (masterplan.match(/^  [A-E]: 'M /gm) ?? []).length !== 5) throw new Error('Nowy masterplan nie ma obrazu i pięciu dokładnych ścieżek SVG')

const main = readFileSync(resolve(root, 'src/main.tsx'), 'utf8')
if (!main.includes("'/administrator'") || !main.includes("'/administracja'")) throw new Error('Brak tras panelu administratora')
const admin = readFileSync(resolve(root, 'src/admin/AdminApp.tsx'), 'utf8')
for (const module of ['Pulpit', 'Domy i ceny', 'Budowa', 'Dokumenty', 'Zapytania', 'Analityka', 'Ustawienia']) {
  if (!admin.includes(module)) throw new Error(`Brak modułu panelu: ${module}`)
}
if (!admin.includes("login === 'admin' && password === 'admin'")) throw new Error('Brak demonstracyjnego logowania admin/admin')
if (!admin.includes('Wysyłka produkcyjna') || !admin.includes('Zablokowana')) throw new Error('Panel nie komunikuje blokady wysyłki Gov Sync')

console.log('PASS: struktura 01–12 + panel administratora, runtime data, prywatność i formularz')
