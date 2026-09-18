import { Armchair, ChevronLeft, ChevronRight, Compass, DoorOpen, Maximize2, SunMedium } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { layoutRooms, PLAN_HEIGHT, PLAN_VIEWBOX, PLAN_WIDTH, type PlanMode, type ZoneId, zoneLabels, zoneOrder } from '../../data/layoutRooms'
const modes: Array<{ id: PlanMode; label: string }> = [
  { id: 'layout', label: 'Układ' },
  { id: 'zones', label: 'Strefy' },
  { id: 'furniture', label: 'Umeblowanie' },
]

const benefitIcons = [SunMedium, Armchair, DoorOpen]
const ROOM_PICKER_PAGE_SIZE = 4

export function Layout() {
  const [mode, setMode] = useState<PlanMode>('layout')
  const [activeId, setActiveId] = useState('living')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeZone, setActiveZone] = useState<ZoneId | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [pickerStart, setPickerStart] = useState(0)

  const active = layoutRooms.find((room) => room.id === activeId) ?? layoutRooms[0]
  const activeIndex = layoutRooms.findIndex((room) => room.id === activeId)
  const pickerPageCount = Math.ceil(layoutRooms.length / ROOM_PICKER_PAGE_SIZE)
  const pickerRooms = Array.from(
    { length: Math.min(ROOM_PICKER_PAGE_SIZE, layoutRooms.length) },
    (_, offset) => layoutRooms[(pickerStart + offset) % layoutRooms.length],
  )

  useEffect(() => {
    const pageStart = Math.floor(Math.max(activeIndex, 0) / ROOM_PICKER_PAGE_SIZE) * ROOM_PICKER_PAGE_SIZE
    setPickerStart(pageStart)
  }, [activeIndex])

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

  const movePicker = (direction: number) => {
    setPickerStart((current) => {
      const currentPage = Math.floor(current / ROOM_PICKER_PAGE_SIZE)
      const nextPage = (currentPage + direction + pickerPageCount) % pickerPageCount
      return nextPage * ROOM_PICKER_PAGE_SIZE
    })
  }

  return (
    <section id="uklad" className="layout-section" aria-labelledby="layout-title">
      <div className="shell">
        <div className="layout-section__heading">
          <div className="section-kicker"><b>05 / 12</b><span />Układ domu</div>
          <h2 id="layout-title">Dom, który działa na co dzień.</h2>
          <p>Przemyślany układ, maksymalna funkcjonalność i wygoda dla całej rodziny.<br className="layout-section__desktop-break" /> Każda przestrzeń ma swoje miejsce i cel.</p>
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
                  <button key={zone} type="button" className={activeZone === zone ? 'is-active' : ''} onClick={() => chooseZone(zone)}>{zoneLabels[zone]}</button>
                ))}
              </div>
            )}

            <div id="layout-plan-panel" role="tabpanel" aria-labelledby={`layout-tab-${mode}`} className={`interactive-plan interactive-plan--${mode}`}>
              <img
                src={mode === 'furniture' ? '/assets/images/layout/plan-3d.webp?v=449065e32367b32d' : '/assets/images/layout/plan-2d-precise.webp?v=3c79d8033e9a6bfe'}
                alt={mode === 'furniture' ? 'Trójwymiarowy, umeblowany układ Domu na Polnej' : 'Precyzyjny rzut 2D Domu na Polnej'}
                width={mode === 'furniture' ? 1024 : PLAN_WIDTH}
                height={mode === 'furniture' ? 768 : PLAN_HEIGHT}
                loading="eager"
                decoding="async"
                draggable={false}
              />

              {mode !== 'furniture' && (
                <svg viewBox={PLAN_VIEWBOX} preserveAspectRatio="none" aria-label="Interaktywny wybór pomieszczeń">
                  {layoutRooms.map((room) => room.paths.map((path, index) => {
                    const selected = selectedIds.includes(room.id)
                    const hovered = hoveredId === room.id
                    return (
                      <path
                        key={`${room.id}-${index}`}
                        d={path}
                        className={`${selected ? 'is-selected' : ''} ${hovered ? 'is-hovered' : ''}`}
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
          </div>

          <aside className="room-panel" aria-live="polite">
            <div className="room-panel__image">
              <img key={active.image} src={active.image} alt={`Wizualizacja: ${active.title}`} width="720" height="420" loading="eager" decoding="async" />
            </div>
            <div className="room-panel__body">
              <h3>{active.title}{active.area ? <span> · {active.area}</span> : null}</h3>
              <p>{active.description}</p>
              <div className="room-panel__benefits">
                {active.benefits.map((benefit, index) => {
                  const Icon = benefitIcons[index]
                  return <div key={benefit.title}><Icon aria-hidden="true" /><span><strong>{benefit.title}</strong><small>{benefit.text}</small></span></div>
                })}
              </div>
              <div className="room-picker">
                <span>Wybierz pomieszczenie:</span>
                <div>
                  <button type="button" className="room-picker__arrow" aria-label="Pokaż poprzednie pomieszczenia" onClick={() => movePicker(-1)}><ChevronLeft size={17} /></button>
                  {pickerRooms.map((room) => (
                    <button key={room.id} type="button" className={selectedIds.includes(room.id) ? 'is-active' : ''} onClick={() => toggleRoom(room.id)}>{room.shortTitle}</button>
                  ))}
                  <button type="button" className="room-picker__arrow" aria-label="Pokaż następne pomieszczenia" onClick={() => movePicker(1)}><ChevronRight size={17} /></button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
