const DATA_URL = '/assets/data/spacer-360-zewnetrzny.json'

const backdrop = document.getElementById('tourBackdrop')
const layers = [document.getElementById('tourImageA'), document.getElementById('tourImageB')]
const titleIndex = document.getElementById('sceneIndex')
const titleText = document.getElementById('sceneText')
const hotspotsRoot = document.getElementById('tourHotspots')
const thumbsRoot = document.getElementById('tourThumbs')
const prevBtn = document.getElementById('prevScene')
const nextBtn = document.getElementById('nextScene')
const fullscreenBtn = document.getElementById('toggleFullscreen')
const helpBtn = document.getElementById('toggleHelp')
const helpPanel = document.getElementById('helpPanel')

let data = null
let scenes = []
let sceneMap = new Map()
let currentId = null
let activeLayer = 0
const imagePreload = new Set()

const arrowSvg = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M6.75 17.25L17.25 6.75M8.75 6.75h8.5v8.5"></path>
  </svg>
`

const icon = {
  help: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4"></path><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"></circle></svg>`,
  fullscreen: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"></path></svg>`,
  exitFullscreen: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M8 8H3V3M16 8h5V3M21 16v5h-5M8 16H3v5"></path><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M9 3v6H3M21 9h-6V3M15 21v-6h6M3 15h6v6"></path></svg>`,
  left: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M15 18l-6-6 6-6"></path></svg>`,
  right: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"></path></svg>`
}

prevBtn.innerHTML = icon.left
nextBtn.innerHTML = icon.right
helpBtn.innerHTML = icon.help
fullscreenBtn.innerHTML = icon.fullscreen

function getSceneIndex(id) {
  return scenes.findIndex((scene) => scene.id === id)
}

function getAdjacentId(id, delta) {
  const currentIndex = getSceneIndex(id)
  if (currentIndex < 0) return scenes[0]?.id ?? null
  const index = (currentIndex + delta + scenes.length) % scenes.length
  return scenes[index].id
}

function preloadImage(src) {
  if (!src || imagePreload.has(src)) return
  imagePreload.add(src)
  const img = new Image()
  img.src = src
}

function preloadScene(scene) {
  if (!scene) return
  preloadImage(scene.image)
  preloadImage(scene.thumb || scene.image)
  scene.hotspots?.forEach((hotspot) => {
    const target = sceneMap.get(hotspot.target)
    if (target) preloadImage(target.image)
  })
  const prevScene = sceneMap.get(getAdjacentId(scene.id, -1))
  const nextScene = sceneMap.get(getAdjacentId(scene.id, 1))
  if (prevScene) preloadImage(prevScene.image)
  if (nextScene) preloadImage(nextScene.image)
}


function renderHotspots(scene) {
  hotspotsRoot.innerHTML = ''
  scene.hotspots.forEach((hotspot) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `tour-hotspot${hotspot.align === 'left' ? ' is-left' : ''}`
    button.dataset.pulse = hotspot.pulse ? 'true' : 'false'
    button.style.left = `${hotspot.x}%`
    button.style.top = `${hotspot.y}%`
    button.innerHTML = `
      <span class="tour-hotspot__core">${arrowSvg}</span>
      <span class="tour-hotspot__line" aria-hidden="true"></span>
      <span class="tour-hotspot__label">${hotspot.label}</span>
    `
    button.setAttribute('aria-label', hotspot.label)
    button.addEventListener('click', () => showScene(hotspot.target))
    hotspotsRoot.appendChild(button)
  })
}

function renderThumbs(scene) {
  thumbsRoot.innerHTML = ''
  const currentIndex = getSceneIndex(scene.id)
  const indexes = [currentIndex - 1, currentIndex, currentIndex + 1].map((index) => (index + scenes.length) % scenes.length)
  indexes.forEach((sceneIndex) => {
    const thumbScene = scenes[sceneIndex]
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `tour-thumb${thumbScene.id === scene.id ? ' is-active' : ''}`
    button.setAttribute('aria-label', `Przejdź do sceny: ${thumbScene.title}`)
    button.innerHTML = `
      <img src="${thumbScene.thumb || thumbScene.image}" alt="${thumbScene.title}" loading="lazy" decoding="async" />
      <span class="tour-thumb__caption">
        <span class="tour-thumb__index">${String(sceneIndex + 1).padStart(2, '0')}</span>
        <span class="tour-thumb__title">${thumbScene.title}</span>
      </span>
    `
    button.addEventListener('click', () => showScene(thumbScene.id))
    thumbsRoot.appendChild(button)
  })
}

function updateUrl(scene) {
  const url = new URL(window.location.href)
  url.hash = scene.id
  history.replaceState(null, '', url)
}

function updateFullscreenIcon() {
  fullscreenBtn.innerHTML = document.fullscreenElement ? icon.exitFullscreen : icon.fullscreen
}

function swapToImage(src, title) {
  const nextLayer = layers[activeLayer === 0 ? 1 : 0]
  const prevLayer = layers[activeLayer]

  const activate = () => {
    backdrop.style.backgroundImage = `url('${src}')`
    nextLayer.src = src
    nextLayer.alt = title
    nextLayer.classList.add('is-active')
    prevLayer.classList.remove('is-active')
    activeLayer = activeLayer === 0 ? 1 : 0
  }

  if (nextLayer.src === src) {
    activate()
    return
  }

  nextLayer.onload = () => {
    activate()
    nextLayer.onload = null
  }
  nextLayer.src = src
}

function showScene(id) {
  const scene = sceneMap.get(id)
  if (!scene || currentId === id) return
  currentId = id
  swapToImage(scene.image, scene.title)
  const currentIndex = getSceneIndex(id) + 1
  titleIndex.textContent = `${String(currentIndex).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`
  titleText.textContent = scene.title
  renderHotspots(scene)
  renderThumbs(scene)
  preloadScene(scene)
  updateUrl(scene)
  document.title = `Spacer 360 — ${scene.title}`
}

async function init() {
  try {
    const response = await fetch(DATA_URL, { cache: 'no-store' })
    if (!response.ok) throw new Error(`Nie udało się wczytać danych spaceru (${response.status})`)
    data = await response.json()
    scenes = data.scenes || []
    sceneMap = new Map(scenes.map((scene) => [scene.id, scene]))
    if (!scenes.length) throw new Error('Brak scen w konfiguracji spaceru.')
    const initialId = window.location.hash?.replace('#', '') || data.startScene || scenes[0].id
    const startScene = sceneMap.has(initialId) ? initialId : scenes[0].id
    showScene(startScene)
  } catch (error) {
    titleText.textContent = 'Nie udało się uruchomić spaceru'
    console.error(error)
  }
}

prevBtn.addEventListener('click', () => {
  if (!currentId) return
  showScene(getAdjacentId(currentId, -1))
})

nextBtn.addEventListener('click', () => {
  if (!currentId) return
  showScene(getAdjacentId(currentId, 1))
})

helpBtn.addEventListener('click', () => {
  helpPanel.hidden = !helpPanel.hidden
})

fullscreenBtn.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await document.documentElement.requestFullscreen()
    }
    updateFullscreenIcon()
  } catch (error) {
    console.error(error)
  }
})

document.addEventListener('fullscreenchange', updateFullscreenIcon)

document.addEventListener('keydown', (event) => {
  if (!currentId) return
  if (event.key === 'ArrowLeft') {
    showScene(getAdjacentId(currentId, -1))
  }
  if (event.key === 'ArrowRight') {
    showScene(getAdjacentId(currentId, 1))
  }
  if (event.key.toLowerCase() === 'f') {
    fullscreenBtn.click()
  }
  if (event.key === 'Escape' && !helpPanel.hidden) {
    helpPanel.hidden = true
  }
})

window.addEventListener('hashchange', () => {
  const requested = window.location.hash?.replace('#', '')
  if (requested && requested !== currentId && sceneMap.has(requested)) {
    showScene(requested)
  }
})

init()
