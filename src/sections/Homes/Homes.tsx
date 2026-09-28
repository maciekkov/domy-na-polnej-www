import { useEffect, useState } from 'react'
import { HouseModal } from '../../components/house-selector/HouseModal'
import { HouseCard, StatusBadge } from '../../components/house-selector/HouseCard'
import { Masterplan } from '../../components/house-selector/Masterplan'
import type { House, HouseId } from '../../data/houses'
import { useSiteData } from '../../data/runtime/SiteDataProvider'
import { publishedPrice, isSelling } from '../../lib/sales.mjs'
import { formatArea, formatPrice, formatPricePerSqm } from '../../data/houses'

type HomesProps = {
  houses: House[]
  selectedId: HouseId | null
  onSelect: (id: HouseId) => void
}

export function Homes({ houses, selectedId, onSelect }: HomesProps) {
  const { data } = useSiteData()
  const [hoveredId, setHoveredId] = useState<HouseId | null>(null)
  const selectedHouse = houses.find((house) => house.id === selectedId) ?? null
  const activeId = hoveredId ?? selectedId
  const [sheetOpen, setSheetOpen] = useState(false)

  const choose = (id: HouseId) => {
    onSelect(id)
    if (window.matchMedia('(max-width: 960px)').matches) {
      if (!sheetOpen) window.history.pushState({ ...window.history.state, dnpHouseSheet: true }, '', window.location.href)
      setSheetOpen(true)
    }
  }

  const renderPriceCell = (house: House, mode: 'total' | 'unit') => {
    if (!publishedPrice(data, house)) {
      return <span className="pricing-pending">Cena w przygotowaniu</span>
    }
    return mode === 'total' ? formatPrice(house.price) : formatPricePerSqm(house)
  }

  const closeSheet = () => {
    setSheetOpen(false)
    if (window.history.state?.dnpHouseSheet) window.history.back()
  }

  useEffect(() => {
    const onHistory = () => setSheetOpen(Boolean(window.history.state?.dnpHouseSheet) && window.matchMedia('(max-width: 960px)').matches)
    window.addEventListener('popstate', onHistory)
    return () => window.removeEventListener('popstate', onHistory)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 961px)')
    const close = () => {
      if (media.matches) {
        setSheetOpen(false)
        if (window.history.state?.dnpHouseSheet) window.history.back()
      }
    }
    media.addEventListener('change', close)
    return () => media.removeEventListener('change', close)
  }, [])

  return (
    <>
      <section className="homes" id="domy" aria-labelledby="homes-title">
        <div className="shell">
          <header className="homes__heading">
            <div className="section-heading">
              <p className="section-kicker"><span aria-hidden="true" /> Plan inwestycji</p>
              <h2 id="homes-title">Wybierz swój dom</h2>
            </div>
          </header>

          <div className="masterplan-legend" aria-label="Legenda planu">
            <span><i className="available" />{isSelling(data) ? 'Dostępny' : 'Przed sprzedażą'}</span>
            {isSelling(data) && (
              <>
                <span><i className="reserved" />Rezerwacja</span>
                <span><i className="sold" />Sprzedany</span>
              </>
            )}
          </div>

          <div className="homes__showcase">
            <div className="homes__map-column">
              <Masterplan
                houses={houses}
                selectedId={selectedId}
                hoveredId={hoveredId}
                onHover={setHoveredId}
                onSelect={choose}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="homes homes--comparison" id="porownanie-domow" aria-labelledby="comparison-title">
        <div className="shell">
          <header className="comparison-heading">
            <div className="section-kicker"><span />Porównanie domów</div>
            <h2 id="comparison-title">Wszystkie domy w jednym miejscu</h2>
            <p>Porównaj metraż działki, status i układ. Wybierz dom, aby zobaczyć szczegóły.</p>
          </header>

          <div className="homes-comparison-layout">
            <div id="lista-domow" className="homes__comparison">
              <div className="homes-table-wrap">
                <table className="homes-table">
                  <caption className="sr-only">Lista domów, statusy, powierzchnie, działki i ceny</caption>
                  <thead>
                    <tr>
                      <th>Dom</th>
                      <th>Nr działki</th>
                      <th>Status</th>
                      <th><span className="table-desktop">Pow. użytkowa</span><span className="table-mobile">Dom<br />m²</span></th>
                      <th>Działka<span className="table-mobile">m²</span></th>
                      <th><span className="table-desktop">Pokoje</span><span className="table-mobile">Pok.</span></th>
                      <th>Cena łączna</th>
                      <th>Cena / m²</th>
                    </tr>
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
                        <th scope="row">
                          <button aria-pressed={selectedId === house.id} type="button" onClick={(event) => { event.stopPropagation(); choose(house.id) }}>
                            {house.name}
                          </button>
                        </th>
                        <td>{house.parcel}</td>
                        <td>
                          <span className="table-desktop"><StatusBadge status={house.status} /></span>
                          <span className="table-mobile">{isSelling(data) ? house.status : 'Wkrótce'}</span>
                        </td>
                        <td><span className="table-desktop">{formatArea(house.area)}</span><span className="table-mobile">{house.area.toLocaleString('pl-PL')}</span></td>
                        <td>{house.plot}<span className="table-desktop"> m²</span></td>
                        <td>{house.rooms}</td>
                        <td>{renderPriceCell(house, 'total')}</td>
                        <td>{renderPriceCell(house, 'unit')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="comparison-aside">
              <HouseCard house={selectedHouse} fallbackHouse={houses[0]} />
            </aside>
          </div>

          <p className="homes__transaction-note">Zakres sprzedaży, udział w drodze i warunki płatności sprawdź w karcie domu oraz dokumentach przed zawarciem umowy.</p>
          <p className="sr-only" role="status">
            {selectedHouse
              ? `Wybrano ${selectedHouse.name}. ${publishedPrice(data, selectedHouse) ? `Cena ${formatPrice(selectedHouse.price)}` : 'Cena w przygotowaniu'}, działka ${selectedHouse.plot} metrów kwadratowych.`
              : 'Nie wybrano domu.'}
          </p>
        </div>
        {sheetOpen && selectedHouse && <HouseModal house={selectedHouse} onClose={closeSheet} />}
      </section>
    </>
  )
}
