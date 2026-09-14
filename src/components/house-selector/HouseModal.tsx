import { ArrowRight, BedDouble, CarFront, Download, Home, LandPlot, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { House } from '../../data/houses'
import { formatPrice } from '../../data/houses'
import { StatusBadge } from './HouseCard'
import { track } from '../../lib/analytics'

type HouseModalProps = {
  house: House | null
  onClose: () => void
  phoneHref: string
}

export function HouseModal({ house, onClose, phoneHref }: HouseModalProps) {
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!house) return
    const prior = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    panel?.focus()
    document.body.classList.add('modal-open')

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !panel) return
      const focusable = [...panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      const first = focusable[0]
      const last = focusable.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('modal-open')
      document.removeEventListener('keydown', onKeyDown)
      prior?.focus()
    }
  }, [house, onClose])

  if (!house) return null

  return (
    <div className="modal" role="presentation">
      <button className="modal__backdrop" aria-label="Zamknij kartę domu" onClick={onClose} />
      <aside ref={panelRef} className="house-modal" role="dialog" aria-modal="true" aria-labelledby="house-modal-title" tabIndex={-1}>
        <button className="house-modal__close" type="button" onClick={onClose} aria-label="Zamknij">
          <X aria-hidden="true" />
        </button>
        <div className="house-modal__image">
          <img src={house.image} alt={`Frontowa elewacja — ${house.name}`} width="1672" height="941" />
        </div>
        <div className="house-modal__body">
          <div className="house-modal__heading">
            <div><p className="eyebrow">Karta domu</p><h2 id="house-modal-title">{house.name}</h2></div>
            <StatusBadge status={house.status} />
          </div>
          <p className="house-modal__parcel">Działka ewidencyjna {house.parcel}</p>
          <strong className="house-modal__price">{formatPrice(house.price)}</strong>
          <ul className="house-modal__facts">
            <li><Home aria-hidden="true" /><span>{house.area} m² powierzchni</span></li>
            <li><LandPlot aria-hidden="true" /><span>{house.plot} m² działki</span></li>
            <li><BedDouble aria-hidden="true" /><span>{house.rooms} pokoi</span></li>
            <li><CarFront aria-hidden="true" /><span>{house.parking} miejsca postojowe</span></li>
          </ul>
          <div className="house-modal__floorplan">
            <img src={`${import.meta.env.BASE_URL}assets/images/floorplan.webp`} alt="Rzut funkcjonalny domu" width="1024" height="768" loading="eager" />
            <span>Ten sam przemyślany układ w każdym domu</span>
          </div>
          <a className="button button--olive" href={phoneHref} onClick={() => track('phone_click', house.id)}>Zapytaj o {house.name.toLowerCase()} <ArrowRight size={17} aria-hidden="true" /></a>
          <a className="house-modal__download" href={house.pdf} target="_blank" rel="noreferrer" onClick={() => track('house_pdf_download', house.id)}><Download size={18} aria-hidden="true" /> Pobierz kartę PDF</a>
        </div>
      </aside>
    </div>
  )
}
