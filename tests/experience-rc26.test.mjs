import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('raw equirectangular panorama belongs to its viewer, not the gallery/lightbox list', () => {
  assert.ok(!read('src/data/gallery.ts').includes('panorama-360-grabik.webp'))
  assert.ok(read('src/sections/Gallery/PanoramaModal.tsx').includes('panorama-360-grabik.webp'))
  assert.ok(existsSync(new URL('../public/assets/images/neighborhood/panorama-360-grabik.webp', import.meta.url)))
  assert.ok(read('src/sections/Gallery/Gallery.tsx').includes("useState<GalleryCategory>('neighborhood')"))
})
test('cathedral restores 5,82 m and the original rendering, without any layout CTA', () => {
  const source = read('src/sections/CathedralCeiling/CathedralCeiling.tsx')
  assert.match(source, /do 5,82 m/)
  assert.match(source, /<strong>5,82<small> m<\/small><\/strong>/)
  assert.ok(source.includes('int11c-idz-do-jadalni.webp?v=ebd95fd4d4eaacba'))
  assert.ok(!source.includes('Zobacz układ domu'))
  assert.ok(!source.includes('href="#uklad"'))
  assert.ok(!/5,5\b|5\.5\b/.test(source))
})
// RC29 replaces the obsolete rc.26 accordion/download-strip contract.
test('standard follows the approved two-panel layout with six native detail cards and one PDF', () => {
  const source = read('src/sections/Standard/Standard.tsx')
  assert.ok(source.includes('standard-section standard-editorial'))
  assert.ok(source.includes('className="std-highlights"'))
  assert.ok(source.includes('<details className="std-topic"'))
  assert.ok(source.includes('className="std-details"'))
  assert.ok(source.includes('className="std-pdf"'))
  assert.equal((source.match(/Pobierz pełny standard PDF/g) || []).length, 1)
  assert.match(source, /href=\{pdfUrl\} download/)
  assert.ok(source.includes('Przygotowanie PV nie obejmuje paneli fotowoltaicznych.'))
})
test('gallery refinements are retained; the dedicated RC29 standard CSS is the last layer', () => {
  const css = read('src/styles/sections/experience-polish.css')
  assert.match(css, /#spacer-360 \.immersive-card \{ height: 230px; min-height: 230px;/)
  const standard = read('src/styles/sections/standard-editorial.css')
  assert.ok(standard.includes('.std-details__grid { display: grid;'))
  assert.ok(read('src/styles/site.css').trim().endsWith("@import './sections/standard-editorial.css';"))
})
test('standard build still produces both public_html and private without replacing existing secrets', () => {
  const pkg=JSON.parse(read('package.json'))
  assert.ok(pkg.scripts.build.includes('vite build'))
  assert.ok(pkg.scripts.build.endsWith('node scripts/build-hosting.mjs'))
  assert.equal(pkg.scripts['build:hosting'], 'npm run build')
  const builder=read('scripts/build-hosting.mjs')
  assert.ok(builder.includes("resolve(hosting, 'public_html')"))
  assert.ok(builder.includes("resolve(hosting, 'private', 'dnp')"))
  assert.ok(builder.includes('if (!existsSync(configFile))'))
})
