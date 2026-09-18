import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { tours } from '../../data/tours'
import type { HouseSelection } from '../../data/houses'
import { track } from '../../lib/analytics'

type TourFrameModalProps = {
  onClose: () => void
  onEngaged?: () => void
  src: string
  title: string
  houseCode: HouseSelection
}

/** The player owns its toolbar, also in fullscreen. No second set of buttons
 * covers the iframe's help/fullscreen controls. Messages are same-origin only. */
export function TourFrameModal({ onClose, onEngaged, src, title, houseCode }: TourFrameModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const editTour = new URLSearchParams(window.location.search).get('editTour') === '1'
  const frameSrc = editTour ? `${src}${src.includes('?') ? '&' : '?'}edit=1` : src
  const [ready, setReady] = useState(false)
  const [activeTitle, setActiveTitle] = useState(title)
  const closeCallback = useRef(onClose)
  const engagedCallback = useRef(onEngaged)
  closeCallback.current = onClose
  engagedCallback.current = onEngaged

  useEffect(() => {
    const timer = window.setTimeout(() => engagedCallback.current?.(), 12_000)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const alreadyLocked = document.body.classList.contains('modal-open')
    document.body.classList.add('modal-open')
    iframeRef.current?.focus()

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow) return
      if (event.data?.type === 'dnp-tour:close') closeCallback.current()
      if (event.data?.type === 'dnp-tour:ready') {
        setReady(true)
        const mode: unknown = event.data.mode
        if (mode === 'interior' || mode === 'exterior') setActiveTitle(tours[mode].title)
        iframeRef.current?.focus()
      }
      if (event.data?.type === 'dnp-tour:scene') {
        const mode = event.data.mode === 'interior' || event.data.mode === 'exterior' ? event.data.mode : undefined
        const sceneId = typeof event.data.sceneId === 'string' ? event.data.sceneId : undefined
        if (mode && sceneId) track('tour_scene_view', houseCode === 'unknown' ? undefined : houseCode, { tourMode: mode, sceneId })
      }
      if (event.data?.type === 'dnp-tour:scene-time') {
        const mode = event.data.mode === 'interior' || event.data.mode === 'exterior' ? event.data.mode : undefined
        const sceneId = typeof event.data.sceneId === 'string' ? event.data.sceneId : undefined
        const durationMs = Number(event.data.durationMs)
        if (mode && sceneId && Number.isFinite(durationMs)) track('tour_scene_time', houseCode === 'unknown' ? undefined : houseCode, { tourMode: mode, sceneId, durationMs })
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeCallback.current() }
      // Keyboard events inside the iframe are handled by the shared player.
      if (event.key !== 'Tab') return
      event.preventDefault()
      iframeRef.current?.focus()
    }
    window.addEventListener('message', onMessage)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('message', onMessage)
      window.removeEventListener('keydown', onKeyDown)
      if (!alreadyLocked) document.body.classList.remove('modal-open')
      // The choice modal's buttons are unmounted when a tour opens.
      const target = previouslyFocused?.isConnected ? previouslyFocused : document.getElementById('choose-tour')
      target?.focus({ preventScroll: true })
    }
  }, [])

  return (
    <div className="tour-frame-modal" role="dialog" aria-modal="true" aria-label={activeTitle}>
      <iframe ref={iframeRef} src={frameSrc} title={activeTitle} allow="fullscreen" allowFullScreen tabIndex={0} />
      {!ready && <div className="tour-frame-modal__actions">
        <button type="button" onClick={onClose} aria-label="Zamknij ładowanie spaceru"><X aria-hidden="true" /></button>
      </div>}
    </div>
  )
}
