import { ExternalLink, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

type TourFrameModalProps = {
  onClose: () => void
  src: string
  title: string
}

export function TourFrameModal({ onClose, src, title }: TourFrameModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    document.body.classList.add('modal-open')
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('modal-open')
      previouslyFocused?.focus()
    }
  }, [onClose])

  return (
    <div className="tour-frame-modal" role="dialog" aria-modal="true" aria-label={title}>
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
