import { Armchair, Compass, DoorOpen, Maximize2, SunMedium } from '../../components/common/Icons'
import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { layoutRooms, PLAN_HEIGHT, PLAN_VIEWBOX, PLAN_WIDTH, type PlanMode, type ZoneId, zoneLabels, zoneOrder } from '../../data/layoutRooms'
const modes: Array<{ id: PlanMode; label: string }> = [
  { id: 'layout', label: 'Układ' },
  { id: 'zones', label: 'Strefy' },
  { id: 'furniture', label: 'Umeblowanie' },
]

const benefitIcons = [SunMedium, Armchair, DoorOpen]


export function Layout() {
  const [mode, setMode] = useState<PlanMode>('layout')
  const [activeId, setActiveId] = useState('living')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeZone, setActiveZone] = useState<ZoneId | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const active = layoutRooms.find((room) => room.id === activeId) ?? layoutRooms[0]
  const chooseMode = (nextMode: PlanMode) => {
    setMode(nextMode)
    setSelectedIds([])
    setActiveZone(null)
    setHoveredId(null)
  }

  const onModeTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const lastIndex = modes.length - 1
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? lastIndex : (index + (event.key === 'ArrowRight' ? 1 : -1) + modes.length) % modes.length
    const next = modes[nextIndex]
    chooseMode(next.id)
    document.getElementById(`layout-tab-${next.id}`)?.focus()
  }

  const toggleRoom = (id: string) => {
    setActiveId(id)
    setActiveZone(null)
    setSelectedIds((current) => {
      const alreadySelected = current.includes(id)
      if (mode === 'zones') {
        return alreadySelected ? current.filter((item) => item !== id) : [...current, id]
      }
      return alreadySelected && current.length === 1 ? [] : [id]
    })
  }

  const chooseZone = (zone: ZoneId) => {
    const ids = layoutRooms.filter((room) => room.zone === zone).map((room) => room.id)
    const zoneAlreadySelected = activeZone === zone && ids.length === selectedIds.length && ids.every((id) => selectedIds.includes(id))
    if (zoneAlreadySelected) {
      setSelectedIds([])
      setActiveZone(null)
      return
    }
    setSelectedIds(ids)
    setActiveZone(zone)
    setActiveId(ids[0] ?? activeId)
  }

  return (
    <section id="uklad" className="layout-section" aria-labelledby="layout-title">
      <div className="shell">
        <div className="layout-section__heading">
          <div className="section-kicker"><span />Układ domu</div>
          <h2 id="layout-title">Dom, który działa na co dzień.</h2>
          <p>110,82 m² na jednym poziomie. Wybierz pomieszczenie na rzucie,<br className="layout-section__desktop-break" /> poznaj jego funkcję i zobacz przykładową aranżację.</p>
        </div>

        <div className={`layout-section__grid layout-section__grid--${mode}`}>
          <div className="plan-column">
            <div className="plan-modes" role="tablist" aria-label="Sposób prezentacji rzutu">
              {modes.map((item, index) => (
                <button
                  key={item.id}
                  id={`layout-tab-${item.id}`}
                  type="button"
                  role="tab"
                  aria-selected={mode === item.id}
                  aria-controls="layout-plan-panel"
                  tabIndex={mode === item.id ? 0 : -1}
                  className={mode === item.id ? 'is-active' : ''}
                  onClick={() => chooseMode(item.id)}
                  onKeyDown={(event) => onModeTabKeyDown(event, index)}
                >{item.label}</button>
              ))}
            </div>

            {mode === 'zones' && (
              <div className="plan-zones" aria-label="Wybierz strefę domu">
                {zoneOrder.map((zone) => (
                  <button key={zone} type="button" className={activeZone === zone ? 'is-active' : ''} aria-pressed={activeZone === zone} onClick={() => chooseZone(zone)}>{zoneLabels[zone]}</button>
                ))}
              </div>
            )}

            <div id="layout-plan-panel" role="tabpanel" aria-labelledby={`layout-tab-${mode}`} className={`interactive-plan interactive-plan--${mode}`}>
              <img
                src={mode === 'furniture' ? '/assets/images/layout/plan-3d.webp?v=449065e32367b32d' : '/assets/images/layout/plan-2d-precise.webp?v=3c79d8033e9a6bfe'}
                alt={mode === 'furniture' ? 'Trójwymiarowy, umeblowany układ Domu na Polnej' : 'Precyzyjny rzut 2D Domu na Polnej'}
                width={mode === 'furniture' ? 1024 : PLAN_WIDTH}
                height={mode === 'furniture' ? 768 : PLAN_HEIGHT}
                loading="lazy"
                decoding="async"
                draggable={false}
              />

              {mode !== 'furniture' && (
                <svg viewBox={PLAN_VIEWBOX} preserveAspectRatio="none" aria-label="Interaktywny wybór pomieszczeń">
                  {layoutRooms.map((room) => room.paths.map((path, index) => {
                    const selected = selectedIds.includes(room.id)
                    const hovered = hoveredId === room.id
                    const illuminated = hoveredId ? hovered : selected
                    return (
                      <path
                        key={`${room.id}-${index}`}
                        d={path}
                        className={`${selected ? 'is-selected' : ''} ${illuminated ? 'is-illuminated' : ''}`}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selected}
                        aria-label={`${room.title}${room.area ? `, ${room.area}` : ''}`}
                        onMouseEnter={() => setHoveredId(room.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onFocus={() => setHoveredId(room.id)}
                        onBlur={() => setHoveredId(null)}
                        onClick={() => toggleRoom(room.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            toggleRoom(room.id)
                          }
                        }}
                      />
                    )
                  }))}
                </svg>
              )}

              {mode === 'furniture' && <span className="interactive-plan__badge"><Maximize2 size={16} /> Widok umeblowany</span>}
              <span className="interactive-plan__compass" aria-label="Północ znajduje się po prawej stronie planu"><Compass aria-hidden="true" /><b>N</b></span>
            </div>
            <p className="plan-instruction">Wybierz pomieszczenie na rzucie, aby zobaczyć szczegóły.</p>
          </div>

          <aside className="room-panel" aria-live="polite">
            <div className="room-panel__image">
              <img key={active.image} src={active.image} alt={`Wizualizacja: ${active.title}`} width="720" height="420" loading="lazy" decoding="async" />
            </div>
            <div className="room-panel__body">
              <h3>{active.title}{active.area ? <span>{active.area}</span> : null}</h3>
              <p>{active.description}</p>
              <div className="room-panel__benefits">
                {active.benefits.map((benefit, index) => {
                  const Icon = benefitIcons[index]
                  return <div key={benefit.title}><Icon aria-hidden="true" /><span><strong>{benefit.title}</strong><small>{benefit.text}</small></span></div>
                })}
              </div>
              <label className="room-selector">
                <span>Przejdź do pomieszczenia</span>
                <select value={activeId} onChange={(event) => toggleRoom(event.target.value)}>
                  {layoutRooms.map(room => <option key={room.id} value={room.id}>{room.title}{room.area ? ` · ${room.area}` : ''}</option>)}
                </select>
              </label>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
