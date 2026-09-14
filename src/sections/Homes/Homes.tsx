import { useState } from 'react'
import { HouseCard, StatusBadge } from '../../components/house-selector/HouseCard'
import { Masterplan } from '../../components/house-selector/Masterplan'
import type { House, HouseId } from '../../data/houses'
import { formatPrice } from '../../data/houses'

type HomesProps = {
  houses: House[]
  selectedId: HouseId | null
  onSelect: (id: HouseId) => void
  onAsk: (id: HouseId) => void
}

export function Homes({ houses, selectedId, onSelect, onAsk }: HomesProps) {
  const [hoveredId, setHoveredId] = useState<HouseId | null>(null)
  const selectedHouse = houses.find((house) => house.id === selectedId) ?? null
  const activeId = hoveredId ?? selectedId

  return (
    <section className="homes" id="domy" aria-labelledby="homes-title">
      <div className="shell">
        <header className="section-heading">
          <p className="section-kicker"><span aria-hidden="true" /> Domy na Polnej · Grabik</p>
          <h2 id="homes-title">Wybierz swój dom</h2>
          <p>Pięć wolnostojących domów. Ten sam przemyślany układ, różne działki i położenie.</p>
        </header>

        <div className="homes__showcase">
          <Masterplan
            houses={houses}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onSelect={onSelect}
          />
          <HouseCard house={selectedHouse} fallbackHouse={houses[0]} onAsk={() => selectedHouse && onAsk(selectedHouse.id)} />
        </div>

        <div className="homes-table-wrap">
          <table className="homes-table">
            <caption className="sr-only">Lista domów, ich statusy, powierzchnie działek i ceny</caption>
            <thead>
              <tr><th>Dom</th><th>Nr działki</th><th>Status</th><th>Powierzchnia</th><th>Działka</th><th>Pokoje</th><th>Cena</th></tr>
            </thead>
            <tbody>
              {houses.map((house) => (
                <tr
                  key={house.id}
                  className={activeId === house.id ? 'is-active' : ''}
                  onMouseEnter={() => setHoveredId(house.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(house.id)}
                  onBlur={() => setHoveredId(null)}
                >
                  <th scope="row"><button type="button" onClick={() => onSelect(house.id)}>{house.name}</button></th>
                  <td>{house.parcel}</td>
                  <td><StatusBadge status={house.status} /></td>
                  <td>{house.area} m²</td><td>{house.plot} m²</td><td>{house.rooms}</td><td>{formatPrice(house.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="homes-mobile-list" aria-label="Lista domów">
          {houses.map((house) => (
            <button
              key={house.id}
              className={activeId === house.id ? 'is-active' : ''}
              type="button"
              onClick={() => onSelect(house.id)}
            >
              <span className="homes-mobile-list__top"><strong>{house.name}</strong><StatusBadge status={house.status} /></span>
              <span className="homes-mobile-list__meta"><span>{house.plot} m² działki</span><b>{formatPrice(house.price)}</b></span>
              <span className="homes-mobile-list__link">Wybierz ten dom</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
