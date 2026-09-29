// Run after npm ci && npm run build. Set DNP_QA_URL to check an existing local server.
// This test renders the complete application; it never substitutes a mock section.
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { browser, startServer } from './browser-utils.mjs'

const server = process.env.DNP_QA_URL ? null : await startServer('preview-server.mjs', 4173)
const url = process.env.DNP_QA_URL || server.url
const out = resolve(process.env.DNP_QA_OUTPUT || 'qa/rc36')
mkdirSync(out, { recursive: true })
const results = []
let instance
try {
  instance = await browser()
  for (const width of [320, 390, 768, 960, 1024, 1440, 1672, 1920, 2560]) {
    const page = await instance.newPage({ viewport: { width, height: width <= 600 ? 844 : 1080 }, isMobile: width <= 600, hasTouch: width <= 600, reducedMotion: 'reduce' })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(url, { waitUntil: 'networkidle' })
    const consent = page.getByRole('button', { name: 'Tylko niezbędne', exact: true })
    if (await consent.isVisible()) await consent.click()
    for (const selector of ['#uklad', '#wysoki-sufit', '#lokalizacja']) await page.locator(selector).scrollIntoViewIfNeeded()
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all([...document.querySelectorAll('#wysoki-sufit img, #lokalizacja img')].map(img => img.decode().catch(() => {})))
    })
    const geometry = await page.evaluate(() => {
      const rect = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height } }
      const cat = rect('#wysoki-sufit'), garden = rect('.cathedral-premium__garden'), location = rect('#lokalizacja')
      const image = document.querySelector('.cathedral-premium__photo img')
      return { cat, garden, location, bodyWidth: document.body.getBoundingClientRect().width,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        locationOffset: document.querySelector('#lokalizacja').offsetTop,
        imageWidth: image.naturalWidth, imageSource: image.getAttribute('src') }
    })
    assert.ok(geometry.overflow <= 1, `${width}: overflow`)
    assert.ok(Math.abs(geometry.cat.w - geometry.bodyWidth) < 1, `${width}: scene is not full bleed`)
    assert.ok(Math.abs(geometry.garden.w - geometry.bodyWidth) < 1, `${width}: ribbon is not full bleed`)
    assert.ok(geometry.location.y < geometry.cat.y + geometry.cat.h - 20, `${width}: map does not overlap`)
    assert.ok(Math.abs(geometry.locationOffset - geometry.location.y) <= 1, `${width}: section offset navigation changed`)
    assert.equal(geometry.imageWidth, 1672)
    assert.ok(geometry.imageSource.includes('int11c-idz-do-jadalni.webp'))
    const links = await page.locator('#lokalizacja a').evaluateAll(items => items.map(item => item.getAttribute('href')))
    assert.deepEqual(links, Array(2).fill('https://www.google.com/maps/search/?api=1&query=51.657611,15.086237'))
    // Geometry screenshot, before state-changing interaction checks.
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
    const top = Math.floor(geometry.cat.y - 135)
    await page.screenshot({ path: resolve(out, `flow-${width}.png`), fullPage: true, clip: { x: 0, y: top, width, height: Math.ceil(geometry.location.y + geometry.location.h - top) }, animations: 'disabled' })
    await page.locator('#layout-tab-layout').click()
    await page.locator('#layout-plan-panel path[aria-label^="Gabinet"]').first().focus()
    await page.keyboard.press('Enter')
    assert.ok((await page.locator('.room-panel h3').innerText()).includes('Gabinet'))
    await page.locator('#layout-tab-zones').click()
    await page.locator('.plan-zones button').first().click()
    assert.ok(await page.locator('#layout-plan-panel path.is-selected').count())
    await page.locator('#layout-tab-furniture').click()
    assert.ok((await page.locator('#layout-plan-panel > img').getAttribute('src')).includes('plan-3d.webp'))
    await page.locator('#layout-tab-layout').click()
    await page.evaluate(() => scrollTo({ top: document.querySelector('#lokalizacja').getBoundingClientRect().top + scrollY - 120, behavior: 'instant' }))
    await page.waitForTimeout(200)
    assert.equal(await page.locator('.site-header__nav a[href="#lokalizacja"]').getAttribute('aria-current'), 'location')
    assert.deepEqual(errors, [], `${width}: runtime errors`)
    results.push({ width, passed: true, geometry })
    console.log(`PASS flow RC36: ${width}px`)
    await page.close()
  }
  writeFileSync(resolve(out, 'results.json'), JSON.stringify(results, null, 2))
} finally {
  await instance?.close()
  server?.child.kill()
}
