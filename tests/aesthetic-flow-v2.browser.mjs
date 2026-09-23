/** Full production browser regression, to run after npm ci && npm run build.
 * Unlike the isolated offline QA, this uses the project's normal Vite build and lucide-react.
 * Run: node tests/aesthetic-flow-v2.browser.mjs
 */
import { expect } from '@playwright/test'
import { browser, startServer, noOverflow } from './browser-utils.mjs'
const server = await startServer()
const chrome = await browser()
try {
  const context = await chrome.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  await context.addInitScript(() => localStorage.setItem('dnp-analytics-consent-v1', 'accepted'))
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(server.url, { waitUntil: 'networkidle' })
  await expect(page.locator('.plot-label.is-active')).toHaveCount(0)
  for (const [index, id] of [...'ABCDE'].entries()) {
    await page.locator('.plot-label').nth(index).click()
    await expect(page.locator('.house-card h3')).toHaveText(`Dom ${id}`)
    await expect(page.locator('.contact-form select')).toHaveValue(id)
    await expect(page).toHaveURL(new RegExp(`dom=${id}`))
  }
  await page.locator('.masterplan__polygons path').nth(2).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.house-card h3')).toHaveText('Dom C')
  for (const width of [320, 375, 390, 768, 1024, 1440, 1865]) {
    await page.setViewportSize({ width, height: 1000 })
    await noOverflow(page)
    const compass = page.locator('.masterplan-north')
    await expect(compass).toHaveAttribute('data-north-angle', '135')
    await expect(compass.locator('text')).toHaveText('N')
    const valid = await compass.evaluate(e => {
      const c = e.getBoundingClientRect(), m = e.closest('.masterplan').getBoundingClientRect()
      const overlaps = [...e.closest('.masterplan').querySelectorAll('path[role=button]')].some(p => {
        const r = p.getBoundingClientRect()
        return Math.min(r.right,c.right)>Math.max(r.left,c.left) && Math.min(r.bottom,c.bottom)>Math.max(r.top,c.top)
      })
      return !overlaps && c.left>=m.left && c.right<=m.right && c.top>=m.top && c.bottom<=m.bottom && getComputedStyle(e).transform==='none'
    })
    if (!valid) throw new Error(`Compass placement invalid at ${width}px`)
    if (width<=700) await expect(page.locator('.homes__foliage')).toBeHidden()
  }
  if (errors.length) throw new Error(errors.join('\n'))
  console.log('PASS production natural-flow v2: A–E, form sync, URL, keyboard, no overflow and compass placement 320–1865px.')
} finally {
  await chrome.close()
  server.child.kill('SIGTERM')
}
