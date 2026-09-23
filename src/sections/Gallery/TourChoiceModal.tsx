import { createPortal } from 'react-dom'
import { ArrowRight, X } from '../../components/common/Icons'
import { useRef } from 'react'
import { useDialog } from '../../hooks/useDialog'
import { tours } from '../../data/tours'

type TourChoiceModalProps = {
  onClose: () => void
  onChooseExterior: () => void
  onChooseInterior: () => void
}


export function TourChoiceModal({ onClose, onChooseExterior, onChooseInterior }: TourChoiceModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useDialog(cardRef, onClose)

  return createPortal(
    <div className="tour-choice-modal" role="dialog" aria-modal="true" aria-labelledby="tour-choice-title">
      <div ref={cardRef} className="tour-choice-modal__card">
        <button data-dialog-close className="tour-choice-modal__close" ref={closeRef} type="button" onClick={onClose} aria-label="Zamknij wybór spaceru">
          <X aria-hidden="true" />
        </button>

        <div className="eyebrow eyebrow--light">Spacer 360</div>
        <h3 id="tour-choice-title">Wybierz obszar spaceru</h3>
        <p>Wybierz trasę. Opisane punkty prowadzą pomiędzy widokami, a miniatury pozwalają wrócić do dowolnego miejsca.</p>

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
            <span>{tours.interior.count} kadrów · salon, kuchnia, pokoje, łazienki i zaplecze</span>
            {tours.interior.sketchCount > 0 && <small className="tour-choice-option__note">{tours.interior.sketchCount} widoków pokazano jako oznaczone szkice, pozostałe jako wizualizacje.</small>}
            <span className="tour-choice-option__cta">Wejdź do domu <ArrowRight size={16} /></span>
          </button>
        </div>
      </div>
    </div>
  , document.body)
}
