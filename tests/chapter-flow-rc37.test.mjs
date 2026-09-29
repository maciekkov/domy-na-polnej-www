import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const root=new URL('../',import.meta.url)
const read=p=>readFileSync(new URL(p,root),'utf8')
const digest=s=>createHash('sha256').update(s).digest('hex')
const component=read('src/components/common/ChapterFlowEdge.tsx')
const css=read('src/styles/sections/chapter-flow.css')
const unchanged={
  "src/sections/Standard/Standard.tsx": "f339489c6788ed12aea45d50d390867cf1683e73bafadb8b4cfbbcb46cb1a076",
  "src/data/standard.ts": "709b76f4a8715756c3414d67d4bb60edf0da3f7d7c50dc5651d08caf5ab6cb34",
  "src/data/purchaseProcess.ts": "ea0f2877eb560957575e468f6f12fc158a2221ec986252486e1d8b29359e877b",
  "src/app/App.tsx": "daad024d51f6726815fbf75b26cf831af0d2fa564f05c434f26178fee6db72ce",
  "src/sections/CathedralCeiling/CathedralCeiling.tsx": "79ca46fc357adbc041d5bb2a7670c699bc23f6780acc2b5d442653be3ccde476",
  "src/styles/sections/flow-premium-bridges.css": "a32e2928f6bcc3b9ed23b27ef05a31b372636ba9b5bda8edce208f73f391ca97"
}
const logic={
  "src/sections/Gallery/Gallery.tsx": "a39b281d7534ff45b0cc027725e3d30b4ea6616a21bb4fffe3133323fe6baf50",
  "src/sections/SecurityProcess/SecurityProcess.tsx": "3075b6bdeb1a1f7d1d02c080da097c709c175ba494f1501e7753535e3e414657"
}

test('Standard content, project data and approved RC36 composition are byte-for-byte unchanged',()=>{
 for(const [p,hash] of Object.entries(unchanged))assert.equal(digest(readFileSync(new URL(p,root))),hash,p)
})
test('Gallery and Security behavior is identical after removing the decorative insertions',()=>{
 for(const [p,hash] of Object.entries(logic)){
  const oldCode=read(p).replace(/^import \{ ChapterFlowEdge \}[^\n]*\n/m,'').replace(/<ChapterFlowEdge variant="(?:explore|trust|process)" \/>/g,'').replace(/\s+/g,'')
  assert.equal(digest(oldCode),hash,p)
 }
})
test('Each approved boundary has exactly one decorative SVG instance',()=>{
 const g=read('src/sections/Gallery/Gallery.tsx'),s=read('src/sections/SecurityProcess/SecurityProcess.tsx')
 assert.equal((g.match(/<ChapterFlowEdge variant="explore"/g)||[]).length,1)
 assert.equal((s.match(/<ChapterFlowEdge variant="trust"/g)||[]).length,1)
 assert.equal((s.match(/<ChapterFlowEdge variant="process"/g)||[]).length,1)
 assert.equal((component.match(/<path /g)||[]).length,3)
 assert.match(component,/preserveAspectRatio="none"/)
})
test('Decorations are noninteractive and contain neither marketing text nor raster references',()=>{
 assert.match(component,/aria-hidden="true"/)
 assert.match(component,/focusable="false"/)
 assert.match(css,/pointer-events:\s*none/)
 assert.doesNotMatch(component,/<(?:img|button|a|text)[ >]/)
 assert.doesNotMatch(component,/onClick|dangerouslySetInnerHTML/)
})
test('Edges use percentage width and non-scaling gold strokes, not viewport-widening images',()=>{
 assert.match(css,/width:\s*100%/)
 assert.doesNotMatch(css,/100vw/)
 assert.match(css,/vector-effect:\s*non-scaling-stroke/)
 assert.match(css,/--chapter-paper:\s*#f8f6ef/)
})
test('No content is hidden to mimic the shorter generated reference',()=>{
 const screen=css.split('@media print')[0]
 assert.doesNotMatch(screen,/display:\s*none|visibility:\s*hidden/)
 assert.ok(read('src/sections/Standard/Standard.tsx').includes('Przemyślane rozwiązania'))
 assert.ok(read('src/sections/Standard/Standard.tsx').includes('std-scope-note'))
})
test('Phone and print variants preserve normal document flow',()=>{
 assert.match(css,/@media \(max-width: 599px\)/)
 assert.match(css,/@media print/)
 assert.match(css,/.chapter-flow-edge \{ display: none; \}/)
 assert.doesNotMatch(css,/margin-(?:top|bottom):\s*-/)
})
test('Release metadata is synchronized and the original Standard stylesheet stays last',()=>{
 const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json')),v=JSON.parse(read('VERSION.json'))
 assert.equal(p.version,'5.2.0-rc.37');assert.equal(l.version,p.version);assert.equal(l.packages[''].version,p.version)
 assert.equal(read('VERSION').trim(),p.version);assert.equal(v.version,p.version)
 assert.ok(read('src/styles/site.css').trim().endsWith("@import './sections/standard-editorial.css';"))
})
