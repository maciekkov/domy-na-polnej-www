import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

const BASE = 'http://127.0.0.1:4173'
if (!existsSync('dist/index.html')) throw new Error('Brak dist/index.html. Uruchom najpierw npm run build.')
let server = null
try { const r = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(700) }); if (!r.ok) throw new Error() } catch {
  server = spawn(process.execPath, ['preview-server.mjs'], { stdio: 'ignore' })
  for (let i=0;i<50;i++) { await new Promise((r)=>setTimeout(r,150)); try { if ((await fetch(`${BASE}/`)).ok) break } catch {} }
}

const browser = await chromium.launch({ headless: true })
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto(`${BASE}/administrator`, { waitUntil: 'networkidle' })
  await page.getByLabel('Login').fill('admin')
  await page.getByLabel('Hasło').fill('admin')
  await page.getByRole('button', { name: 'Zaloguj' }).click()
  await page.getByRole('heading', { name: 'Pulpit' }).waitFor()
  if (await page.locator('.admin-metric').count() !== 6) throw new Error('Panel demo nie ma 6 KPI')
  for (const label of ['Domy i ceny','Budowa','Dokumenty','Zapytania','Analityka','Ustawienia']) {
    await page.locator('.admin-sidebar nav').getByRole('button', { name: label }).click()
    await page.getByRole('heading', { name: label, exact: true }).first().waitFor()
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${BASE}/administrator`, { waitUntil: 'networkidle' })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  if (overflow > 1) throw new Error(`Panel demo ma poziomy overflow: ${overflow}px`)
  console.log('PASS admin demo V6: lokalny login, moduły i mobile; panel pozostaje wyłączony na produkcji')
} finally {
  await browser.close()
  if (server) server.kill('SIGTERM')
}
