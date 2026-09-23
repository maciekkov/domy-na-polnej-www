/** Source-level regression checks. Run: node tests/aesthetic-flow-v2.mjs */
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { root } from '../scripts/asset-inventory.mjs'
import { join } from 'node:path'
const read = file => readFileSync(join(root, file), 'utf8')
const css = read('src/styles/atmosphere.css')
const homes = read('src/sections/Homes/Homes.tsx')
const masterplan = read('src/components/house-selector/Masterplan.tsx')
const north = read('src/components/house-selector/NorthIndicator.tsx')
assert.ok(!css.includes('!important'), 'No new CSS escalation')
for (const token of ['foliage-photo-blur', 'foliage-blur.svg', 'homes::before', 'gallery-section::before', 'section-heading::after']) {
  assert.ok(!css.includes(token), `Old decoration survived: ${token}`)
}
assert.ok(homes.includes('foliage-corner-natural.webp'))
assert.ok(existsSync(join(root, 'public/assets/images/decor/foliage-corner-natural.webp')))
assert.ok(!existsSync(join(root, 'public/assets/images/decor/foliage-photo-blur.png')))
assert.ok(!existsSync(join(root, 'public/assets/images/ui/dnp-compass-rose.svg')))
assert.ok(masterplan.includes('<NorthIndicator />'))
assert.ok(!masterplan.includes('masterplan__compass'))
assert.ok(!read('src/styles/sections/homes.css').includes('masterplan__compass'))
assert.ok(north.includes('data-north-angle="135"'))
assert.ok(north.includes('>N</text>'))
assert.ok(north.includes('role="img"') && north.includes('aria-label='))
const compassBlock = css.match(/\.masterplan > \.masterplan-north\s*\{([\s\S]*?)\}/)?.[1] ?? ''
assert.ok(!/(?:transform|rotate)\s*:/.test(compassBlock), 'No CSS transform can move the N away from its needle')
const angle = Math.atan2(49 - 31, -(49 - 31)) * 180 / Math.PI
assert.equal(angle, 135)
const expectedPaths = {
  A: 'M 16.986914,159.70306 99.632655,157.63882 100.71588,69.089523 24.652886,71.731451 15.957816,159.73293 Z',
  B: 'M 99.632655,157.63882 183.3079,156.10816 177.3779,64.358625 100.71588,69.089523 Z',
  C: 'M 183.3079,156.10816 268.27871,154.52214 252.63147,61.257158 177.3779,64.358625 Z',
  D: 'M 268.27871,154.52214 349.68698,152.43317 324.58691,58.791667 252.63147,61.257158 Z',
  E: 'M 349.68698,152.43317 421.04979,150.65141 423.9343,53.871545 324.58691,58.791667 Z',
}
for (const [id, d] of Object.entries(expectedPaths)) assert.ok(masterplan.includes(d), `Map geometry changed: ${id}`)
assert.ok(masterplan.includes('viewBox="0 0 442.38331 248.97291"'))
assert.ok(css.includes('width: 48px; height: 48px;'), '320px screen must have the small compass variant')
assert.ok(css.includes('pointer-events: none'))
assert.ok(css.includes('.homes__foliage { display: none; }'))
console.log('PASS natural flow v2: real corner asset, old layers removed, N=135°, no rotation, original polygons and mobile safeguards.')
