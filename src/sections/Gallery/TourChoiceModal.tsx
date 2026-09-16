import { ArrowRight, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

type TourChoiceModalProps = {
  onClose: () => void
  onChooseExterior: () => void
}

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function TourChoiceModal({ onClose, onChooseExterior }: TourChoiceModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

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

      const focusable = Array.from(cardRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
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
    <div className="tour-choice-modal" role="dialog" aria-modal="true" aria-labelledby="tour-choice-title">
      <div ref={cardRef} className="tour-choice-modal__card">
        <button className="tour-choice-modal__close" ref={closeRef} type="button" onClick={onClose} aria-label="Zamknij wybór spaceru">
          <X aria-hidden="true" />
        </button>

        <div className="eyebrow eyebrow--light">Spacer 360</div>
        <h3 id="tour-choice-title">Wybierz obszar spaceru</h3>
        <p>Na tym etapie gotowy jest pełny spacer zewnętrzny wokół domu i działki. Wersja wnętrz pojawi się jako kolejny moduł.</p>

        <div className="tour-choice-modal__options">
          <button className="tour-choice-option tour-choice-option--active" type="button" onClick={onChooseExterior}>
            <span className="tour-choice-option__kicker">Dostępne teraz</span>
            <strong>Na zewnątrz</strong>
            <span>14 kadrów · dom, podjazd, wiata, taras i ogród</span>
            <span className="tour-choice-option__cta">Wejdź do spaceru <ArrowRight size={16} /></span>
          </button>

          <button className="tour-choice-option tour-choice-option--disabled" type="button" disabled>
            <span className="tour-choice-option__kicker">W przygotowaniu</span>
            <strong>Do wewnątrz</strong>
            <span>Salon, kuchnia, sypialnie i łazienki pojawią się w następnym etapie.</span>
            <span className="tour-choice-option__cta">Wkrótce dostępne</span>
          </button>
        </div>
      </div>
    </div>
  )
}
