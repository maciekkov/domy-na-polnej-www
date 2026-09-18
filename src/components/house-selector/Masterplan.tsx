import type { KeyboardEvent } from 'react'
import type { House, HouseId } from '../../data/houses'
import { formatPrice } from '../../data/houses'
type MasterplanProps = {
  houses: House[]
  selectedId: HouseId | null
  hoveredId: HouseId | null
  onHover: (id: HouseId | null) => void
  onSelect: (id: HouseId) => void
}

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

const masterplanPaths: Record<HouseId, string> = {
  A: 'M 16.986914,159.70306 99.632655,157.63882 100.71588,69.089523 24.652886,71.731451 15.957816,159.73293 Z',
  B: 'M 99.632655,157.63882 183.3079,156.10816 177.3779,64.358625 100.71588,69.089523 Z',
  C: 'M 183.3079,156.10816 268.27871,154.52214 252.63147,61.257158 177.3779,64.358625 Z',
  D: 'M 268.27871,154.52214 349.68698,152.43317 324.58691,58.791667 252.63147,61.257158 Z',
  E: 'M 349.68698,152.43317 421.04979,150.65141 423.9343,53.871545 324.58691,58.791667 Z',
}

const statusClass = (status: House['status']) => status === 'Rezerwacja' ? 'reserved' : status === 'Sprzedany' ? 'sold' : 'available'

export function Masterplan({ houses, selectedId, hoveredId, onHover, onSelect }: MasterplanProps) {
  // Hover has visual priority. When the cursor leaves the plan, the clicked/selected
  // parcel becomes the only highlighted one again.
  const visualActiveId = hoveredId ?? selectedId

  const handleKey = (event: KeyboardEvent<SVGPathElement>, id: HouseId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(id)
    }
  }

  return (
    <div className="masterplan" aria-label="Interaktywny plan domów A–E" onMouseLeave={() => onHover(null)}>
      <img src={asset('assets/images/dnp-masterplan.webp?v=513c9a85fe20f11f')} alt="Widok z góry na pięć działek i domów przy ulicy Polnej" width="1672" height="941" loading="lazy" decoding="async" />
      <svg className="masterplan__polygons" viewBox="0 0 442.38331 248.97291" preserveAspectRatio="none" aria-label="Wybierz dom na planie">
        {houses.map((house) => (
          <path
            key={house.id}
            d={masterplanPaths[house.id]}
            className={`${visualActiveId === house.id ? 'is-active' : ''} masterplan-plot--${statusClass(house.status)}`}
            role="button"
            tabIndex={0}
            aria-label={`${house.name}, ${house.status}, numer działki ${house.parcel}, ${house.plot} metrów kwadratowych działki, ${formatPrice(house.price)}`}
            onMouseEnter={() => onHover(house.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(house.id)}
            onBlur={() => onHover(null)}
            onClick={() => onSelect(house.id)}
            onKeyDown={(event) => handleKey(event, house.id)}
          />
        ))}
      </svg>

      {houses.map((house) => (
        <button
          key={house.id}
          className={`plot-label plot-label--${statusClass(house.status)} ${selectedId === house.id ? 'is-active' : ''}`}
          style={{ left: `${house.mapLabel.x}%`, top: `${house.mapLabel.y}%` }}
          type="button"
          onMouseEnter={() => onHover(house.id)}
          onMouseLeave={() => onHover(null)}
          onFocus={() => onHover(house.id)}
          onBlur={() => onHover(null)}
          onClick={() => onSelect(house.id)}
          aria-label={`Wybierz ${house.name}, działka ${house.parcel}`}
        >
          <span>{house.id}</span>
          <small>{house.parcel}</small>
        </button>
      ))}

      <img
        className="masterplan__compass"
        src={asset('assets/images/ui/masterplan-compass.png?v=a3ef53cfd0a90b2f')}
        alt=""
        aria-hidden="true"
        draggable="false"
      />
    </div>
  )
}
