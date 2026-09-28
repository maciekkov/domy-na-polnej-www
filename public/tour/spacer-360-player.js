/** Shared photograph-tour player. The same UI serves exterior and interior scenes.
 * Coordinates are percentages of the uncropped image (not the viewport).
 * No WebGL/panorama projection: these assets are ordinary perspective photographs.
 */
const $ = (id) => document.getElementById(id)
const mode = document.body.dataset.tourMode || 'exterior'
const DATA_URL = document.body.dataset.tourData
const TOUR_URLS = {
  interior: '/tour/spacer-360-wewnatrz.html',
  exterior: '/tour/spacer-360-zewnatrz.html',
}
const TOUR_DATA_URLS = {
  interior: '/assets/data/spacer-360-wewnetrzny.json',
  exterior: '/assets/data/spacer-360-zewnetrzny.json',
}
const DISCLAIMER_STORAGE_KEY = `dnp-tour-disclaimer:${mode}:session-v1`
const LEGACY_INTERIOR_ENTRY = 'int00-podcien-wejsciowy'
const INTERIOR_ENTRY = 'int01-wejscie-do-domu'
const EDIT_PARAMS = new URLSearchParams(location.search)
const editMode = EDIT_PARAMS.get('edit') === '1'
const EDIT_DRAFT_KEY = `dnp-tour-editor-draft:${mode}:v5`

function hasSeenDisclaimer() {
  try { return sessionStorage.getItem(DISCLAIMER_STORAGE_KEY) === '1' } catch { return false }
}

function markDisclaimerSeen() {
  try { sessionStorage.setItem(DISCLAIMER_STORAGE_KEY, '1') } catch {}
}
const app = $('tourApp')
const layers = [$('tourImageA'), $('tourImageB')]
const backdrop = $('tourBackdrop')
const hotspotsRoot = $('tourHotspots')
const thumbsRoot = $('tourThumbs')
const helpPanel = $('helpPanel')
const helpBtn = $('toggleHelp')
const fullscreenBtn = $('toggleFullscreen')
const prevBtn = $('prevScene')
const nextBtn = $('nextScene')
const title = $('sceneTitle')
const status = $('tourStatus')
const errorPanel = $('tourError')
const disclaimer = $('tourDisclaimer')
const disclaimerAccept = $('tourDisclaimerAccept')
const embedded = window.parent !== window
const imageCache = new Map()
let config, scenes = [], sceneMap = new Map()
let currentId = null, pendingId = null, activeLayer = 0, serial = 0
let currentImage = null, currentHotspots = []
let lastFailedId = null
let analyticsSceneId = null, analyticsSceneStartedAt = 0

function postTourAnalytics(type, payload = {}) {
  if (!embedded) return
  try { window.parent.postMessage({ type, mode, ...payload }, window.location.origin) } catch {}
}
function flushTourSceneAnalytics() {
  if (!analyticsSceneId || !analyticsSceneStartedAt) return
  const durationMs = Math.max(0, performance.now() - analyticsSceneStartedAt)
  if (durationMs >= 500) postTourAnalytics('dnp-tour:scene-time', { sceneId: analyticsSceneId, durationMs })
  analyticsSceneId = null; analyticsSceneStartedAt = 0
}
let editorSelectedIndex = null
let editorPanel = null
let editorTesting = false
let editorDrag = null
let editorStatusTimer = 0
let editorTargetPreviewSerial = 0
const editorTourCache = new Map()

const svg = (path) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`
const icons = {
  left: svg('<path d="M15 12H5m5-5-5 5 5 5"/>'),
  right: svg('<path d="M9 12h10m-5-5 5 5-5 5"/>'),
  forward: svg('<path d="M12 19V5m0 0-5 5m5-5 5 5"/>'),
  forwardLeft: svg('<path d="M7 17 17 7M7 7h10v10"/>'),
  forwardRight: svg('<path d="M17 17 7 7M7 17V7h10"/>'),
  up: svg('<path d="M12 19V5m0 0-5 5m5-5 5 5"/>'),
  upLeft: svg('<path d="M17 17 7 7M7 7h7M7 7v7"/>'),
  upRight: svg('<path d="M7 17 17 7M17 7h-7M17 7v7"/>'),
  down: svg('<path d="M12 5v14m0 0-5-5m5 5 5-5"/>'),
  downLeft: svg('<path d="M17 7 7 17M7 17h7M7 17v-7"/>'),
  downRight: svg('<path d="M7 7 17 17M17 17h-7M17 17v-7"/>'),
  move: svg('<path d="M6.75 17.25 17.25 6.75M8.75 6.75h8.5v8.5"/>'),
  back: svg('<path d="m9 7-5 5 5 5M4 12h10a5 5 0 0 1 5 5"/>'),
  backRight: svg('<path d="m15 7 5 5-5 5M20 12H10a5 5 0 0 0-5 5"/>'),
  turn: svg('<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>'),
  turnLeft: svg('<path d="M9 5a8 8 0 1 0 7 13M4 5v6h6"/>'),
  turnRight: svg('<path d="M15 5a8 8 0 1 1-7 13M20 5v6h-6"/>'),
  detail: svg('<path d="M12 5v14M5 12h14"/><circle cx="12" cy="12" r="9"/>'),
  help: svg('<path d="M12 18h.01M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4"/><circle cx="12" cy="12" r="9"/>'),
  fullscreen: svg('<path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"/>'),
  exitFullscreen: svg('<path d="M3 8h5V3M16 3v5h5M21 16h-5v5M8 21v-5H3"/>'),
  close: svg('<path d="m6 6 12 12M6 18 18 6"/>'),
  edit: svg('<path d="M4 20h4l11-11-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>'),
  save: svg('<path d="M5 4h12l2 2v14H5z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/>'),
  exterior: svg('<path d="M12 21v-5M5 16h14l-4-5h3l-6-8-6 8h3z"/>'),
  interior: svg('<path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-8h6v8"/>'),
}
icons.portal = icons.forward
prevBtn.innerHTML = icons.left
nextBtn.innerHTML = icons.right
helpBtn.innerHTML = icons.help
fullscreenBtn.innerHTML = icons.fullscreen
$('closeTour').innerHTML = icons.close
$('switchTour').innerHTML = icons[mode === 'interior' ? 'exterior' : 'interior']
$('switchTour').addEventListener('click', event => { if (embedded) { event.preventDefault(); window.location.replace(event.currentTarget.href) } })
$('switchTour').href = `${TOUR_URLS[mode === 'interior' ? 'exterior' : 'interior']}${editMode ? '?edit=1' : ''}`
$('switchTour').title = mode === 'interior' ? 'Spacer na zewnątrz' : 'Spacer we wnętrzu'
$('switchTour').setAttribute('aria-label', $('switchTour').title)
$('tourBrandEyebrow').textContent = `Grabik · ${mode === 'interior' ? 'wnętrze' : 'na zewnątrz'}`
$('helpHeading').textContent = `Spacer 360 · ${mode === 'interior' ? 'wnętrze' : 'na zewnątrz'}`
app.dataset.mode = mode

function adjacent(id, delta) {
  const index = scenes.findIndex((scene) => scene.id === id)
  if (index < 0) return scenes[0]?.id
  const next = index + delta
  if (config.loop === false && (next < 0 || next >= scenes.length)) return null
  return scenes[(next + scenes.length) % scenes.length].id
}

function readImage(src) {
  if (!src) return Promise.reject(new Error('Brak adresu obrazu'))
  if (imageCache.has(src)) return imageCache.get(src)
  const promise = new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    const timeout = window.setTimeout(() => fail(), 12000)
    const cleanup = () => { clearTimeout(timeout); image.onload = null; image.onerror = null }
    const fail = () => { cleanup(); imageCache.delete(src); reject(new Error(`Nie można wczytać obrazu: ${src}`)) }
    image.onload = async () => {
      if (!image.naturalWidth) { fail(); return }
      try { await image.decode() } catch { /* Some browsers decode during onload. */ }
      cleanup()
      resolve({ src, width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = fail
    image.src = src
  })
  imageCache.set(src, promise)
  return promise
}

async function resolveImage(scene) {
  try {
    return { ...(await readImage(scene.image)), fallback: false }
  } catch (error) {
    if (!scene.fallbackImage || scene.fallbackImage === scene.image) throw error
    return { ...(await readImage(scene.fallbackImage)), fallback: true }
  }
}

function preload(scene) {
  const ids = new Set([adjacent(scene.id, -1), adjacent(scene.id, 1)])
  scene.hotspots.forEach((point) => { if (!point.tour) ids.add(point.target) })
  ids.forEach((id) => {
    const target = sceneMap.get(id)
    if (target) readImage(target.image).catch(() => {})
  })
}

function setHelp(open) {
  helpPanel.hidden = !open
  helpBtn.setAttribute('aria-expanded', String(open))
}

function updateButtons() {
  prevBtn.disabled = !adjacent(pendingId || currentId, -1)
  nextBtn.disabled = !adjacent(pendingId || currentId, 1)
}

function renderThumbs(scene) {
  thumbsRoot.replaceChildren()
  const index = scenes.indexOf(scene)
  let indexes
  if (config.loop === false) {
    const start = Math.max(0, Math.min(index - 1, scenes.length - 3))
    indexes = Array.from({ length: Math.min(3, scenes.length) }, (_, i) => start + i)
  } else {
    indexes = [...new Set([index - 1, index, index + 1].map((i) => (i + scenes.length) % scenes.length))]
  }
  indexes.forEach((i) => {
    const item = scenes[i]
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `tour-thumb${item.id === scene.id ? ' is-active' : ''}`
    button.dataset.target = item.id
    button.setAttribute('aria-label', `Kadr ${i + 1}: ${item.title}`)
    if (item.id === scene.id) button.setAttribute('aria-current', 'true')
    const img = new Image()
    img.alt = ''
    img.decoding = 'async'
    img.src = item.thumb || item.image
    img.onerror = () => { img.onerror = null; img.src = item.fallbackImage || item.image }
    const caption = document.createElement('span')
    caption.className = 'tour-thumb__caption'
    const number = document.createElement('span')
    number.className = 'tour-thumb__index'
    number.textContent = String(i + 1).padStart(2, '0')
    const text = document.createElement('span')
    text.className = 'tour-thumb__title'
    text.textContent = item.title
    caption.append(number, text)
    button.append(img, caption)
    button.addEventListener('click', () => showScene(item.id))
    thumbsRoot.append(button)
  })
}

function followHotspot(point) {
  if (point.tour) {
    const base = TOUR_URLS[point.tour]
    if (base) window.location.replace(`${base}${editMode ? '?edit=1' : ''}#${encodeURIComponent(point.target)}`)
  } else {
    showScene(point.target, point.kind || 'fade')
  }
}

function renderHotspots(points) {
  hotspotsRoot.replaceChildren()
  hotspotsRoot.dataset.density = points.length >= 4 ? 'dense' : 'normal'
  points.forEach((point, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `tour-hotspot${editMode && !editorTesting && editorSelectedIndex === index ? ' is-editor-selected' : ''}`
    button.dataset.target = point.target
    button.dataset.kind = point.kind || 'move'
    button.dataset.pulse = String(Boolean(point.pulse))
    button.dataset.index = String(index)
    if (point.tour) button.dataset.tour = point.tour
    button.setAttribute('aria-label', point.label)
    const core = document.createElement('span')
    core.className = 'tour-hotspot__core'
    core.setAttribute('aria-hidden', 'true')
    const line = document.createElement('span')
    line.className = 'tour-hotspot__line'
    line.setAttribute('aria-hidden', 'true')
    const label = document.createElement('span')
    label.className = 'tour-hotspot__label'
    label.textContent = point.label
    button.append(core, line, label)

    if (editMode && !editorTesting) {
      button.title = 'Kliknij lub przeciągnij, aby edytować pineskę'
      button.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()
        selectEditorHotspot(index)
      })
      button.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return
        event.preventDefault()
        event.stopPropagation()
        selectEditorHotspot(index)
        editorDrag = { index, pointerId: event.pointerId, moved: false }
        button.setPointerCapture?.(event.pointerId)
        app.classList.add('is-editor-dragging')
      })
      button.addEventListener('pointermove', (event) => {
        if (!editorDrag || editorDrag.pointerId !== event.pointerId || editorDrag.index !== index) return
        const next = eventToImagePercent(event)
        if (!next) return
        editorDrag.moved = true
        point.x = next.x
        point.y = next.y
        positionHotspots()
        syncEditorCoordinates(point)
      })
      const finishDrag = (event) => {
        if (!editorDrag || editorDrag.pointerId !== event.pointerId || editorDrag.index !== index) return
        button.releasePointerCapture?.(event.pointerId)
        const moved = editorDrag.moved
        editorDrag = null
        app.classList.remove('is-editor-dragging')
        if (moved) saveEditorDraft('Pozycja pineski zapisana lokalnie')
      }
      button.addEventListener('pointerup', finishDrag)
      button.addEventListener('pointercancel', finishDrag)
    } else {
      button.addEventListener('click', () => followHotspot(point))
    }
    hotspotsRoot.append(button)
  })
  if (editMode) refreshEditorPanel()
}

function intersect(a, b, pad = 4) {
  return a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad
}

/** Pin cores never move to make labels fit. Only the labels can change sides. */
function positionHotspots() {
  if (!currentImage) return
  const width = app.clientWidth, height = app.clientHeight
  const appRect = app.getBoundingClientRect()
  const frame = layers[activeLayer].getBoundingClientRect()
  const fit = getComputedStyle(layers[activeLayer]).objectFit
  const scale = fit === 'cover' ? Math.max(frame.width / currentImage.width, frame.height / currentImage.height) : Math.min(frame.width / currentImage.width, frame.height / currentImage.height, fit === 'scale-down' ? 1 : Infinity)
  const picture = { width: currentImage.width * scale, height: currentImage.height * scale }
  picture.left = frame.left - appRect.left + (frame.width - picture.width) / 2
  picture.top = frame.top - appRect.top + (frame.height - picture.height) / 2
  // Public data attributes make geometric QA and future manual calibration possible.
  app.dataset.imageRect = JSON.stringify(picture)
  const buttons = [...hotspotsRoot.children]
  const centers = currentHotspots.map((point) => ({
    x: picture.left + picture.width * point.x / 100,
    y: picture.top + picture.height * point.y / 100,
  }))
  const radius = (buttons[0]?.querySelector('.tour-hotspot__core')?.getBoundingClientRect().width || 48) / 2
  buttons.forEach((button, i) => {
    button.style.left = `${centers[i].x}px`
    button.style.top = `${centers[i].y}px`
  })
  const occupied = centers.map(({x, y}) => ({left: x-radius-4, right: x+radius+4, top: y-radius-4, bottom: y+radius+4}))
  const ui = ['sceneTitle', 'tourBottom', 'tourTop', 'tourSource'].map($).filter((el) => el && !el.hidden).map((el) => el.getBoundingClientRect())
  buttons.forEach((button, i) => {
    const label = button.querySelector('.tour-hotspot__label')
    const line = button.querySelector('.tour-hotspot__line')
    label.style.visibility = 'visible'
    const w = label.offsetWidth, h = label.offsetHeight
    const {x, y} = centers[i]
    const preferred = currentHotspots[i].align === 'left' ? 'left' : 'right'
    const candidates = [preferred, preferred === 'left' ? 'right' : 'left', 'bottom', 'top'].flatMap((side, rank) => [0, -1, 1, -2, 2].map((verticalStep) => {
      let left = side === 'left' ? x-radius-14-w : side === 'right' ? x+radius+14 : x-w/2
      let top = side === 'bottom' ? y+radius+11 : side === 'top' ? y-radius-11-h : y-h/2
      top += verticalStep * (h + 10)
      left = Math.max(8, Math.min(width-w-8, left))
      top = Math.max(8, Math.min(height-h-8, top))
      const box = {left, top, right: left+w, bottom: top+h}
      const collisions = occupied.filter((other) => intersect(box, other)).length + ui.filter((other) => intersect(box, other)).length
      return {side, box, score: collisions*1000+rank+Math.abs(verticalStep)*5}
    }))
    const best = candidates.sort((a,b) => a.score-b.score)[0]
    const half = button.offsetWidth/2
    label.style.left = `${best.box.left-x+half}px`
    label.style.top = `${best.box.top-y+half}px`
    label.style.transform = 'none'
    label.style.right = 'auto'
    line.hidden = best.side === 'bottom' || best.side === 'top' || Math.abs((best.box.top + h/2)-y) > 10
    line.style.left = best.side === 'left' ? 'auto' : `${half+radius}px`
    line.style.right = best.side === 'left' ? `${half+radius}px` : 'auto'
    occupied.push(best.box)
  })
}


function sceneEnterDirection(kind) {
  if (['left','upLeft','downLeft','forwardLeft','turnLeft'].includes(kind)) return 'left'
  if (['right','upRight','downRight','forwardRight','turnRight'].includes(kind)) return 'right'
  if (['up','forward','move'].includes(kind)) return 'forward'
  if (kind === 'down') return 'down'
  return 'fade'
}

async function showScene(id, transitionKind = 'fade') {
  const scene = sceneMap.get(id)
  if (!scene || (currentId === id && !pendingId)) return
  if (editMode && currentId !== id) editorSelectedIndex = null
  const token = ++serial
  pendingId = id
  lastFailedId = null
  errorPanel.hidden = true
  app.setAttribute('aria-busy', 'true')
  app.classList.add('is-loading')
  status.textContent = `Wczytywanie: ${scene.title}`
  updateButtons()
  try {
    const loaded = await resolveImage(scene)
    if (token !== serial) return
    const nextIndex = activeLayer === 0 ? 1 : 0
    const nextLayer = layers[nextIndex]
    nextLayer.dataset.enter = sceneEnterDirection(transitionKind)
    nextLayer.src = loaded.src
    nextLayer.alt = `${scene.title}${scene.sourceType === 'blender' || loaded.fallback ? ' — szkic z Blendera' : ' — wizualizacja'}`
    try { await nextLayer.decode() } catch { /* Image was already verified by readImage. */ }
    if (token !== serial) return
    const restoreFocus = hotspotsRoot.contains(document.activeElement) || thumbsRoot.contains(document.activeElement) || helpPanel.contains(document.activeElement)
    layers[activeLayer].classList.remove('is-active')
    layers[activeLayer].setAttribute('aria-hidden', 'true')
    // Force the inactive transform to paint before the active state settles it to center.
    void nextLayer.offsetWidth
    nextLayer.classList.add('is-active')
    nextLayer.removeAttribute('aria-hidden')
    window.setTimeout(() => { if (nextLayer.classList.contains('is-active')) delete nextLayer.dataset.enter }, 420)
    activeLayer = nextIndex
    backdrop.style.backgroundImage = `url("${loaded.src}")`
    currentImage = loaded
    if (currentId && currentId !== id) flushTourSceneAnalytics()
    currentId = id
    analyticsSceneId = id; analyticsSceneStartedAt = performance.now()
    postTourAnalytics('dnp-tour:scene', { sceneId: id, title: scene.title })
    pendingId = null
    currentHotspots = editMode ? scene.hotspots : (loaded.fallback ? (scene.fallbackHotspots || scene.hotspots) : scene.hotspots)
    app.dataset.scene = id
    const index = scenes.indexOf(scene)
    $('sceneIndex').textContent = `${String(index+1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`
    $('sceneText').textContent = scene.title
    const sketch = scene.sourceType === 'blender' || loaded.fallback
    $('tourSource').hidden = mode !== 'interior'
    $('tourSource').dataset.kind = sketch ? 'blender' : 'render'
    $('tourSource').textContent = sketch ? (scene.room === 'attic' ? 'Szkic Blender · widok techniczny' : 'Szkic Blender · render do uzupełnienia') : 'Wizualizacja wnętrza'
    $('tourSource').title = scene.notice || (loaded.fallback ? 'Render jest niedostępny. Pokazano odpowiadający mu szkic.' : scene.roomLabel || scene.title)
    renderHotspots(currentHotspots)
    renderThumbs(scene)
    updateButtons()
    setHelp(false)
    const url = new URL(location.href)
    url.hash = scene.id
    history.replaceState(null, '', url)
    document.title = `Spacer 360 — ${scene.title} | Domy na Polnej`
    $('openSeparate').href = url.href
    positionHotspots()
    requestAnimationFrame(positionHotspots)
    if (restoreFocus) title.focus({preventScroll: true})
    preload(scene)
    status.textContent = ''
  } catch (error) {
    if (token !== serial) return
    lastFailedId = id
    pendingId = null
    $('tourErrorText').textContent = 'Nie udało się wczytać tego kadru. Sprawdź połączenie i spróbuj ponownie.'
    errorPanel.hidden = false
    status.textContent = ''
    updateButtons()
    console.warn('[Spacer]', error.message)
  } finally {
    if (token === serial) {
      app.setAttribute('aria-busy', 'false')
      app.classList.remove('is-loading')
    }
  }
}

function validateConfig(data) {
  if (!Array.isArray(data.scenes) || !data.scenes.length) throw new Error('Brak scen spaceru')
  const ids = new Set(data.scenes.map((scene) => scene.id))
  if (ids.size !== data.scenes.length) throw new Error('Powtórzone identyfikatory scen')
  if (!ids.has(data.startScene)) throw new Error('Nieprawidłowy początek spaceru')
  data.scenes.forEach((scene) => {
    if (!scene.title || !scene.image || !Array.isArray(scene.hotspots)) throw new Error('Nieprawidłowa scena')
    ;[scene.hotspots, scene.fallbackHotspots || []].flat().forEach((point) => {
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > 100 || point.y < 0 || point.y > 100) throw new Error('Nieprawidłowe współrzędne pineski')
      if (point.tour ? !TOUR_URLS[point.tour] : !ids.has(point.target)) throw new Error('Nieprawidłowy cel pineski')
    })
  })
}

function renderRoomMenu() {
  const root = $('roomMenu')
  const entries = config.rooms || []
  $('roomSection').hidden = entries.length === 0
  entries.forEach((room) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = room.title
    button.addEventListener('click', () => showScene(room.scene))
    root.append(button)
  })
}


const EDIT_DIRECTION_OPTIONS = [
  ['up', '↑ Góra'],
  ['upRight', '↗ Skos góra-prawo'],
  ['right', '→ Prawo'],
  ['downRight', '↘ Skos dół-prawo'],
  ['down', '↓ Dół'],
  ['downLeft', '↙ Skos dół-lewo'],
  ['left', '← Lewo'],
  ['upLeft', '↖ Skos góra-lewo'],
  ['forward', '↑ Góra (stary typ)'],
  ['forwardRight', '↗ Skos góra-prawo (stary typ)'],
  ['forwardLeft', '↖ Skos góra-lewo (stary typ)'],
  ['back', '↶ Nawrót w lewo'],
  ['backRight', '↷ Nawrót w prawo'],
  ['turnLeft', '↺ Obrót w lewo'],
  ['turnRight', '↻ Obrót w prawo'],
  ['turn', '↻ Obrót'],
  ['detail', '⊕ Detal / akcja'],
  ['portal', '↑ Przejście do drugiego spaceru'],
]

function cloneConfig(value) {
  return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value))
}

function loadEditorDraft(baseConfig) {
  if (!editMode) return baseConfig
  try {
    const raw = localStorage.getItem(EDIT_DRAFT_KEY)
    if (!raw) return baseConfig
    const draft = JSON.parse(raw)
    validateConfig(draft)
    const officialScenes = new Map(baseConfig.scenes.map(scene => [scene.id, scene]))
    if (mode === 'interior') {
      draft.scenes = draft.scenes.filter(scene => scene.id !== LEGACY_INTERIOR_ENTRY)
      draft.startScene = baseConfig.startScene
      draft.rooms = baseConfig.rooms
      draft.stats = baseConfig.stats
    }
    for (const scene of draft.scenes) {
      const official = officialScenes.get(scene.id)
      if (!official) continue
      for (const field of ['hotspots', 'fallbackHotspots']) {
        if (!Array.isArray(scene[field])) continue
        scene[field] = scene[field].map(point => {
          if (point.target !== LEGACY_INTERIOR_ENTRY || (point.tour && point.tour !== 'interior')) return point
          if (mode === 'interior' && scene.id === INTERIOR_ENTRY) {
            return {...point, tour: 'exterior', target: '04_podcien_wejsciowy'}
          }
          return {...point, target: INTERIOR_ENTRY}
        })
      }
      for (const field of ['image', 'thumb', 'fallbackImage']) {
        if (typeof scene[field] === 'string' && typeof official[field] === 'string'
          && scene[field].split('?')[0] === official[field].split('?')[0]) scene[field] = official[field]
      }
    }
    validateConfig(draft)
    return draft
  } catch (error) {
    console.warn('[Spacer editor] Nie udało się wczytać szkicu:', error.message)
    try { localStorage.removeItem(EDIT_DRAFT_KEY) } catch {}
    return baseConfig
  }
}

function editorMessage(message) {
  if (!editorPanel) return
  const el = editorPanel.querySelector('[data-editor-status]')
  if (!el) return
  el.textContent = message
  clearTimeout(editorStatusTimer)
  editorStatusTimer = window.setTimeout(() => {
    if (el.textContent === message) el.textContent = 'Zmiany robocze są zapisywane lokalnie.'
  }, 2600)
}

function saveEditorDraft(message = 'Zmiany zapisane lokalnie') {
  if (!editMode || !config) return
  try {
    localStorage.setItem(EDIT_DRAFT_KEY, JSON.stringify(config))
    editorMessage(message)
  } catch (error) {
    editorMessage('Nie udało się zapisać szkicu w tej przeglądarce.')
    console.warn('[Spacer editor]', error.message)
  }
}

function eventToImagePercent(event) {
  let picture
  try { picture = JSON.parse(app.dataset.imageRect || '') } catch { return null }
  if (!picture || !picture.width || !picture.height) return null
  const appRect = app.getBoundingClientRect()
  const x = ((event.clientX - appRect.left - picture.left) / picture.width) * 100
  const y = ((event.clientY - appRect.top - picture.top) / picture.height) * 100
  return {
    x: Math.max(0, Math.min(100, Math.round(x * 10) / 10)),
    y: Math.max(0, Math.min(100, Math.round(y * 10) / 10)),
  }
}

function currentEditorScene() {
  return currentId ? sceneMap.get(currentId) : null
}

function currentEditorPoint() {
  const scene = currentEditorScene()
  if (!scene || editorSelectedIndex == null) return null
  return scene.hotspots[editorSelectedIndex] || null
}

function syncEditorCoordinates(point) {
  if (!editorPanel || !point) return
  const x = editorPanel.querySelector('[data-editor-field="x"]')
  const y = editorPanel.querySelector('[data-editor-field="y"]')
  if (x && document.activeElement !== x) x.value = Number(point.x).toFixed(1)
  if (y && document.activeElement !== y) y.value = Number(point.y).toFixed(1)
}

function selectEditorHotspot(index) {
  if (!editMode || editorTesting) return
  const scene = currentEditorScene()
  if (!scene || !scene.hotspots[index]) return
  editorSelectedIndex = index
  ;[...hotspotsRoot.children].forEach((button, i) => button.classList.toggle('is-editor-selected', i === index))
  refreshEditorPanel()
}

function replaceCurrentHotspots() {
  const scene = currentEditorScene()
  if (!scene) return
  currentHotspots = scene.hotspots
  renderHotspots(currentHotspots)
  positionHotspots()
}

function downloadEditorConfig() {
  if (!config) return
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = mode === 'interior' ? 'spacer-360-wewnetrzny-EDYTOWANY.json' : 'spacer-360-zewnetrzny-EDYTOWANY.json'
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  editorMessage('Wyeksportowano JSON. Ten plik możesz później odesłać.')
}


async function getEditorTourScenes(route) {
  if (route === mode) return scenes
  if (!TOUR_DATA_URLS[route]) return []
  if (editorTourCache.has(route)) return editorTourCache.get(route)
  const promise = fetch(TOUR_DATA_URLS[route], { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return response.json()
    })
    .then((data) => Array.isArray(data.scenes) ? data.scenes : [])
    .catch((error) => {
      console.warn('[Spacer editor] Nie udało się pobrać scen drugiej trasy:', error.message)
      editorTourCache.delete(route)
      return []
    })
  editorTourCache.set(route, promise)
  return promise
}

function setEditorPreviewState({ title = 'Brak wybranego celu', meta = '', src = '', fallback = '' } = {}) {
  if (!editorPanel) return
  const root = editorPanel.querySelector('[data-editor-target-preview]')
  const image = editorPanel.querySelector('[data-editor-target-image]')
  const titleEl = editorPanel.querySelector('[data-editor-target-title]')
  const metaEl = editorPanel.querySelector('[data-editor-target-meta]')
  const empty = editorPanel.querySelector('[data-editor-target-empty]')
  if (!root || !image || !titleEl || !metaEl || !empty) return
  titleEl.textContent = title
  metaEl.textContent = meta
  if (!src) {
    image.removeAttribute('src')
    image.hidden = true
    empty.hidden = false
    return
  }
  image.hidden = false
  empty.hidden = true
  image.onerror = () => {
    image.onerror = null
    if (fallback && fallback !== src) image.src = fallback
    else {
      image.hidden = true
      empty.hidden = false
      empty.textContent = 'Podgląd obrazu jest niedostępny.'
    }
  }
  image.src = src
}

async function refreshEditorTargetPicker(point = currentEditorPoint()) {
  if (!editorPanel) return
  const currentSelect = editorPanel.querySelector('[data-editor-field="targetScene"]')
  const externalSelect = editorPanel.querySelector('[data-editor-field="targetExternalSelect"]')
  const legacyExternal = editorPanel.querySelector('[data-editor-field="targetExternal"]')
  const previous = editorPanel.querySelector('[data-editor-target-prev]')
  const next = editorPanel.querySelector('[data-editor-target-next]')
  const token = ++editorTargetPreviewSerial

  if (!point) {
    if (previous) previous.disabled = true
    if (next) next.disabled = true
    setEditorPreviewState()
    return
  }

  const route = point.tour || mode
  const targetScenes = await getEditorTourScenes(route)
  if (token !== editorTargetPreviewSerial || point !== currentEditorPoint()) return
  const activeSelect = route === mode ? currentSelect : externalSelect
  const inactiveSelect = route === mode ? externalSelect : currentSelect
  if (inactiveSelect) inactiveSelect.hidden = true
  if (legacyExternal) legacyExternal.hidden = true
  if (activeSelect) {
    activeSelect.hidden = false
    activeSelect.replaceChildren(...targetScenes.map((item) => {
      const option = document.createElement('option')
      option.value = item.id
      option.textContent = item.title
      option.selected = item.id === point.target
      return option
    }))
    if (point.target && !targetScenes.some((item) => item.id === point.target)) {
      const option = document.createElement('option')
      option.value = point.target
      option.textContent = `Nieznany kadr: ${point.target}`
      option.selected = true
      activeSelect.prepend(option)
    }
  }

  const index = targetScenes.findIndex((item) => item.id === point.target)
  const target = index >= 0 ? targetScenes[index] : null
  const canCycle = targetScenes.length > 1
  if (previous) previous.disabled = !canCycle
  if (next) next.disabled = !canCycle

  if (!target) {
    setEditorPreviewState({
      title: point.target ? `Nie znaleziono: ${point.target}` : 'Wybierz scenę docelową',
      meta: route === mode ? 'Ta trasa' : (route === 'interior' ? 'Spacer wewnętrzny' : 'Spacer zewnętrzny'),
    })
    return
  }

  const routeLabel = route === 'interior' ? 'Wnętrze' : 'Zewnątrz'
  setEditorPreviewState({
    title: target.title,
    meta: `${routeLabel} · kadr ${String(index + 1).padStart(2, '0')} / ${String(targetScenes.length).padStart(2, '0')} · ${target.id}`,
    src: target.thumb || target.image || target.fallbackImage || '',
    fallback: target.fallbackImage || target.image || '',
  })
}

async function cycleEditorTarget(delta) {
  const point = currentEditorPoint()
  if (!point) return
  const route = point.tour || mode
  const targetScenes = await getEditorTourScenes(route)
  if (!targetScenes.length || point !== currentEditorPoint()) return
  let index = targetScenes.findIndex((item) => item.id === point.target)
  if (index < 0) index = 0
  else index = (index + delta + targetScenes.length) % targetScenes.length
  point.target = targetScenes[index].id
  refreshEditorPanel()
  saveEditorDraft(`Wybrano kadr: ${targetScenes[index].title}`)
}

function refreshEditorPanel() {
  if (!editorPanel) return
  const scene = currentEditorScene()
  const point = currentEditorPoint()
  const sceneTitle = editorPanel.querySelector('[data-editor-scene]')
  const pinTitle = editorPanel.querySelector('[data-editor-pin-title]')
  const pinCount = editorPanel.querySelector('[data-editor-pin-count]')
  if (sceneTitle) sceneTitle.textContent = scene ? `${String(scenes.indexOf(scene) + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')} · ${scene.title}` : 'Brak sceny'
  if (pinCount) pinCount.textContent = scene ? `${scene.hotspots.length} pineszki` : '0 pineszek'
  if (pinTitle) pinTitle.textContent = point ? `Pineszka ${editorSelectedIndex + 1}` : 'Kliknij pineszkę na zdjęciu'

  const fieldset = editorPanel.querySelector('[data-editor-fields]')
  if (fieldset) fieldset.disabled = !point
  const remove = editorPanel.querySelector('[data-editor-remove]')
  const duplicate = editorPanel.querySelector('[data-editor-duplicate]')
  const go = editorPanel.querySelector('[data-editor-go]')
  if (remove) remove.disabled = !point
  if (duplicate) duplicate.disabled = !point
  if (go) go.disabled = !point
  if (!point) {
    refreshEditorTargetPicker(null)
    return
  }

  const label = editorPanel.querySelector('[data-editor-field="label"]')
  const kind = editorPanel.querySelector('[data-editor-field="kind"]')
  const align = editorPanel.querySelector('[data-editor-field="align"]')
  const pulse = editorPanel.querySelector('[data-editor-field="pulse"]')
  const targetTour = editorPanel.querySelector('[data-editor-field="tour"]')
  const targetScene = editorPanel.querySelector('[data-editor-field="targetScene"]')
  const targetExternal = editorPanel.querySelector('[data-editor-field="targetExternal"]')
  if (label && document.activeElement !== label) label.value = point.label || ''
  if (kind) kind.value = EDIT_DIRECTION_OPTIONS.some(([value]) => value === point.kind) ? point.kind : 'up'
  if (align) align.value = point.align || 'right'
  if (pulse) pulse.checked = Boolean(point.pulse)
  syncEditorCoordinates(point)

  const currentTourValue = point.tour || 'current'
  if (targetTour) targetTour.value = currentTourValue
  if (targetExternal) targetExternal.value = point.tour ? (point.target || '') : ''
  refreshEditorTargetPicker(point)
}

function setupEditor() {
  if (!editMode || editorPanel) return
  app.classList.add('is-editor-mode')
  document.body.classList.add('tour-editor-active')

  const editorToggle = document.createElement('button')
  editorToggle.type = 'button'
  editorToggle.className = 'tour-tool tour-editor-toggle'
  editorToggle.innerHTML = icons.edit
  editorToggle.title = 'Pokaż lub ukryj edytor pinesek'
  editorToggle.setAttribute('aria-label', editorToggle.title)
  $('tourTop').querySelector('.tour-tools')?.prepend(editorToggle)

  editorPanel = document.createElement('aside')
  editorPanel.className = 'tour-editor'
  editorPanel.setAttribute('aria-label', 'Edytor pinesek spaceru')
  editorPanel.innerHTML = `
    <div class="tour-editor__head">
      <div><span>TRYB DEMO · EDYCJA</span><strong data-editor-scene>Ładowanie…</strong></div>
      <button type="button" data-editor-hide aria-label="Ukryj panel">×</button>
    </div>
    <div class="tour-editor__toolbar">
      <button type="button" data-editor-add>+ Dodaj pin</button>
      <button type="button" data-editor-duplicate disabled>Duplikuj</button>
      <button type="button" data-editor-remove disabled>Usuń</button>
    </div>
    <div class="tour-editor__selection">
      <strong data-editor-pin-title>Kliknij pineszkę na zdjęciu</strong>
      <span data-editor-pin-count>0 pineszek</span>
      <small>Przeciągnij okrągłą pineszkę bezpośrednio po zdjęciu.</small>
    </div>
    <fieldset class="tour-editor__fields" data-editor-fields disabled>
      <label>Podpis
        <textarea rows="2" data-editor-field="label" placeholder="Np. Przejdź do\nsalonu"></textarea>
      </label>
      <label>Strzałka / symbol
        <select data-editor-field="kind">${EDIT_DIRECTION_OPTIONS.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select>
      </label>
      <div class="tour-editor__grid2">
        <label>X (%)<input type="number" min="0" max="100" step="0.1" data-editor-field="x"></label>
        <label>Y (%)<input type="number" min="0" max="100" step="0.1" data-editor-field="y"></label>
      </div>
      <div class="tour-editor__grid2">
        <label>Podpis po stronie
          <select data-editor-field="align"><option value="right">Prawej</option><option value="left">Lewej</option></select>
        </label>
        <label class="tour-editor__check"><input type="checkbox" data-editor-field="pulse"> Pulsowanie</label>
      </div>
      <label>Cel przejścia
        <select data-editor-field="tour">
          <option value="current">Ta trasa</option>
          <option value="interior">Spacer wewnętrzny</option>
          <option value="exterior">Spacer zewnętrzny</option>
        </select>
      </label>
      <div class="tour-editor__target-picker">
        <button type="button" class="tour-editor__target-arrow" data-editor-target-prev aria-label="Poprzedni kadr docelowy">←</button>
        <label>Scena docelowa
          <select data-editor-field="targetScene"></select>
          <select data-editor-field="targetExternalSelect" hidden></select>
          <input type="text" data-editor-field="targetExternal" placeholder="ID sceny drugiego spaceru" hidden>
        </label>
        <button type="button" class="tour-editor__target-arrow" data-editor-target-next aria-label="Następny kadr docelowy">→</button>
      </div>
      <div class="tour-editor__target-preview" data-editor-target-preview>
        <div class="tour-editor__target-preview-head">
          <span>Podgląd celu</span>
          <strong data-editor-target-title>Brak wybranego celu</strong>
          <small data-editor-target-meta></small>
        </div>
        <div class="tour-editor__target-preview-frame">
          <img data-editor-target-image alt="Podgląd kadru docelowego" hidden>
          <div data-editor-target-empty>Wybierz pineszkę, aby zobaczyć kadr docelowy.</div>
        </div>
      </div>
      <button class="tour-editor__go" type="button" data-editor-go disabled>Przejdź do celu / test</button>
    </fieldset>
    <div class="tour-editor__actions">
      <button type="button" data-editor-test>Test pinezek: WYŁ.</button>
      <button type="button" data-editor-export>Eksportuj JSON</button>
      <label class="tour-editor__import">Importuj JSON<input type="file" accept="application/json,.json" data-editor-import></label>
      <button type="button" data-editor-reset>Resetuj szkic</button>
    </div>
    <p class="tour-editor__status" data-editor-status>Zmiany robocze są zapisywane lokalnie.</p>
    <p class="tour-editor__hint">Po zakończeniu kliknij <strong>Eksportuj JSON</strong> i odeślij mi plik. Na jego podstawie złożę finalną paczkę.</p>
  `
  app.append(editorPanel)

  const showPanel = (show) => {
    editorPanel.hidden = !show
    app.classList.toggle('is-editor-panel-open', show)
    requestAnimationFrame(positionHotspots)
  }
  editorToggle.addEventListener('click', () => showPanel(editorPanel.hidden))
  editorPanel.querySelector('[data-editor-hide]')?.addEventListener('click', () => showPanel(false))

  editorPanel.querySelector('[data-editor-add]')?.addEventListener('click', () => {
    const scene = currentEditorScene()
    if (!scene) return
    const target = scenes.find((item) => item.id !== scene.id)?.id || scene.id
    scene.hotspots.push({ x: 50, y: 50, label: 'Nowa pineszka', kind: 'up', align: 'right', pulse: false, target })
    editorSelectedIndex = scene.hotspots.length - 1
    replaceCurrentHotspots()
    saveEditorDraft('Dodano pineszkę')
  })
  editorPanel.querySelector('[data-editor-duplicate]')?.addEventListener('click', () => {
    const scene = currentEditorScene(); const point = currentEditorPoint()
    if (!scene || !point) return
    const copy = { ...point, x: Math.min(100, Number(point.x) + 4), y: Math.min(100, Number(point.y) + 4) }
    scene.hotspots.splice(editorSelectedIndex + 1, 0, copy)
    editorSelectedIndex += 1
    replaceCurrentHotspots()
    saveEditorDraft('Zduplikowano pineszkę')
  })
  editorPanel.querySelector('[data-editor-remove]')?.addEventListener('click', () => {
    const scene = currentEditorScene()
    if (!scene || editorSelectedIndex == null) return
    scene.hotspots.splice(editorSelectedIndex, 1)
    editorSelectedIndex = scene.hotspots.length ? Math.min(editorSelectedIndex, scene.hotspots.length - 1) : null
    replaceCurrentHotspots()
    saveEditorDraft('Usunięto pineszkę')
  })

  const updateVisual = () => {
    const point = currentEditorPoint()
    if (!point || editorSelectedIndex == null) return
    const button = hotspotsRoot.children[editorSelectedIndex]
    if (!button) return
    button.dataset.kind = point.kind || 'move'
    button.dataset.pulse = String(Boolean(point.pulse))
    button.setAttribute('aria-label', point.label || 'Pineszka')
    const label = button.querySelector('.tour-hotspot__label')
    // Direction still controls the scene transition; every visual marker uses the same pin.
    if (label) label.textContent = point.label || ''
    positionHotspots()
  }

  editorPanel.querySelector('[data-editor-field="label"]')?.addEventListener('input', (event) => {
    const point = currentEditorPoint(); if (!point) return
    point.label = event.target.value
    updateVisual(); saveEditorDraft('Podpis zapisany lokalnie')
  })
  editorPanel.querySelector('[data-editor-field="kind"]')?.addEventListener('change', (event) => {
    const point = currentEditorPoint(); if (!point) return
    point.kind = event.target.value
    updateVisual(); saveEditorDraft('Kierunek przejścia zmieniony')
  })
  editorPanel.querySelector('[data-editor-field="align"]')?.addEventListener('change', (event) => {
    const point = currentEditorPoint(); if (!point) return
    point.align = event.target.value
    positionHotspots(); saveEditorDraft('Położenie podpisu zmienione')
  })
  editorPanel.querySelector('[data-editor-field="pulse"]')?.addEventListener('change', (event) => {
    const point = currentEditorPoint(); if (!point) return
    point.pulse = event.target.checked
    updateVisual(); saveEditorDraft('Animacja pineszki zmieniona')
  })
  ;['x', 'y'].forEach((field) => editorPanel.querySelector(`[data-editor-field="${field}"]`)?.addEventListener('input', (event) => {
    const point = currentEditorPoint(); if (!point) return
    const value = Math.max(0, Math.min(100, Number(event.target.value)))
    if (!Number.isFinite(value)) return
    point[field] = Math.round(value * 10) / 10
    positionHotspots(); saveEditorDraft('Współrzędne zapisane lokalnie')
  }))
  editorPanel.querySelector('[data-editor-field="tour"]')?.addEventListener('change', async (event) => {
    const point = currentEditorPoint(); if (!point) return
    const value = event.target.value
    if (value === 'current') delete point.tour
    else point.tour = value
    const route = point.tour || mode
    const targetScenes = await getEditorTourScenes(route)
    if (point !== currentEditorPoint()) return
    if (!targetScenes.some((item) => item.id === point.target)) point.target = targetScenes[0]?.id || ''
    refreshEditorPanel(); saveEditorDraft('Trasa docelowa zmieniona')
  })
  editorPanel.querySelector('[data-editor-field="targetScene"]')?.addEventListener('change', (event) => {
    const point = currentEditorPoint(); if (!point || (point.tour && point.tour !== mode)) return
    point.target = event.target.value
    refreshEditorTargetPicker(point)
    saveEditorDraft('Scena docelowa zmieniona')
  })
  editorPanel.querySelector('[data-editor-field="targetExternalSelect"]')?.addEventListener('change', (event) => {
    const point = currentEditorPoint(); if (!point || !point.tour) return
    point.target = event.target.value
    refreshEditorTargetPicker(point)
    saveEditorDraft('Scena docelowa drugiej trasy zmieniona')
  })
  editorPanel.querySelector('[data-editor-field="targetExternal"]')?.addEventListener('input', (event) => {
    const point = currentEditorPoint(); if (!point || !point.tour) return
    point.target = event.target.value.trim()
    refreshEditorTargetPicker(point)
    saveEditorDraft('ID sceny docelowej zapisane lokalnie')
  })
  editorPanel.querySelector('[data-editor-target-prev]')?.addEventListener('click', () => cycleEditorTarget(-1))
  editorPanel.querySelector('[data-editor-target-next]')?.addEventListener('click', () => cycleEditorTarget(1))
  editorPanel.querySelector('[data-editor-go]')?.addEventListener('click', () => {
    const point = currentEditorPoint(); if (!point) return
    if (point.tour) {
      const base = TOUR_URLS[point.tour]
      if (base && point.target) window.location.replace(`${base}?edit=1#${encodeURIComponent(point.target)}`)
    } else if (point.target) showScene(point.target)
  })
  editorPanel.querySelector('[data-editor-test]')?.addEventListener('click', (event) => {
    editorTesting = !editorTesting
    app.classList.toggle('is-editor-testing', editorTesting)
    event.currentTarget.textContent = `Test pinezek: ${editorTesting ? 'WŁ.' : 'WYŁ.'}`
    editorSelectedIndex = null
    replaceCurrentHotspots()
    editorMessage(editorTesting ? 'Test aktywny — pineszki działają jak w normalnym spacerze.' : 'Edycja aktywna — pineszki można przeciągać.')
  })
  editorPanel.querySelector('[data-editor-export]')?.addEventListener('click', downloadEditorConfig)
  editorPanel.querySelector('[data-editor-import]')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const imported = JSON.parse(await file.text())
      validateConfig(imported)
      localStorage.setItem(EDIT_DRAFT_KEY, JSON.stringify(imported))
      location.reload()
    } catch (error) {
      editorMessage(`Błąd importu: ${error.message}`)
    } finally {
      event.target.value = ''
    }
  })
  editorPanel.querySelector('[data-editor-reset]')?.addEventListener('click', () => {
    if (!window.confirm('Usunąć lokalne zmiany i wrócić do konfiguracji z paczki?')) return
    try { localStorage.removeItem(EDIT_DRAFT_KEY) } catch {}
    location.reload()
  })

  refreshEditorPanel()
}

async function closeTour() {
  flushTourSceneAnalytics()
  if (document.fullscreenElement) { try { await document.exitFullscreen() } catch {} }
  if (embedded) window.parent.postMessage({type: 'dnp-tour:close'}, window.location.origin)
  else window.location.assign('/#spacer-360')
}

function syncFullscreen() {
  const active = Boolean(document.fullscreenElement)
  fullscreenBtn.innerHTML = active ? icons.exitFullscreen : icons.fullscreen
  fullscreenBtn.setAttribute('aria-label', active ? 'Wyłącz pełny ekran' : 'Włącz pełny ekran')
  fullscreenBtn.title = fullscreenBtn.getAttribute('aria-label')
  requestAnimationFrame(positionHotspots)
}

if (disclaimer && disclaimerAccept) {
  const closeDisclaimer = () => {
    markDisclaimerSeen()
    disclaimer.hidden = true
    disclaimer.setAttribute('aria-hidden', 'true')
    title.focus({preventScroll: true})
  }
  if (hasSeenDisclaimer()) {
    disclaimer.hidden = true
    disclaimer.setAttribute('aria-hidden', 'true')
  } else {
    disclaimer.hidden = false
    disclaimer.removeAttribute('aria-hidden')
    requestAnimationFrame(() => disclaimerAccept.focus({preventScroll: true}))
  }
  disclaimerAccept.addEventListener('click', closeDisclaimer)
}

prevBtn.addEventListener('click', () => showScene(adjacent(pendingId || currentId, -1)))
nextBtn.addEventListener('click', () => showScene(adjacent(pendingId || currentId, 1)))
helpBtn.addEventListener('click', () => setHelp(helpPanel.hidden))
$('closeHelp').addEventListener('click', () => { setHelp(false); helpBtn.focus() })
$('closeTour').addEventListener('click', closeTour)
$('tourBrand').addEventListener('click', (event) => { event.preventDefault(); closeTour() })
$('retryScene').addEventListener('click', () => {
  if (lastFailedId) showScene(lastFailedId)
  else window.location.reload()
})
fullscreenBtn.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  } catch {
    status.textContent = 'Pełny ekran jest niedostępny w tej przeglądarce.'
    status.classList.add('is-notice')
    window.setTimeout(() => status.classList.remove('is-notice'), 4000)
  }
})
if (!document.documentElement.requestFullscreen || !document.fullscreenEnabled) fullscreenBtn.hidden = true

document.addEventListener('fullscreenchange', syncFullscreen)
window.addEventListener('resize', positionHotspots)
window.addEventListener('pagehide', flushTourSceneAnalytics)
window.visualViewport?.addEventListener('resize', positionHotspots)
if (typeof ResizeObserver !== 'undefined') new ResizeObserver(positionHotspots).observe(app)
window.addEventListener('hashchange', () => {
  let id
  try { id = decodeURIComponent(location.hash.slice(1)) } catch { return }
  if (mode === 'interior' && id === LEGACY_INTERIOR_ENTRY) id = INTERIOR_ENTRY
  if (sceneMap.has(id)) showScene(id)
})

document.addEventListener('keydown', (event) => {
  const editing = event.target instanceof HTMLElement && (event.target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName))
  if (event.key === 'Escape') {
    event.preventDefault()
    if (disclaimer && !disclaimer.hidden) { disclaimerAccept?.click(); return }
    if (editMode && editorPanel && !editorPanel.hidden) {
      editorPanel.hidden = true
      app.classList.remove('is-editor-panel-open')
      requestAnimationFrame(positionHotspots)
    } else if (!helpPanel.hidden) { setHelp(false); helpBtn.focus() }
    else if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else closeTour()
    return
  }
  if (editing) return
  if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && currentId) {
    event.preventDefault()
    showScene(adjacent(pendingId || currentId, event.key === 'ArrowLeft' ? -1 : 1))
  }
  if (event.key.toLowerCase() === 'f' && !fullscreenBtn.hidden && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault(); fullscreenBtn.click()
  }
  if (event.key === 'Tab' && embedded) {
    const elements = [...document.querySelectorAll('a[href], button:not(:disabled)')].filter((el) => !el.hidden && el.getClientRects().length > 0)
    const first = elements[0], last = elements.at(-1)
    if (event.shiftKey && (document.activeElement === first || document.activeElement === document.body)) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }
})

async function init() {
  try {
    const response = await fetch(DATA_URL, {cache: 'no-cache'})
    if (!response.ok) throw new Error(`Konfiguracja spaceru: HTTP ${response.status}`)
    const baseConfig = await response.json()
    validateConfig(baseConfig)
    config = loadEditorDraft(cloneConfig(baseConfig))
    validateConfig(config)
    scenes = config.scenes
    sceneMap = new Map(scenes.map((scene) => [scene.id, scene]))
    renderRoomMenu()
    if (editMode) setupEditor()
    let hash = ''
    try { hash = decodeURIComponent(location.hash.slice(1)) } catch {}
    if (mode === 'interior' && hash === LEGACY_INTERIOR_ENTRY) hash = INTERIOR_ENTRY
    await showScene(sceneMap.has(hash) ? hash : config.startScene)
  } catch (error) {
    $('sceneText').textContent = 'Spacer chwilowo niedostępny'
    $('tourErrorText').textContent = 'Nie udało się wczytać konfiguracji spaceru. Odśwież widok lub wróć do strony.'
    errorPanel.hidden = false
    prevBtn.disabled = true; nextBtn.disabled = true
    console.warn('[Spacer]', error.message)
  } finally {
    if (embedded) window.parent.postMessage({type: 'dnp-tour:ready', mode}, window.location.origin)
  }
}
init()
