import { createPortal } from 'react-dom'
import { X } from '../../components/common/Icons'
import { useEffect, useRef, useState } from 'react'
import { useDialog } from '../../hooks/useDialog'
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

/** The standalone player owns its toolbar after ready; messages require both
 * a matching origin and the exact iframe Window. Loading always has an exit. */
export function TourFrameModal({ onClose, onEngaged, src, title, houseCode }: TourFrameModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const closeCallback = useRef(onClose)
  const engagedCallback = useRef(onEngaged)
  closeCallback.current = onClose
  engagedCallback.current = onEngaged
  const [slow, setSlow] = useState(false)
  const [ready, setReady] = useState(false)
  const [activeTitle, setActiveTitle] = useState(title)
  const editTour = new URLSearchParams(window.location.search).get('editTour') === '1'
  const frameSrc = editTour ? `${src}${src.includes('?') ? '&' : '?'}edit=1` : src
  useDialog(dialogRef, onClose)

  useEffect(() => {
    const timer = window.setTimeout(() => engagedCallback.current?.(), 12_000)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (ready) return
    const timer = window.setTimeout(() => setSlow(true), 15_000)
    return () => window.clearTimeout(timer)
  }, [ready])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow) return
      const message = event.data
      if (message?.type === 'dnp-tour:close') closeCallback.current()
      if (message?.type === 'dnp-tour:ready') {
        setReady(true)
        const mode: unknown = message.mode
        if (mode === 'interior' || mode === 'exterior') setActiveTitle(tours[mode].title)
        iframeRef.current?.focus()
      }
      const mode = message?.mode === 'interior' || message?.mode === 'exterior' ? message.mode : undefined
      const sceneId = typeof message?.sceneId === 'string' ? message.sceneId : undefined
      if (!mode || !sceneId) return
      if (message.type === 'dnp-tour:scene') {
        track('tour_scene_view', houseCode === 'unknown' ? undefined : houseCode, { tourMode: mode, sceneId })
      }
      if (message.type === 'dnp-tour:scene-time' && Number.isFinite(Number(message.durationMs))) {
        track('tour_scene_time', houseCode === 'unknown' ? undefined : houseCode, { tourMode: mode, sceneId, durationMs: Number(message.durationMs) })
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [houseCode])

  return createPortal(<div ref={dialogRef} className="tour-frame-modal" role="dialog" aria-modal="true" aria-label={activeTitle}>
    <iframe ref={iframeRef} src={frameSrc} title={activeTitle} allow="fullscreen" allowFullScreen tabIndex={0} />
    {!ready && slow && <div className="tour-load-help" role="status"><p>Ładowanie trwa dłużej niż zwykle.</p><a href={frameSrc} target="_blank" rel="noreferrer">Otwórz spacer w osobnej karcie</a><button type="button" onClick={onClose}>Wróć do strony</button></div>}
    {!ready && <div className="tour-frame-modal__actions"><button data-dialog-close type="button" onClick={onClose} aria-label="Zamknij ładowanie spaceru"><X aria-hidden="true" /></button></div>}
  </div>, document.body)
}
