import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const root = new URL('../', import.meta.url)
const read = file => readFileSync(new URL(file, root), 'utf8')
const hash = file => createHash('sha256').update(readFileSync(new URL(file, root))).digest('hex')
const cathedral = read('src/sections/CathedralCeiling/CathedralCeiling.tsx')
const geometry = read('src/styles/sections/cathedral-premium.css')
const bridges = read('src/styles/sections/flow-premium-bridges.css')

test('flow retains the original project interior and real map byte for byte', () => {
  assert.equal(hash('public/assets/images/spacer-360/interior/webp/int11c-idz-do-jadalni.webp'), 'ebd95fd4d4eaacba345abc74fdbf314c4216b844ffce45d9a96cfde7d15c9248')
  assert.equal(hash('public/assets/images/location-map.webp'), '165b294398bf3ee5750e8f8a4e1b05cd7ee877e14524710976e748d27c59742a')
  assert.ok(cathedral.includes('int11c-idz-do-jadalni.webp?v=ebd95fd4d4eaacba'))
})
test('the photograph and both outlines derive from one contour, not independent borders', () => {
  assert.equal((cathedral.match(/d=\{photoContour\}/g) || []).length, 3)
  assert.match(geometry, /clip-path: url\(#cathedral-photo-clip\)/)
  assert.match(geometry, /vector-effect: non-scaling-stroke/)
})
test('the garden is a full-width shaped ribbon with separate top and bottom curves', () => {
  assert.match(cathedral, /className="cathedral-premium__ribbon" viewBox="0 0 1648 200"/)
  assert.match(cathedral, /d=\{ribbonTop\}/)
  assert.match(cathedral, /d=\{ribbonBottom\}/)
  assert.match(geometry, /\.cathedral-premium__garden \{[^}]*width: 100%/)
  assert.ok(!geometry.includes('width: 64.2%'))
  assert.ok(!geometry.includes('1800px'))
})
test('scene and map share a static wrapper, preserving existing section offset navigation', () => {
  const app = read('src/app/App.tsx')
  assert.match(app, /<Layout \/>\s*<div className="residential-flow">\s*<CathedralCeiling \/>\s*<Location \/>\s*<\/div>/)
  assert.match(bridges, /\.residential-flow \{[^}]*position: static/)
  assert.match(bridges, /margin-top: calc\(var\(--flow-ribbon-height\) \* -\.59\)/)
})
test('actual text and accessible semantics remain HTML rather than a screenshot', () => {
  assert.ok(cathedral.includes('aria-labelledby="cathedral-ceiling-title"'))
  assert.ok(cathedral.includes('<strong>5,82<small> m</small></strong>'))
  assert.ok(cathedral.includes('Każdy z pięciu domów ma własną działkę'))
  assert.ok(cathedral.includes('Wizualizacja przykładowej aranżacji wnętrza'))
  assert.equal((cathedral.match(/<GardenPointIcon kind=/g) || []).length, 3)
  assert.ok(!cathedral.includes('dangerouslySetInnerHTML'))
  assert.match(geometry, /@media \(max-width: 600px\)/)
})
test('the Standard layer stays last and package/lockfile release versions stay synchronized', () => {
  assert.ok(read('src/styles/site.css').trim().endsWith("@import './sections/standard-editorial.css';"))
  const pkg = JSON.parse(read('package.json')), lock = JSON.parse(read('package-lock.json'))
  assert.match(pkg.version, /^5\.2\.0-rc\.\d+$/)
  assert.equal(lock.version, pkg.version)
  assert.equal(lock.packages[''].version, pkg.version)
  assert.deepEqual(pkg.dependencies, lock.packages[''].dependencies)
})
