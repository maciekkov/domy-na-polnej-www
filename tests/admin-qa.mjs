import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const errors = []

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`) })
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  await page.goto('http://127.0.0.1:4173/administrator/', { waitUntil: 'networkidle' })
  await page.getByLabel('Login').fill('admin')
  await page.getByLabel('Hasło').fill('zle')
  await page.getByRole('button', { name: 'Zaloguj' }).click()
  await page.getByRole('alert').waitFor()
  await page.getByLabel('Hasło').fill('admin')
  await page.getByRole('button', { name: 'Zaloguj' }).click()
  await page.getByRole('heading', { name: 'Pulpit' }).waitFor()
  if (await page.locator('.admin-metric').count() !== 6) throw new Error('Pulpit nie ma sześciu KPI')
  await page.screenshot({ path: 'qa/admin-dashboard-1440x900.png', fullPage: true })

  for (const label of ['Domy i ceny', 'Budowa', 'Dokumenty', 'Zapytania', 'Analityka', 'Ustawienia']) {
    await page.locator('.admin-sidebar nav').getByRole('button', { name: label }).click()
    await page.getByRole('heading', { name: label, exact: true }).first().waitFor()
  }
  await page.getByLabel('Telefon').fill('+48 111 222 333')
  await page.getByRole('button', { name: 'Publikuj zmiany' }).click()
  await page.locator('.admin-notice.is-visible').waitFor()
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Tylko niezbędne' }).click().catch(() => undefined)
  if (!await page.locator('a[href="tel:+48111222333"]').first().isVisible()) throw new Error('Publikacja kontaktu nie dotarła na stronę publiczną')

  await page.goto('http://127.0.0.1:4173/administrator/', { waitUntil: 'networkidle' })
  await page.locator('.admin-sidebar nav').getByRole('button', { name: 'Domy i ceny' }).click()
  await page.getByRole('button', { name: 'Edytuj Dom A' }).click()
  await page.getByRole('dialog').waitFor()
  await page.keyboard.press('Escape')
  await page.getByRole('dialog').waitFor({ state: 'detached' })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('http://127.0.0.1:4173/administrator/', { waitUntil: 'networkidle' })
  const overflow = await page.evaluate(() => ({ viewport: innerWidth, page: document.documentElement.scrollWidth }))
  if (overflow.page > overflow.viewport + 1) throw new Error(`Panel ma poziomy overflow: ${JSON.stringify(overflow)}`)
  await page.getByRole('button', { name: 'Otwórz menu' }).click()
  if (!await page.locator('.admin-sidebar.is-open').isVisible()) throw new Error('Mobilne menu panelu nie otwiera się')
  await page.waitForTimeout(250)
  await page.screenshot({ path: 'qa/admin-mobile-390x844.png' })
  if (errors.length) throw new Error(errors.join('\n'))
  console.log('PASS: login, 7 modułów, publikacja runtime, modal/Escape i widok mobilny panelu')
} finally {
  await browser.close()
}
