import { ArrowRight, BedDouble, CarFront, Download, Home, LandPlot } from 'lucide-react'
import type { House } from '../../data/houses'
import { formatPrice } from '../../data/houses'

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

  return (
    <article className={`house-card ${house ? '' : 'house-card--placeholder'}`.trim()} aria-labelledby={`house-card-${visibleHouse.id}`}>
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
            <li><Home aria-hidden="true" /><span><strong>{visibleHouse.area} m²</strong> powierzchni</span></li>
            <li><LandPlot aria-hidden="true" /><span><strong>{visibleHouse.plot} m²</strong> działki</span></li>
            <li><BedDouble aria-hidden="true" /><span><strong>{visibleHouse.rooms}</strong> pokoi</span></li>
            <li><CarFront aria-hidden="true" /><span><strong>{visibleHouse.parking}</strong> miejsca postojowe</span></li>
          </ul>
          <div className="house-card__price">
            <span>Cena</span>
            <strong>{formatPrice(visibleHouse.price)}</strong>
          </div>
          <button className="button button--olive house-card__cta" type="button" onClick={onAsk}>
            Zapytaj o {visibleHouse.name.toLowerCase()} <ArrowRight size={17} aria-hidden="true" />
          </button>
          <a className="house-card__pdf" href={visibleHouse.pdf} target="_blank" rel="noreferrer">
            <Download size={18} aria-hidden="true" /> Pobierz kartę PDF
          </a>
        </>
      ) : null}
    </article>
  )
}
