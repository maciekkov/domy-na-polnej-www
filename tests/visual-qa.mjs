import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'

const BASE = 'http://127.0.0.1:4173'
mkdirSync('qa', { recursive: true })
if (!existsSync('dist/index.html')) throw new Error('Brak dist/index.html. Uruchom najpierw npm run build.')

let server = null
async function ensureServer() {
  try {
    const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(800) })
    if (res.ok) return
  } catch {}
  server = spawn(process.execPath, ['preview-server.mjs'], { stdio: ['ignore', 'pipe', 'pipe'] })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 180))
    try {
      const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(600) })
      if (res.ok) return
    } catch {}
  }
  throw new Error('Nie udało się uruchomić preview-server.mjs')
}

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => ({ viewport: innerWidth, page: document.documentElement.scrollWidth }))
  if (overflow.page > overflow.viewport + 1) throw new Error(`${label}: poziomy overflow ${JSON.stringify(overflow)}`)
}

await ensureServer()
const browser = await chromium.launch({ headless: true })
const errors = []
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })
  const page = await context.newPage()
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`) })
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Tylko niezbędne' }).click().catch(() => undefined)
  await assertNoHorizontalOverflow(page, '1440')

  if (await page.locator('.hero__media img').count() !== 1) throw new Error('Hero renderuje więcej niż jeden obraz jednocześnie')
  if (!await page.getByText('od 779 000 zł', { exact: true }).isVisible()) throw new Error('Hero nie pokazuje ceny wejściowej')

  await page.locator('#domy').scrollIntoViewIfNeeded()
  await page.waitForTimeout(250)
  if (await page.locator('.masterplan > img').first().getAttribute('src').then((v) => !v?.includes('dnp-masterplan.svg'))) throw new Error('Masterplan nie używa oryginalnego SVG')
  if (await page.locator('.masterplan__compass').getAttribute('src').then((v) => !v?.includes('masterplan-compass.png'))) throw new Error('Masterplan nie używa oryginalnego kompasu')
  if (await page.locator('.masterplan__polygons path').count() !== 5) throw new Error('Masterplan nie ma 5 działek')

  await page.locator('#uklad').scrollIntoViewIfNeeded()
  const layoutTab = page.getByRole('tab', { name: 'Układ' })
  await layoutTab.focus()
  await page.keyboard.press('ArrowRight')
  if (await page.getByRole('tab', { name: 'Strefy' }).getAttribute('aria-selected') !== 'true') throw new Error('Zakładki rzutu nie reagują na ArrowRight')

  await page.locator('#galeria').scrollIntoViewIfNeeded()
  const firstGalleryTab = page.getByRole('tab', { name: 'Na zewnątrz' }).first()
  await firstGalleryTab.focus()
  await page.keyboard.press('ArrowRight')
  const selectedGalleryTab = page.locator('.gallery-tabs [role="tab"][aria-selected="true"]')
  if (await selectedGalleryTab.count() !== 1) throw new Error('Galeria nie utrzymuje jednego aktywnego taba')
  await page.getByRole('button', { name: /Wybierz spacer/ }).click()
  await page.getByRole('button', { name: /Wejdź do spaceru/ }).click()
  await page.locator('.tour-frame-modal iframe').waitFor()
  await page.getByRole('button', { name: 'Zamknij spacer' }).click()
  await page.getByRole('button', { name: /Otwórz panoramę/ }).click()
  await page.locator('.panorama-modal').waitFor()
  await page.getByRole('button', { name: 'Zamknij panoramę' }).click()

  await page.locator('#harmonogram').scrollIntoViewIfNeeded()
  if (await page.locator('.schedule-stage--completed').count() !== 0) throw new Error('Harmonogram ma nieprawidłowy etap zakończony')
  if (await page.locator('.schedule-stage--current').count() !== 1) throw new Error('Harmonogram powinien mieć 1 etap aktualny')
  if (await page.locator('.schedule-stage--planned').count() !== 4) throw new Error('Harmonogram powinien mieć 4 etapy planowane')

  await page.locator('#dziennik').scrollIntoViewIfNeeded()
  if (await page.locator('.journal-placeholder').count() !== 1) throw new Error('Brak uczciwego placeholdera dziennika')
  if (await page.locator('.journal-newsletter').count() !== 0) throw new Error('Newsletter demo nadal jest widoczny')

  await page.locator('#faq').scrollIntoViewIfNeeded()
  if (await page.locator('.faq-item').count() !== 17) throw new Error('FAQ nie ma 17 pozycji')
  if (await page.locator('.faq-column').count() !== 3) throw new Error('FAQ nie ma 3 grup tematycznych')
  const firstFaq = page.locator('.faq-item').first().getByRole('button')
  if (await firstFaq.getAttribute('aria-expanded') !== 'false') throw new Error('FAQ nie startuje złożone')
  await firstFaq.click()
  if (await firstFaq.getAttribute('aria-expanded') !== 'true') throw new Error('FAQ nie rozwija odpowiedzi')

  await page.locator('#kontakt').scrollIntoViewIfNeeded()
  const form = page.locator('.contact-form')
  await form.getByLabel(/Imię/).fill('Jan')
  await form.getByLabel(/Telefon/).fill('123456789')
  await form.getByLabel(/E-mail/).fill('zly-email')
  const consent = form.locator('input[type="checkbox"]')
  await consent.nth(0).check(); await consent.nth(1).check()
  await form.getByRole('button', { name: /Poproś o kontakt/ }).click()
  if (!await form.getByText(/poprawny adres e-mail/i).isVisible()) throw new Error('Brak walidacji opcjonalnego e-maila')
  if (!await form.getByRole('link', { name: /polityką prywatności/i }).isVisible()) throw new Error('Zgoda nie linkuje do polityki prywatności')

  await page.screenshot({ path: 'qa/v6-full-1440.png', fullPage: true })

  await page.setViewportSize({ width: 1024, height: 768 })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await assertNoHorizontalOverflow(page, '1024')
  await page.locator('#faq').scrollIntoViewIfNeeded()
  const faqFont = parseFloat(await page.locator('.faq-item button').first().evaluate((node) => getComputedStyle(node).fontSize))
  const consentFont = parseFloat(await page.locator('.contact-form__consent').first().evaluate((node) => getComputedStyle(node).fontSize))
  if (faqFont < 12) throw new Error(`FAQ 1024 za mały font: ${faqFont}px`)
  if (consentFont < 10) throw new Error(`Zgody formularza 1024 za mały font: ${consentFont}px`)
  const columns = await page.locator('.faq-section__columns').evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').filter(Boolean).length)
  if (columns !== 2) throw new Error(`FAQ 1024 powinno mieć 2 kolumny, ma ${columns}`)
  await page.screenshot({ path: 'qa/v6-full-1024.png', fullPage: true })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await assertNoHorizontalOverflow(page, '390')
  await page.screenshot({ path: 'qa/v6-full-390.png', fullPage: true })

  for (const path of ['/polityka-prywatnosci', '/polityka-cookies']) {
    const response = await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
    if (response?.status() !== 200) throw new Error(`${path} nie zwraca HTTP 200`)
    if (!await page.locator('.legal-page h1').isVisible()) throw new Error(`${path}: brak treści strony prawnej`)
  }
  const notFound = await page.goto(`${BASE}/nie-istnieje-test-v6`, { waitUntil: 'networkidle' })
  if (notFound?.status() !== 404) throw new Error(`Nieznana ścieżka zwraca ${notFound?.status()}, oczekiwano 404`)

  if (errors.length) throw new Error(errors.join('\n'))
  console.log('PASS visual V6: 1440/1024/390, 17 FAQ, 0/1/4, Hero, formularz, modale, legal pages i prawdziwe 404')
} finally {
  await browser.close()
  if (server) server.kill('SIGTERM')
}
