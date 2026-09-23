/** Regression checks for the editorial nature pass. */
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const read = (file) => readFileSync(resolve(root, file), 'utf8')
const css = read('src/styles/atmosphere.css')
const homes = read('src/sections/Homes/Homes.tsx')
const masterplan = read('src/components/house-selector/Masterplan.tsx')
const north = read('src/components/house-selector/NorthIndicator.tsx')

// No return of the rejected rectangular/blurred decoration.
for (const token of ['foliage-photo-blur', 'foliage-blur.svg']) {
  assert.ok(!css.includes(token), `Rejected blur asset returned: ${token}`)
}
assert.ok(homes.includes('foliage-corner-natural.webp'), 'Accepted Homes foliage missing')
assert.ok(existsSync(resolve(root, 'public/assets/images/decor/foliage-corner-natural.webp')))
assert.ok(existsSync(resolve(root, 'public/assets/images/botanical-corner.svg')))

// Three additional accents, deliberately dispersed across long-form sections.
assert.match(css, /\.why-home::before[\s\S]*botanical-corner\.svg/)
assert.match(css, /\.standard-section::before[\s\S]*foliage-corner-natural\.webp/)
assert.match(css, /\.journal-section::after[\s\S]*foliage-corner-natural\.webp/)
assert.ok(!css.includes('.layout-section::after'), 'Invisible Layout ornament should not return')
assert.ok((css.match(/pointer-events:\s*none;/g) || []).length >= 5, 'Decorations must never block UI')
assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.why-home::before,[\s\S]*\.standard-section::before,[\s\S]*\.journal-section::after[\s\S]*display:\s*none/)

// Compass and parcel geometry remain exactly as in v2.
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

console.log('PASS natural flow v3: dispersed accents, clean mobile, compass and masterplan preserved.')
