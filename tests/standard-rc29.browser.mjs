// Run against the NORMAL built site: npm run build && npm run test:standard:browser.
// No source transforms or audit-only runtime are involved in this script.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { expect } from '@playwright/test'
import { browser, startServer, noOverflow } from './browser-utils.mjs'
const server = await startServer()
const chrome = await browser()
try {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    const page = await chrome.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', acceptDownloads: true })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    try {
      await page.goto(server.url, { waitUntil: 'networkidle' })
      const consent = page.getByRole('button', { name: 'Tylko niezbędne', exact: true })
      if (await consent.isVisible()) await consent.click()
      await page.locator('#standard').scrollIntoViewIfNeeded()
      await expect(page.locator('.std-highlight')).toHaveCount(8)
      await expect(page.locator('.std-photo')).toHaveCount(3)
      await expect(page.locator('.std-topic')).toHaveCount(6)
      await expect(page.locator('.std-topic[open]')).toHaveCount(0)
      await noOverflow(page)
      for (const summary of await page.locator('.std-topic summary').all()) {
        await summary.click()
        assert.notEqual(await summary.locator('..').getAttribute('open'), null)
        await summary.press('Enter')
        assert.equal(await summary.locator('..').getAttribute('open'), null)
      }
      await page.locator('.std-pdf').scrollIntoViewIfNeeded()
      for (const image of await page.locator('#standard img').all()) {
        await image.scrollIntoViewIfNeeded()
        await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0)).toBeTruthy()
      }
      const overflow = await page.locator('#standard').evaluate(root => [...root.querySelectorAll('.std-highlight,.std-topic,.std-pdf__button')].some(el => el.scrollWidth > el.clientWidth + 1))
      assert.equal(overflow, false)
      if (width === 1440) {
        const task = page.waitForEvent('download')
        await page.locator('.std-pdf__button').click()
        const downloaded = readFileSync(await (await task).path())
        const original = readFileSync(new URL('../public/documents/Domy_na_Polnej_Standard_Techniczny_1.0.pdf', import.meta.url))
        assert.deepEqual(downloaded, original)
      }
      assert.deepEqual(errors, [])
      console.log(`PASS Standard RC29: ${width}px`)
    } finally { await page.close() }
  }
} finally { await chrome.close(); server.child.kill() }
