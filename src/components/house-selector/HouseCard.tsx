import { useEffect, useRef } from 'react'
import { track, trackOnce } from '../../lib/analytics'
import { ArrowRight, BedDouble, CarFront, Download, Home, LandPlot } from 'lucide-react'
import type { House } from '../../data/houses'
import { formatArea, formatPrice, formatPricePerSqm } from '../../data/houses'

type HouseCardProps = {
  house: House | null
  fallbackHouse: House
  onAsk: () => void
}

export function StatusBadge({ status }: Pick<House, 'status'>) {
  return <span className={`status-badge status-badge--${status === 'Rezerwacja' ? 'reserved' : status === 'Sprzedany' ? 'sold' : 'available'}`}>{status}</span>
}

export function HouseCard({ house, fallbackHouse, onAsk }: HouseCardProps) {
  const visibleHouse = house ?? fallbackHouse
  const cardRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!house || !cardRef.current) return
    let visible = false
    const record = () => { if (visible) trackOnce('house_card_open', house.id, 'masterplan') }
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; record() }, { threshold: .25 })
    observer.observe(cardRef.current)
    window.addEventListener('dnp-consent-changed', record)
    return () => { observer.disconnect(); window.removeEventListener('dnp-consent-changed', record) }
  }, [house?.id])

  return (
    <article ref={cardRef} className={`house-card ${house ? '' : 'house-card--placeholder'}`.trim()} aria-labelledby={`house-card-${visibleHouse.id}`}>
      <div className="house-card__heading">
        <div>
          <span className="house-card__parcel">{house ? `DZIAŁKA ${visibleHouse.parcel}` : 'WYBÓR DOMU'}</span>
          <h3 id={`house-card-${visibleHouse.id}`}>{house ? visibleHouse.name : 'Kliknij działkę, aby sprawdzić szczegóły'}</h3>
        </div>
        {house ? <StatusBadge status={visibleHouse.status} /> : <span className="house-card__placeholder-pill">Wybierz z mapy lub tabeli</span>}
      </div>

      <div className="house-card__image">
        <img src={visibleHouse.image} alt={house ? `Frontowa elewacja — ${visibleHouse.name}` : 'Przykładowy widok domu'} width="1672" height="941" loading="lazy" />
      </div>

      {house ? (
        <>
          <ul className="house-card__facts" aria-label={`Parametry ${visibleHouse.name}`}>
            <li><Home aria-hidden="true" /><span><strong>{formatArea(visibleHouse.area)}</strong> pow. użytkowej</span></li>
            <li><LandPlot aria-hidden="true" /><span><strong>{visibleHouse.plot} m²</strong> działki</span></li>
            <li><BedDouble aria-hidden="true" /><span><strong>{visibleHouse.rooms}</strong> pokoi</span></li>
            <li><CarFront aria-hidden="true" /><span><strong>{visibleHouse.parking}</strong> miejsca postojowe</span></li>
          </ul>
          <div className="house-card__price">
            <span>Cena brutto</span>
            <strong>{formatPrice(visibleHouse.price)}</strong>
            <small>{formatPricePerSqm(visibleHouse)} brutto za 1 m² powierzchni użytkowej</small>
          </div>
          <details className="house-card__price-history">
            <summary>Historia ceny</summary>
            {visibleHouse.priceHistory.length ? <ul>{visibleHouse.priceHistory.map((entry, index) => <li key={`${entry.validFrom}-${index}`}><span>{entry.validFrom.slice(0, 10)} – {entry.validTo.slice(0, 10)}</span><strong>{formatPrice(entry.price)}</strong></li>)}</ul> : <p>Brak wcześniejszych zmian ceny zapisanych w publicznej historii.</p>}
          </details>
          {visibleHouse.mandatoryPayments.length ? <div className="house-card__mandatory"><span>Obowiązkowe dodatkowe świadczenia</span><ul>{visibleHouse.mandatoryPayments.map((payment) => <li key={payment.name}>{payment.name}: <strong>{formatPrice(payment.amount)}</strong></li>)}</ul></div> : null}
          <button className="button button--olive house-card__cta" type="button" onClick={onAsk}>
            Zapytaj o {visibleHouse.name.toLowerCase()} <ArrowRight size={17} aria-hidden="true" />
          </button>
          {visibleHouse.pdf && (<a className="house-card__pdf" onClick={() => track('house_pdf_download', visibleHouse.id)} href={visibleHouse.pdf} target="_blank" rel="noreferrer">
            <Download size={18} aria-hidden="true" /> Pobierz kartę PDF
          </a>)}
        </>
      ) : null}
    </article>
  )
}
