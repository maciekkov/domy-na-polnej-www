// Run after npm run build. Uses the normal local HTTP preview, without test-only
// source transforms. Local/offline audit results are recorded separately.
import assert from 'node:assert/strict'
import { expect } from '@playwright/test'
import { browser, startServer, noOverflow } from './browser-utils.mjs'
const server = await startServer()
const chrome = await browser()
try {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    const page = await chrome.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' })
    try {
      await page.goto(server.url, { waitUntil: 'networkidle' })
      const consent = page.getByRole('button', { name: 'Tylko niezbędne', exact: true })
      if (await consent.isVisible()) await consent.click()
      await noOverflow(page)
      await expect(page.locator('#galeria [role="tab"][aria-selected="true"]')).toHaveText('Okolica')
      await expect(page.locator('#wysoki-sufit')).toContainText('5,82')
      await expect(page.locator('#wysoki-sufit a')).toHaveCount(0)
      await expect(page.locator('#standard .std-highlight')).toHaveCount(8)
      await expect(page.locator('#standard .std-photo')).toHaveCount(3)
      await expect(page.locator('#standard .std-topic')).toHaveCount(6)
      await expect(page.locator('#standard .std-topic[open]')).toHaveCount(0)
      const metrics = await page.evaluate(() => {
        const bar = document.querySelector('.std-pdf').getBoundingClientRect()
        const grid = document.querySelector('.std-details__grid').getBoundingClientRect()
        return { bar: bar.width, grid: grid.width, cards: [...document.querySelectorAll('.immersive-card')].map(el => el.offsetHeight) }
      })
      assert.ok(width >= 1000 ? metrics.bar < metrics.grid * .5 : Math.abs(metrics.bar - metrics.grid) < 1)
      assert.ok(metrics.cards.every(height => height === (width <= 760 ? 250 : 230)))
      if (width === 1440) {
        await page.getByRole('button', { name: 'Zobacz całą galerię' }).click()
        await expect(page.locator('.gallery-lightbox')).toBeVisible()
        for (let i = 0; i < 4; i++) {
          const src = await page.locator('.gallery-lightbox img').getAttribute('src')
          assert.ok(!src.includes('panorama-360-grabik.webp'))
          await page.getByRole('button', { name: 'Następne zdjęcie', exact: true }).click()
        }
        await page.keyboard.press('Escape')
        await expect(page.locator('.gallery-lightbox')).toHaveCount(0)
        await page.getByRole('button', { name: 'Wybierz spacer', exact: true }).click()
        await expect(page.locator('.tour-choice-option--interior')).toBeVisible()
        await page.keyboard.press('Escape')
        await page.getByRole('button', { name: 'Otwórz panoramę', exact: true }).click()
        await expect(page.locator('.panorama-modal')).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(page.locator('.panorama-modal')).toHaveCount(0)
      }
      console.log(`PASS rc.26: ${width}px`)
    } finally { await page.close() }
  }
} finally {
  await chrome.close()
  server.child.kill()
}
