import { ExternalLink, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

type TourFrameModalProps = {
  onClose: () => void
  onEngaged?: () => void
  src: string
  title: string
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function TourFrameModal({ onClose, onEngaged, src, title }: TourFrameModalProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const engagedCallback = useRef(onEngaged)

  useEffect(() => {
    engagedCallback.current = onEngaged
  }, [onEngaged])

  useEffect(() => {
    const timer = window.setTimeout(() => engagedCallback.current?.(), 12_000)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    document.body.classList.add('modal-open')
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = Array.from(rootRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('modal-open')
      previouslyFocused?.focus()
    }
  }, [onClose])

  return (
    <div ref={rootRef} className="tour-frame-modal" role="dialog" aria-modal="true" aria-label={title}>
      <iframe
        src={src}
        title={title}
        allow="fullscreen"
        allowFullScreen
      />
      <div className="tour-frame-modal__actions">
        <a href={src} target="_blank" rel="noreferrer" aria-label="Otwórz spacer w nowej karcie">
          <ExternalLink aria-hidden="true" />
        </a>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Zamknij spacer">
          <X aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
