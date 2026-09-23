import { createPortal } from 'react-dom'
import { Crosshair, Minus, Plus, RotateCcw, X } from '../../components/common/Icons'
import { useEffect, useRef, useState } from 'react'
import { useDialog } from '../../hooks/useDialog'
import { createPanorama } from '../../lib/panoramaRenderer'

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

  useDialog(dialogRef, onClose)
  useEffect(() => {
    const host = canvasRef.current
    if (!host) return
    try {
      const renderer = createPanorama(host,
        () => ({lon:lonRef.current,lat:latRef.current,fov:fovRef.current}),
        () => setLoadState('ready'), () => setLoadState('error'))
      requestRenderRef.current = renderer.request
      return () => { requestRenderRef.current = () => undefined; renderer.dispose() }
    } catch { setLoadState('error') }
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

  return createPortal(
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
        onWheel={(event) => { changeFov(event.deltaY * .03) }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') lonRef.current -= 6
          else if (event.key === 'ArrowRight') lonRef.current += 6
          else if (event.key === 'ArrowUp') latRef.current = Math.max(-78, latRef.current - 4)
          else if (event.key === 'ArrowDown') latRef.current = Math.min(78, latRef.current + 4)
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
        {loadState === 'error' && <div className="panorama-modal__error">Nie udało się uruchomić panoramy w tej przeglądarce. <a href="/assets/images/neighborhood/panorama-360-grabik.webp?v=c7a1986872c74640" target="_blank" rel="noreferrer">Otwórz fotografię panoramiczną</a></div>}
      </div>
      <div className="panorama-modal__topbar">
        <div><Crosshair aria-hidden="true" /><span><small>Rzeczywista fotografia z drona</small><strong>Grabik · panorama 360°</strong></span></div>
        <button data-dialog-close ref={closeRef} type="button" onClick={onClose} aria-label="Zamknij panoramę"><X aria-hidden="true" /></button>
      </div>
      <div className="panorama-modal__controls" aria-label="Sterowanie panoramą">
        <button type="button" onClick={() => { lonRef.current -= 15; requestRenderRef.current() }} aria-label="Obróć w lewo">←</button>
        <button type="button" onClick={() => { lonRef.current += 15; requestRenderRef.current() }} aria-label="Obróć w prawo">→</button>
        <button type="button" onClick={() => changeFov(-8)} aria-label="Przybliż"><Plus /></button>
        <button type="button" onClick={() => changeFov(8)} aria-label="Oddal"><Minus /></button>
        <button type="button" onClick={reset} aria-label="Przywróć widok początkowy"><RotateCcw /></button>
      </div>
      <p className="panorama-modal__hint">Przeciągnij, aby rozejrzeć się po okolicy · kółko myszy przybliża widok</p>
    </div>
  , document.body)
}
