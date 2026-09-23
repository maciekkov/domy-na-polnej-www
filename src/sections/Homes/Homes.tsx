import { useEffect, useState } from 'react'
import { HouseModal } from '../../components/house-selector/HouseModal'
import { HouseCard, StatusBadge } from '../../components/house-selector/HouseCard'
import { Masterplan } from '../../components/house-selector/Masterplan'
import type { House, HouseId } from '../../data/houses'
import { formatArea } from '../../data/houses'

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
  const [sheetOpen, setSheetOpen] = useState(false)
  const choose = (id:HouseId) => {
    onSelect(id)
    if (window.matchMedia('(max-width: 960px)').matches) setSheetOpen(true)
  }
  useEffect(() => {
    const media = window.matchMedia('(min-width: 961px)')
    const close = () => { if(media.matches) setSheetOpen(false) }
    media.addEventListener('change',close)
    return () => media.removeEventListener('change',close)
  }, [])

  return (
    <section className="homes" id="domy" aria-labelledby="homes-title">
      <div className="shell">
        <header className="homes__heading">
          <div className="section-heading">
            <p className="section-kicker"><span aria-hidden="true" /> Domy na Polnej · Grabik</p>
            <h2 id="homes-title">Wybierz swój dom</h2>
            <p>Pięć wolnostojących domów. Ten sam przemyślany układ, różne działki i położenie.</p>
          </div>
          <p className="homes__signature"><span>Jedna architektura. Pięć działek.</span>Wybór zaczyna się<br />od miejsca.</p>
        </header>

        <div className="masterplan-legend" aria-label="Legenda planu"><span><i className="available" />Dostępny</span><span><i className="reserved" />Rezerwacja</span><span><i className="sold" />Sprzedany</span><small>Kliknij literę A–E lub obszar działki</small></div>
        <div className="homes__showcase">
          <div className="homes__map-column">
            <Masterplan
              houses={houses}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onSelect={choose}
            />
            <div className="homes__map-caption">
              <p>Wybierz działkę na planie lub dom z listy poniżej.</p>
              <span className="homes__north-caption">N ↘ <span>Północ</span></span>
            </div>
          </div>
          <HouseCard house={selectedHouse} fallbackHouse={houses[0]} onAsk={() => selectedHouse && onAsk(selectedHouse.id)} />
        </div>

        <div className="homes-table-wrap" id="lista-domow">
          <table className="homes-table">
            <caption className="sr-only">Lista domów, statusy, powierzchnie, działki i stan przygotowania cennika</caption>
            <thead>
              <tr><th>Dom</th><th>Nr działki</th><th>Status</th><th>Pow. użytkowa</th><th>Działka</th><th>Pokoje</th><th>Cena brutto</th><th>Brutto / m²</th></tr>
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
                  onClick={() => choose(house.id)}
                >
                  <th scope="row"><button aria-pressed={selectedId === house.id} type="button" onClick={(event) => { event.stopPropagation(); choose(house.id) }}>{house.name}</button></th>
                  <td>{house.parcel}</td>
                  <td><StatusBadge status={house.status} /></td>
                  <td>{formatArea(house.area)}</td><td>{house.plot} m²</td><td>{house.rooms}</td><td><span className="pricing-pending">W przygotowaniu</span></td><td><span className="pricing-pending">W przygotowaniu</span></td>
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
              aria-pressed={selectedId === house.id}
              type="button"
              onClick={() => choose(house.id)}
            >
              <span className="homes-mobile-list__top"><strong>{house.name}</strong><StatusBadge status={house.status} /></span>
              <span className="homes-mobile-list__meta"><span>{formatArea(house.area)} · działka {house.plot} m²</span><b>Wkrótce</b></span><span className="homes-mobile-list__unit-price">Cennik w przygotowaniu</span>
              <span className="homes-mobile-list__link">Wybierz ten dom</span>
            </button>
          ))}
        </div>
        <p className="homes__transaction-note">Cennik sprzedaży jest w przygotowaniu. Statusy dotyczą poszczególnych domów. Zakres sprzedaży, udział w drodze i warunki płatności sprawdź w karcie domu oraz dokumentach przed zawarciem umowy.</p>
        <p className="sr-only" role="status">{selectedHouse ? `Wybrano ${selectedHouse.name}. Cennik w przygotowaniu, działka ${selectedHouse.plot} metrów kwadratowych.` : 'Nie wybrano domu.'}</p>
      </div>
      {sheetOpen && selectedHouse && <HouseModal house={selectedHouse} onClose={()=>setSheetOpen(false)} onAsk={()=>{setSheetOpen(false);onAsk(selectedHouse.id)}} />}
    </section>
  )
}
