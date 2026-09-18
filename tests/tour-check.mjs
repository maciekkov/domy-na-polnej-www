import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (file) => readFileSync(path.join(root, file), 'utf8')
const load = (file) => JSON.parse(read(file))
const configs = {
  interior: load('public/assets/data/spacer-360-wewnetrzny.json'),
  exterior: load('public/assets/data/spacer-360-zewnetrzny.json'),
}
const audit = load('docs/spacer-wnetrza/klasyfikacja.json')
let checks = 0
const check = (condition, message) => { assert.ok(condition, message); checks++ }
const graph = new Map()
for (const [mode, config] of Object.entries(configs)) {
  const ids = new Set(config.scenes.map(s => s.id))
  check(ids.size === config.scenes.length, `${mode}: identyfikatory są unikalne`)
  check(ids.has(config.startScene), `${mode}: prawidłowy początek`)
  for (const s of config.scenes) {
    const key = `${mode}:${s.id}`
    graph.set(key, s.hotspots.map(p => `${p.tour || mode}:${p.target}`))
    check(s.hotspots.length >= 1 && s.hotspots.length <= 8, `${key}: od 1 do 8 pinezek`)
    for (const field of ['image', 'thumb', 'fallbackImage']) {
      if (!s[field]) { check(field !== 'image' && mode !== 'interior', `${key}: wymagane ${field}`); continue }
      const file = path.resolve(root, 'public', s[field].split('?')[0].replace(/^\//, ''))
      check(file.startsWith(path.join(root, 'public') + path.sep) && existsSync(file), `${key}: istnieje ${field}`)
    }
    for (const points of [s.hotspots, s.fallbackHotspots || []]) {
      check(points.length <= 8, `${key}: limit pinezek / fallback`)
      for (const p of points) {
        check(Number.isFinite(p.x) && p.x >= 0 && p.x <= 100 && Number.isFinite(p.y) && p.y >= 0 && p.y <= 100, `${key}: współrzędne`)
        const targets = configs[p.tour || mode]?.scenes || []
        check(targets.some(x => x.id === p.target), `${key}: cel ${p.target}`)
        check(typeof p.label === 'string' && p.label.length > 0, `${key}: podpis`)
      }
    }
    if (mode === 'interior') {
      check(['render','blender'].includes(s.sourceType), `${key}: oznaczenie źródła`)
      check(s.width > 0 && s.height > 0, `${key}: wymiary`)
      check(s.fallbackHotspots.length === s.hotspots.length, `${key}: spójne przejścia fallback`)
      check(s.hotspots.every((p,i) => p.target === s.fallbackHotspots[i].target), `${key}: zgodność celów fallback`)
    }
  }
  for (const room of config.rooms || []) check(ids.has(room.scene), `${mode}: pozycja menu ${room.title}`)
}
for (const start of graph.keys()) {
  const seen = new Set(), queue = [start]
  while (queue.length) { const id = queue.shift(); if (seen.has(id)) continue; seen.add(id); queue.push(...graph.get(id)) }
  check(seen.size === graph.size, `Z ${start} da się dotrzeć do wszystkich ${graph.size} scen i wrócić`)
}
const interior = configs.interior
check(interior.scenes.length === interior.stats.scenes, 'Liczba kadrów zgodna ze statystykami')
check(interior.scenes.filter(s => s.sourceType === 'render').length === interior.stats.renders, 'Liczba renderów zgodna ze statystykami')
check(interior.scenes.filter(s => s.sourceType === 'blender').length === interior.stats.blender, 'Liczba szkiców zgodna ze statystykami')
check(interior.loop === false, 'Koniec strychu nie zapętla się skokiem do wejścia')
check(audit.sketches.length === 29, 'Sklasyfikowane wszystkie 29 szkiców')
check(audit.summary.inputRenderFiles === 20 && audit.summary.uniqueRenders === 18, 'pierwotny audyt: 20 plików, 18 unikalnych renderów')
check(interior.scenes.find(s => s.id.startsWith('int25-')).room === 'master-bath', 'Poprawna klasyfikacja INT_25')
check(!interior.scenes.some(s => /^int(04|19|23|24|29)-/.test(s.id)), 'Odrzucone duplikujące/niespójne/zasłonięte kadry nie trafiają do głównej trasy')
for (const stem of ['wewnatrz','zewnatrz']) {
  const html = read(`public/tour/spacer-360-${stem}.html`)
  check(html.includes('spacer-360-zewnatrz.css') && html.includes('spacer-360-player.css'), `${stem}: ten sam interfejs`)
  check(read(`public/tour/spacer-360-${stem}.js`).replace(/\?v=[a-f0-9]{12,64}/g, '').includes("import './spacer-360-player.js'"), `${stem}: ten sam player`)
}
check(read('src/sections/Gallery/Gallery.tsx').includes("onChooseInterior={() => openTour('interior')}"), 'Wnętrze podłączone do galerii')
check(read('src/sections/Gallery/TourChoiceModal.tsx').includes('onClick={onChooseInterior}'), 'Przycisk wnętrza aktywny')
check(read('src/data/tours.ts').includes('interiorTour.scenes.length'), 'Liczba kadrów pochodzi z danych')
check(read('public/tour/spacer-360-wewnatrz.html').includes('id="tourDisclaimer"'), 'Wnętrze: komunikat wejściowy')
check(read('public/tour/spacer-360-zewnatrz.html').includes('id="tourDisclaimer"'), 'Zewnątrz: komunikat wejściowy')
check(read('public/tour/spacer-360-player.js').includes('frame.width / currentImage.width'), 'Pinezki liczone względem obrazu, nie ekranu')
console.log(`OK — ${checks} sprawdzeń danych i integracji. ${interior.scenes.length} wnętrz + ${configs.exterior.scenes.length} zewnętrznych; każda scena osiągalna z każdej innej.`)
