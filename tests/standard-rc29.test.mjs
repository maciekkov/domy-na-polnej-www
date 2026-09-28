import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
const root = new URL('../', import.meta.url)
const read = p => readFileSync(new URL(p, root), 'utf8')
const source = read('src/sections/Standard/Standard.tsx')

test('RC29 preserves the Standard entry point and adds the two approved content blocks', () => {
  assert.ok(source.includes('export function Standard({ pdfUrl }: { pdfUrl: string })'))
  assert.ok(source.includes('id="standard"'))
  assert.ok(source.includes('aria-labelledby="standard-title"'))
  assert.ok(source.includes('aria-labelledby="standard-details-title"'))
  assert.ok(source.includes('To, co ważne,'))
  assert.ok(source.includes('Przemyślane rozwiązania'))
  assert.ok(read('src/app/App.tsx').includes('<Standard pdfUrl={data.standardPdf} />'))
})
test('RC29 has eight individual illustrations, three photos and a real book image within 300 kB', () => {
  const directory = new URL('public/assets/images/standard/editorial/', root)
  const files = readdirSync(directory)
  assert.equal(files.length, 14)
  for (const name of ['heat-pump','ventilation','floor-heating','blinds','windows','glazing','pv','fence','living','window-detail','heat-pump-detail','book-cover']) {
    assert.ok(source.includes(`/assets/images/standard/editorial/${name}.webp`))
    assert.ok(existsSync(new URL(`${name}.webp`, directory)))
  }
  assert.ok(files.reduce((sum,name) => sum + statSync(new URL(name, directory)).size, 0) < 300_000)
  assert.ok(!existsSync(new URL('public/assets/icons/standard-illustrations.webp', root)))
  assert.ok(!existsSync(new URL('public/assets/images/standard/standard-lifestyle.webp', root)))
})
test('RC29 uses native accessible detail cards, retaining every technical description', () => {
  assert.ok(source.includes('standardGroups.map'))
  assert.ok(source.includes('<details className="std-topic"'))
  assert.ok(source.includes('<summary aria-label='))
  assert.ok(source.includes('{item.lead}'))
  assert.ok(source.includes('{item.detail}'))
  assert.ok(!source.includes('dangerouslySetInnerHTML'))
  assert.ok(!source.includes('<canvas'))
})
test('RC29 links the unchanged PDF once and handles an unavailable document', () => {
  const data = JSON.parse(read('public/data/site-data.json'))
  const pathname = data.standardPdf.split('?')[0].replace(/^\//, '')
  assert.equal(pathname, 'documents/Domy_na_Polnej_Standard_Techniczny_1.0.pdf')
  const bytes = readFileSync(new URL(`public/${pathname}`, root))
  assert.equal(bytes.subarray(0, 5).toString(), '%PDF-')
  // Fingerprint of the original supplied RC28 PDF.
  assert.equal(createHash('sha256').update(bytes).digest('hex').slice(0,16), 'e4f52074798bd1f4')
  assert.equal((source.match(/Pobierz pełny standard PDF/g) || []).length, 1)
  assert.match(source, /href=\{pdfUrl\} download/)
  assert.ok(source.includes('Dokument w przygotowaniu'))
  assert.ok(!source.includes('<iframe') && !source.includes('<object'))
})
test('RC29 styles are isolated and last in the cascade, with phone and keyboard support', () => {
  const css = read('src/styles/sections/standard-editorial.css')
  assert.ok(css.includes('#standard.standard-editorial'))
  assert.ok(css.includes('repeat(4, minmax(0, 1fr))'))
  assert.ok(css.includes('repeat(3, minmax(0, 1fr))'))
  assert.ok(css.includes('@media (max-width: 599px)'))
  assert.ok(css.includes('repeat(2, minmax(0, 1fr))'))
  assert.ok(css.includes(':focus-visible'))
  assert.ok(css.includes('prefers-reduced-motion'))
  assert.ok(read('src/styles/site.css').trim().endsWith("@import './sections/standard-editorial.css';"))
})
