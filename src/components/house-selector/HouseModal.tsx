import { createPortal } from 'react-dom'
import { useRef } from 'react'
import { X } from '../common/Icons'
import { HouseCard } from './HouseCard'
import { useDialog } from '../../hooks/useDialog'
import type { House } from '../../data/houses'
type Props = {house: House; onClose:()=>void; onAsk:()=>void}
export function HouseModal({house,onClose,onAsk}: Props) {
 const ref=useRef<HTMLDivElement>(null)
 useDialog(ref,onClose)
 return createPortal(<div className="house-sheet" ref={ref} role="dialog" aria-modal="true" aria-label={`Szczegóły: ${house.name}`}>
  <div className="house-sheet__backdrop" onClick={onClose} aria-hidden="true" />
  <div className="house-sheet__panel">
   <div className="house-sheet__bar"><span>Wybrany dom</span><button type="button" data-dialog-close onClick={onClose} aria-label="Zamknij kartę domu"><X /></button></div>
   <HouseCard house={house} fallbackHouse={house} onAsk={onAsk} idPrefix="mobile-" />
  </div>
 </div>, document.body)
}
