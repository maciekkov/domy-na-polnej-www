import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const read = (file) => readFileSync(resolve(root, file), 'utf8')
const css = read('src/styles/atmosphere.css')
const homes = read('src/sections/Homes/Homes.tsx')
const contact = read('src/sections/FaqContact/FaqContact.tsx')
const masterplan = read('src/components/house-selector/Masterplan.tsx')
const north = read('src/components/house-selector/NorthIndicator.tsx')

// 1. Old rejected botanical pass is gone.
for (const token of [
  'foliage-corner-natural', 'botanical-corner.svg', 'homes__foliage',
  'contact-section__botanical', 'olive-dry-bouquet', 'meadow-bottom-border'
]) {
  assert.ok(!css.includes(token), `Old decorative token remains in CSS: ${token}`)
  assert.ok(!homes.includes(token), `Old decorative token remains in Homes: ${token}`)
  assert.ok(!contact.includes(token), `Old decorative token remains in Contact: ${token}`)
}
assert.ok(!existsSync(resolve(root, 'public/assets/images/decor/foliage-corner-natural.webp')))
assert.ok(!existsSync(resolve(root, 'public/assets/images/botanical-corner.svg')))

// 2. New asset library exists. Meadow is available but intentionally not used in final placement.
for (const file of [
  'linden-corner.png', 'leafy-foreground.png', 'leaf-shadow.png',
  'journal-branch.png'
]) {
  assert.ok(existsSync(resolve(root, `public/assets/images/decor/${file}`)), `Missing new asset: ${file}`)
}
assert.ok(!existsSync(resolve(root, 'public/assets/images/decor/meadow-edge.png')), 'Rejected meadow strip should not ship in the final package')
assert.ok(!css.includes('meadow-edge.png'), 'No pasted grass strips')

// 3. Exactly five desktop accents and no hero decoration.
assert.match(css, /\.homes::after[\s\S]*linden-corner\.png/)
assert.match(css, /\.why-home::before[\s\S]*leafy-foreground\.png/)
assert.match(css, /\.standard-section::after[\s\S]*leaf-shadow\.png/)
assert.match(css, /\.journal-section::after[\s\S]*journal-branch\.png/)
assert.match(css, /\.contact-section::after[\s\S]*linden-corner\.png/)
assert.ok(!/\.hero[^\n{]*::(before|after)/.test(css), 'Hero should remain clean')

// 4. Decorations stay outside transactional components and do not block UI.
for (const forbiddenSelector of [
  '.house-card::', '.homes-table::', '.masterplan::before', '.contact-form::',
  '.standard-pdf-card::', '.button::'
]) {
  assert.ok(!css.includes(forbiddenSelector), `Decoration attached to UI element: ${forbiddenSelector}`)
}
const pointerNoneCount = (css.match(/pointer-events:\s*none;/g) || []).length
assert.ok(pointerNoneCount >= 5, 'Every decorative layer must ignore pointer events')

// 5. Mobile/tablet is clean.
assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.homes::after,[\s\S]*\.why-home::before,[\s\S]*\.standard-section::after,[\s\S]*\.journal-section::after,[\s\S]*\.contact-section::after[\s\S]*display:\s*none/)

// 6. Compass and parcel geometry are preserved.
assert.ok(masterplan.includes('<NorthIndicator />'))
assert.ok(north.includes('data-north-angle="135"'))
assert.ok(north.includes('>N</text>'))
const expectedPaths = {
  A: 'M 16.986914,159.70306 99.632655,157.63882 100.71588,69.089523 24.652886,71.731451 15.957816,159.73293 Z',
  B: 'M 99.632655,157.63882 183.3079,156.10816 177.3779,64.358625 100.71588,69.089523 Z',
  C: 'M 183.3079,156.10816 268.27871,154.52214 252.63147,61.257158 177.3779,64.358625 Z',
  D: 'M 268.27871,154.52214 349.68698,152.43317 324.58691,58.791667 252.63147,61.257158 Z',
  E: 'M 349.68698,152.43317 421.04979,150.65141 423.9343,53.871545 324.58691,58.791667 Z',
}
for (const [id, d] of Object.entries(expectedPaths)) assert.ok(masterplan.includes(d), `Parcel geometry changed: ${id}`)
assert.ok(masterplan.includes('viewBox="0 0 442.38331 248.97291"'))

console.log('PASS natural flow v4: old pass removed, five intentional accents, clean mobile, compass/masterplan preserved.')
