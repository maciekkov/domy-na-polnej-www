import { ArrowRight, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { tours } from '../../data/tours'

type TourChoiceModalProps = {
  onClose: () => void
  onChooseExterior: () => void
  onChooseInterior: () => void
}

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function TourChoiceModal({ onClose, onChooseExterior, onChooseInterior }: TourChoiceModalProps) {
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
        <p>Przejdź wokół domu i działki albo wejdź do środka. Obie trasy mają ten sam interfejs: opisane pinezki, trzy miniatury i płynne przejścia.</p>

        <div className="tour-choice-modal__options">
          <button className="tour-choice-option tour-choice-option--active" type="button" onClick={onChooseExterior}>
            <span className="tour-choice-option__kicker">Dostępne teraz</span>
            <strong>Na zewnątrz</strong>
            <span>{tours.exterior.count} kadrów · dom, podjazd, wiata, taras i ogród</span>
            <span className="tour-choice-option__cta">Wejdź do spaceru <ArrowRight size={16} /></span>
          </button>

          <button className="tour-choice-option tour-choice-option--active tour-choice-option--interior" type="button" onClick={onChooseInterior}>
            <span className="tour-choice-option__kicker">Od wejścia po cały dom</span>
            <strong>Do wewnątrz</strong>
            <span>{tours.interior.count} kadry · salon, kuchnia, pokoje, łazienki i zaplecze</span>
            <small className="tour-choice-option__note">Brakujące rendery zastępują oznaczone szkice z Blendera.</small>
            <span className="tour-choice-option__cta">Wejdź do domu <ArrowRight size={16} /></span>
          </button>
        </div>
      </div>
    </div>
  )
}
