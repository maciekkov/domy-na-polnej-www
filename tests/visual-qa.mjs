import { chromium } from 'playwright'

const customChromium = process.env.DNP_CHROMIUM_PATH
const browser = await chromium.launch(customChromium ? {
  headless: true,
  executablePath: customChromium,
  args: [
    '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
    '--single-process', '--no-zygote', '--disable-gpu', '--disable-software-rasterizer',
    '--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process',
  ],
} : { headless: true })
const errors = []

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    page: document.documentElement.scrollWidth,
  }))
  if (overflow.page > overflow.viewport + 1) {
    throw new Error(`${label}: poziomy overflow ${overflow.page}px przy viewport ${overflow.viewport}px`)
  }
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
  await assertNoHorizontalOverflow(page, 'desktop 1440')
  await page.screenshot({ path: 'qa/viewport-1440x900.png' })
  await page.locator('#dom').scrollIntoViewIfNeeded()
  await page.waitForTimeout(350)
  if (!(await page.locator('.why-home__visual img').evaluate((image) => image.complete && image.naturalWidth > 0))) {
    throw new Error('Obraz sekcji 03 nie został załadowany')
  }
  await page.locator('#lokalizacja').scrollIntoViewIfNeeded()
  await page.waitForTimeout(350)
  if (!(await page.locator('.location__route').getAttribute('href'))?.includes('google.com/maps')) {
    throw new Error('CTA lokalizacji nie prowadzi do mapy')
  }
  await page.locator('#uklad').scrollIntoViewIfNeeded()
  await page.waitForTimeout(350)
  await page.getByRole('button', { name: /Kuchnia/ }).first().click()
  if (!await page.locator('.room-panel').getByRole('heading', { name: /Kuchnia/ }).isVisible()) throw new Error('Wybór kuchni nie aktualizuje panelu')
  await page.getByRole('tab', { name: 'Strefy' }).click()
  if (!await page.locator('.interactive-plan').getAttribute('class').then((value) => value?.includes('interactive-plan--zones'))) throw new Error('Tryb Strefy nie jest aktywny')

  await page.locator('#galeria').scrollIntoViewIfNeeded()
  await page.waitForTimeout(350)
  await page.getByRole('tab', { name: 'Okolica' }).click()
  if (await page.locator('.editorial-gallery img').count() !== 5) throw new Error('Kategoria Okolica nie ma pięciu kadrów')
  const firstTile = page.locator('.gallery-tile').first()
  await firstTile.click()
  await page.locator('.gallery-lightbox').waitFor()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Escape')
  await page.locator('.gallery-lightbox').waitFor({ state: 'detached' })
  await page.getByRole('button', { name: /Rozpocznij spacer/ }).click()
  await page.locator('.tour-frame-modal iframe').waitFor()
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: 'Zamknij spacer' }).click()
  await page.locator('.tour-frame-modal').waitFor({ state: 'detached' })
  await page.getByRole('button', { name: /Otwórz panoramę/ }).click()
  await page.locator('.panorama-modal').waitFor()
  await page.waitForTimeout(900)
  await page.getByRole('button', { name: 'Zamknij panoramę' }).click()
  await page.locator('.panorama-modal').waitFor({ state: 'detached' })

  await page.locator('#standard').scrollIntoViewIfNeeded()
  await page.waitForTimeout(350)
  if (await page.locator('.standard-highlight').count() !== 8) throw new Error('Standard nie pokazuje ośmiu wyróżników')
  const pdfHref = await page.getByRole('link', { name: /Pobierz pełny standard PDF/ }).getAttribute('href')
  if (!pdfHref?.endsWith('.pdf')) throw new Error('Sekcja Standard nie ma działającego odnośnika PDF')
  await page.getByRole('button', { name: 'Instalacje' }).click()
  if (!await page.locator('#standard-panel-installations').isVisible()) throw new Error('Akordeon Standardu nie otwiera sekcji Instalacje')

  await page.locator('#bezpieczenstwo').scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  if (await page.locator('.safety-pillar').count() !== 3) throw new Error('Brak trzech mechanizmów ochrony zakupu')
  if (await page.locator('.purchase-timeline > li').count() !== 5) throw new Error('Proces zakupu nie ma pięciu kroków')
  await page.locator('#harmonogram').scrollIntoViewIfNeeded()
  await page.waitForTimeout(350)
  if (await page.locator('.schedule-stage').count() !== 5) throw new Error('Harmonogram nie ma pięciu etapów')
  if (await page.locator('.schedule-stage--completed').count() !== 2) throw new Error('Harmonogram: oczekiwano dwóch etapów zakończonych')
  if (await page.locator('.schedule-stage--current').count() !== 1) throw new Error('Harmonogram: oczekiwano jednego etapu aktualnego')
  if (await page.locator('.schedule-stage--planned').count() !== 2) throw new Error('Harmonogram: oczekiwano dwóch etapów planowanych')
  const scheduleCta = await page.getByRole('link', { name: /Zobacz postęp budowy/ }).getAttribute('href')
  if (scheduleCta !== '#dziennik') throw new Error('CTA harmonogramu nie przewija do dziennika')

  await page.locator('#dziennik').scrollIntoViewIfNeeded()
  await page.waitForTimeout(350)
  if (await page.locator('.journal-placeholder').count() !== 1) throw new Error('Dziennik nie ma uczciwego placeholdera przed startem budowy')
  await page.locator('#journal-email').fill('test@example.com')
  await page.locator('.journal-newsletter').getByRole('button', { name: /Zapisz się/ }).click()
  if (!await page.locator('.journal-newsletter [role="status"]').isVisible()) throw new Error('Newsletter nie potwierdza zapisu')

  await page.locator('#zespol').scrollIntoViewIfNeeded()
  await page.waitForTimeout(350)
  if (await page.locator('.team-card').count() !== 3) throw new Error('Zespół nie ma trzech kart')
  for (const image of await page.locator('.team-card__portrait img').all()) {
    if (!(await image.evaluate((node) => node.complete && node.naturalWidth > 0))) throw new Error('Nie załadowano materiału zespołu')
  }

  await page.locator('#faq').scrollIntoViewIfNeeded()
  await page.waitForTimeout(250)
  if (await page.locator('.faq-item').count() !== 10) throw new Error('FAQ nie ma dziesięciu pozycji')
  const secondFaq = page.locator('.faq-item').nth(1).getByRole('button')
  await secondFaq.click()
  if (await secondFaq.getAttribute('aria-expanded') !== 'true') throw new Error('Accordion FAQ nie otwiera wybranej pozycji')

  await page.locator('#kontakt').scrollIntoViewIfNeeded()
  await page.waitForTimeout(250)
  await page.locator('.contact-form').getByRole('button', { name: /Poproś o kontakt/ }).click()
  if (!await page.locator('.contact-form__status--error').isVisible()) throw new Error('Formularz nie pokazuje walidacji wymaganych pól')
  if (await page.locator('.site-footer').count() !== 1) throw new Error('Brak finalnego footera')

  await page.screenshot({ path: 'qa/full-stage-1440.png', fullPage: true })

  await page.locator('#domy').scrollIntoViewIfNeeded()
  await page.waitForTimeout(350)
  await page.locator('.masterplan').screenshot({ path: 'qa/masterplan-1440.png' })
  if (!(await page.locator('.site-header').getAttribute('class'))?.includes('site-header--scrolled')) {
    throw new Error('Header nie przeszedł w stan po scrollu')
  }

  const rowC = page.locator('.homes-table tbody tr').nth(2)
  await rowC.hover()
  if (!(await page.locator('.masterplan__polygons path').nth(2).getAttribute('class'))?.includes('is-active')) {
    throw new Error('Hover wiersza C nie podświetlił polygonu C')
  }

  const selectButton = rowC.getByRole('button', { name: 'Dom C' })
  await selectButton.click()
  if (!page.url().includes('dom=C')) throw new Error('Klik Dom C nie ustawił parametru URL')
  if (!await page.locator('.house-card').getByRole('heading', { name: 'Dom C' }).isVisible()) throw new Error('Karta nie pokazuje Domu C')
  if (await page.locator('.house-modal').count()) throw new Error('Boczny panel domu nie został usunięty')

  for (const viewport of [{ width: 1024, height: 768 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport)
    await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
    await assertNoHorizontalOverflow(page, `${viewport.width}x${viewport.height}`)
    await page.screenshot({ path: `qa/viewport-${viewport.width}x${viewport.height}.png` })
    await page.locator('#dom').scrollIntoViewIfNeeded()
    await page.waitForTimeout(250)
    await page.locator('#lokalizacja').scrollIntoViewIfNeeded()
    await page.waitForTimeout(250)
    await page.screenshot({ path: `qa/full-stage-${viewport.width}.png`, fullPage: true })
  }

  if (errors.length) throw new Error(errors.join('\n'))
  console.log('PASS: 1440/1024/390, sekcje 01–12 + footer, galeria, 360°, Standard, proces zakupu, harmonogram, placeholder dziennika, zespół i FAQ/formularz')
} finally {
  await browser.close()
}
