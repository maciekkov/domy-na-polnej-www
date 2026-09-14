import { Crosshair, Minus, Plus, RotateCcw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type PanoramaModalProps = { onClose: () => void }

const INITIAL_LON = 158
const INITIAL_LAT = -6
const INITIAL_FOV = 76

export function PanoramaModal({ onClose }: PanoramaModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const requestRenderRef = useRef<() => void>(() => undefined)
  const lonRef = useRef(INITIAL_LON)
  const latRef = useRef(INITIAL_LAT)
  const fovRef = useRef(INITIAL_FOV)
  const dragRef = useRef({ id: -1, x: 0, y: 0, lon: INITIAL_LON, lat: INITIAL_LAT })
  const [dragging, setDragging] = useState(false)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    document.body.classList.add('modal-open')
    closeRef.current?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab' && dialogRef.current) {
        const controls = [...dialogRef.current.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')]
        const first = controls[0]
        const last = controls.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.classList.remove('modal-open')
      document.removeEventListener('keydown', handleKey)
      previousFocus?.focus()
    }
  }, [onClose])

  useEffect(() => {
    const container = canvasRef.current
    if (!container) return
    let disposed = false
    let frame = 0
    let cleanup = () => undefined

    const start = async () => {
      try {
        const THREE = await import('three')
        if (disposed) return
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(fovRef.current, 1, 1, 1100)
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
        const geometry = new THREE.SphereGeometry(500, 72, 48)
        const material = new THREE.MeshBasicMaterial()
        const mesh = new THREE.Mesh(geometry, material)
        let texture: import('three').Texture | undefined
        geometry.scale(-1, 1, 1)
        scene.add(mesh)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.setClearColor(0x111812)
        container.replaceChildren(renderer.domElement)

        const render = () => {
          const phi = THREE.MathUtils.degToRad(90 - Math.max(-78, Math.min(78, latRef.current)))
          const theta = THREE.MathUtils.degToRad(lonRef.current)
          camera.fov = fovRef.current
          camera.lookAt(new THREE.Vector3(500 * Math.sin(phi) * Math.cos(theta), 500 * Math.cos(phi), 500 * Math.sin(phi) * Math.sin(theta)))
          camera.updateProjectionMatrix()
          renderer.render(scene, camera)
        }
        const requestRender = () => {
          if (frame || disposed) return
          frame = window.requestAnimationFrame(() => { frame = 0; render() })
        }
        requestRenderRef.current = requestRender
        const resize = () => {
          if (!container.clientWidth || !container.clientHeight) return
          camera.aspect = container.clientWidth / container.clientHeight
          renderer.setSize(container.clientWidth, container.clientHeight, false)
          requestRender()
        }
        const observer = new ResizeObserver(resize)
        observer.observe(container)
        resize()

        new THREE.TextureLoader().load('/assets/images/neighborhood/panorama-360-grabik.webp', (loaded) => {
          if (disposed) { loaded.dispose(); return }
          texture = loaded
          loaded.colorSpace = THREE.SRGBColorSpace
          loaded.minFilter = THREE.LinearFilter
          loaded.magFilter = THREE.LinearFilter
          material.map = loaded
          material.needsUpdate = true
          setLoadState('ready')
          requestRender()
        }, undefined, () => !disposed && setLoadState('error'))

        cleanup = () => {
          observer.disconnect()
          if (frame) window.cancelAnimationFrame(frame)
          texture?.dispose()
          material.dispose()
          geometry.dispose()
          renderer.dispose()
          container.replaceChildren()
        }
      } catch {
        if (!disposed) setLoadState('error')
      }
    }
    void start()
    return () => { disposed = true; requestRenderRef.current = () => undefined; cleanup() }
  }, [])

  const changeFov = (delta: number) => {
    fovRef.current = Math.max(42, Math.min(92, fovRef.current + delta))
    requestRenderRef.current()
  }

  const reset = () => {
    lonRef.current = INITIAL_LON
    latRef.current = INITIAL_LAT
    fovRef.current = INITIAL_FOV
    requestRenderRef.current()
  }

  return (
    <div ref={dialogRef} className="panorama-modal" role="dialog" aria-modal="true" aria-label="Panorama 360 okolicy inwestycji">
      <div
        className={`panorama-modal__stage ${dragging ? 'is-dragging' : ''}`}
        tabIndex={0}
        aria-label="Panorama 360. Przeciągaj myszką lub palcem. Użyj strzałek do obracania i klawiszy plus oraz minus do przybliżania."
        onPointerDown={(event) => {
          dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, lon: lonRef.current, lat: latRef.current }
          event.currentTarget.setPointerCapture(event.pointerId)
          setDragging(true)
        }}
        onPointerMove={(event) => {
          if (dragRef.current.id !== event.pointerId) return
          lonRef.current = dragRef.current.lon - (event.clientX - dragRef.current.x) * .12
          latRef.current = Math.max(-78, Math.min(78, dragRef.current.lat + (event.clientY - dragRef.current.y) * .08))
          requestRenderRef.current()
        }}
        onPointerUp={(event) => {
          if (dragRef.current.id !== event.pointerId) return
          dragRef.current.id = -1
          setDragging(false)
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
        }}
        onPointerCancel={() => { dragRef.current.id = -1; setDragging(false) }}
        onWheel={(event) => { event.preventDefault(); changeFov(event.deltaY * .03) }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') lonRef.current -= 6
          else if (event.key === 'ArrowRight') lonRef.current += 6
          else if (event.key === 'ArrowUp') latRef.current -= 4
          else if (event.key === 'ArrowDown') latRef.current += 4
          else if (event.key === '+' || event.key === '=') changeFov(-5)
          else if (event.key === '-') changeFov(5)
          else if (event.key === 'Home') reset()
          else return
          event.preventDefault()
          requestRenderRef.current()
        }}
      >
        <div ref={canvasRef} className="panorama-modal__canvas" />
        {loadState === 'loading' && <div className="panorama-modal__loading"><span aria-hidden="true" />Ładowanie rzeczywistej panoramy z drona…</div>}
        {loadState === 'error' && <div className="panorama-modal__error">Nie udało się uruchomić panoramy w tej przeglądarce.</div>}
      </div>
      <div className="panorama-modal__topbar">
        <div><Crosshair aria-hidden="true" /><span><small>Rzeczywista fotografia z drona</small><strong>Grabik · panorama 360°</strong></span></div>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Zamknij panoramę"><X aria-hidden="true" /></button>
      </div>
      <div className="panorama-modal__controls" aria-label="Sterowanie panoramą">
        <button type="button" onClick={() => changeFov(-8)} aria-label="Przybliż"><Plus /></button>
        <button type="button" onClick={() => changeFov(8)} aria-label="Oddal"><Minus /></button>
        <button type="button" onClick={reset} aria-label="Przywróć widok początkowy"><RotateCcw /></button>
      </div>
      <p className="panorama-modal__hint">Przeciągnij, aby rozejrzeć się po okolicy · kółko myszy przybliża widok</p>
    </div>
  )
}
