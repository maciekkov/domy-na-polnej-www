import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronRight, Gauge, RotateCcw, Users } from '../components/common/Icons'
import '../styles/admin-analytics.css'

type Visitor = { id: string; lookup: string; firstSeen: string; lastSeen: string; visits: number; durationMs: number; device: string; lastPath: string }
type Summary = { ok: boolean; uniqueVisitors: number; uniqueVisits: number; returningVisitors: number; engagedDurationMs: number; devices: Record<string, number>; sections: Array<{ id: string; views: number; durationMs: number }>; tours: Array<{ mode: string; views: number; durationMs: number }>; visitors: Visitor[] }
type Visit = { id: string; firstSeen: string; lastSeen: string; durationMs: number; source: string; device: string; events: number }
type Event = { at: string; type: string; section: string; scene: string; tour: string; house: string; path: string; durationMs: number }
type Journey = { ok: boolean; visits: Visit[]; selectedVisit: string; events: Event[]; truncated: boolean }

const labels: Record<string, string> = {
  hero: 'Strona główna', homes: 'Wybór domu', 'why-home': 'O inwestycji', location: 'Lokalizacja',
  layout: 'Układ domu', gallery: 'Galeria', standard: 'Standard', security: 'Bezpieczny zakup',
  schedule: 'Proces zakupu', journal: 'Dziennik budowy', team: 'O deweloperze', faq: 'Pytania i odpowiedzi',
  contact: 'Kontakt', 'tour-interior': 'Spacer 360 · wnętrza', 'tour-exterior': 'Spacer 360 · zewnątrz',
}
const sectionName = (id: string) => labels[id] || id.replaceAll('-', ' ')
const sectionKey = (event: Event) => event.type.startsWith('tour_scene_') ? `tour-${event.tour || 'interior'}` : event.section
const deviceName = (device: string) => ({ mobile: 'Telefon', tablet: 'Tablet', desktop: 'Komputer' } as Record<string, string>)[device] || 'Urządzenie'
const duration = (ms: number) => ms <= 0 ? '0 s' : ms < 1000 ? '<1 s' : ms >= 3600000 ? `${(ms / 3600000).toFixed(1)} godz.` : ms >= 60000 ? `${Math.round(ms / 60000)} min` : `${Math.max(1, Math.round(ms / 1000))} s`
const dateTime = (value: string) => new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
const clock = (time: number) => new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(time))
const CONTROL_KEY = 'dnp-admin-control-key'

function Timeline({ visit, events }: { visit: Visit; events: Event[] }) {
  const first = Math.min(Date.parse(visit.firstSeen), ...events.map(e => Date.parse(e.at) - Math.max(0, e.durationMs)))
  const last = Math.max(Date.parse(visit.lastSeen), ...events.map(e => Date.parse(e.at)))
  const span = Math.max(10000, last - first)
  const active = events.filter(event => (event.type === 'section_time' || event.type === 'tour_scene_time') && event.durationMs > 0)
  const viewed = events.filter(event => event.type === 'section_view' || event.type === 'tour_scene_view')
  const ids = [...new Set([...viewed, ...active].map(sectionKey).filter(Boolean))]
  if (!ids.length) return <div className="dnp-a-empty">Ta wizyta nie zawiera pomiarów sekcji.</div>
  const steps = [...viewed, ...active].map(event => ({
    at: Date.parse(event.at), row: ids.indexOf(sectionKey(event)), event,
  })).filter(step => Number.isFinite(step.at) && step.row >= 0).sort((a, b) => a.at - b.at)
  const x = (at: number) => Math.max(0, Math.min(1000, (at - first) / span * 1000))
  const y = (row: number) => row * 45 + 22.5
  const path = steps.map((step, index) => index
    ? `L ${x(step.at)} ${y(steps[index - 1].row)} L ${x(step.at)} ${y(step.row)}`
    : `M ${x(step.at)} ${y(step.row)}`).join(' ')
  return <div className="dnp-a-chart-scroll" role="region" aria-label="Oś czasu oglądanych sekcji" tabIndex={0}>
    <div className="dnp-a-chart">
      <div className="dnp-a-chart-head"><span>Sekcja</span><div className="dnp-a-ticks">{[0, .25, .5, .75, 1].map(tick => <span key={tick}>{clock(first + span * tick)}</span>)}</div><span>Czas</span></div>
      <div className="dnp-a-chart-rows">
      <svg className="dnp-a-journey" viewBox={`0 0 1000 ${ids.length * 45}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d={path} />
        {viewed.map((event, index) => {
          const row = ids.indexOf(sectionKey(event))
          return row >= 0 && Number.isFinite(Date.parse(event.at)) ? <circle key={`${event.at}-${index}`} cx={x(Date.parse(event.at))} cy={y(row)} r="5" /> : null
        })}
      </svg>
      {ids.map(id => {
        const segments = active.filter(event => sectionKey(event) === id)
        const watched = segments.reduce((sum, event) => sum + event.durationMs, 0)
        return <div className="dnp-a-chart-row" key={id}>
          <strong>{sectionName(id)}</strong>
          <div className="dnp-a-track" aria-label={`${sectionName(id)}: ${segments.length ? duration(watched) : 'zarejestrowano wejście'}`} />
          <span className="dnp-a-duration">{segments.length ? duration(watched) : '—'}</span>
        </div>
      })}
      </div>
      <div className="dnp-a-chart-foot"><span /> <div><span>{clock(first)}</span><span>{clock(last)}</span></div><span /></div>
    </div>
  </div>
}

export function AnalyticsPanel({ serverSession }: { serverSession: boolean }) {
  const [range, setRange] = useState(30)
  const [key, setKey] = useState('')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [selected, setSelected] = useState('')
  const [journey, setJourney] = useState<Journey | null>(null)
  const [status, setStatus] = useState('Wczytywanie danych…')
  const [journeyStatus, setJourneyStatus] = useState('')
  const summaryRequest = useRef(0)
  const journeyRequest = useRef(0)

  const loadJourney = async (lookup: string, visit = '', currentRange = range) => {
    const request = ++journeyRequest.current
    setSelected(lookup); setJourney(null); setJourneyStatus('Wczytywanie wizyt…')
    try {
      const response = await fetch(serverSession ? '/administrator/journey.php' : '/api/analytics-journey.php', {
        method: 'POST', credentials: 'same-origin',
        headers: serverSession ? { 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json', 'X-DNP-Admin-Key': key.trim() },
        body: JSON.stringify({ visitor: lookup, visit, rangeDays: currentRange }),
      })
      const json = await response.json() as Journey & { message?: string }
      if (!response.ok || !json.ok) throw new Error(json.message || `HTTP ${response.status}`)
      if (request === journeyRequest.current) { setJourney(json); setJourneyStatus('') }
    } catch (error) { if (request === journeyRequest.current) setJourneyStatus(`Nie udało się pobrać wizyt: ${error instanceof Error ? error.message : 'błąd'}`) }
  }

  const loadSummary = async (days = range) => {
    const request = ++summaryRequest.current
    ++journeyRequest.current
    setSummary(null); setJourney(null); setSelected(''); setStatus('Wczytywanie danych serwera…')
    if (!serverSession && key.trim().length < 24) { setStatus('Wpisz klucz administratora, aby pobrać dane serwera.'); return }
    try {
      const response = await fetch(serverSession ? '/administrator/analytics.php' : '/api/analytics-summary.php', {
        method: 'POST', credentials: 'same-origin',
        headers: serverSession ? { 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json', 'X-DNP-Admin-Key': key.trim() },
        body: JSON.stringify({ rangeDays: days }),
      })
      const json = await response.json() as Summary & { message?: string }
      if (!response.ok || !json.ok) throw new Error(json.message || `HTTP ${response.status}`)
      if (request !== summaryRequest.current) return
      setSummary(json); setStatus(`Aktualne dane · ${days} dni`)
      if (json.visitors?.[0]?.lookup) void loadJourney(json.visitors[0].lookup, '', days)
    } catch (error) { if (request === summaryRequest.current) setStatus(`Nie udało się pobrać danych: ${error instanceof Error ? error.message : 'błąd'}`) }
  }
  useEffect(() => { if (serverSession) void loadSummary() }, [serverSession, range])

  const selectedVisitor = summary?.visitors.find(visitor => visitor.lookup === selected)
  const selectedVisit = journey?.visits.find(visit => visit.id === journey.selectedVisit)
  const watchedSections = summary ? [
    ...summary.sections.map(section => ({ id: section.id, views: section.views, durationMs: section.durationMs })),
    ...summary.tours.map(tour => ({ id: `tour-${tour.mode}`, views: tour.views, durationMs: tour.durationMs })),
  ].sort((a, b) => b.durationMs - a.durationMs).slice(0, 8) : []
  const maxDuration = Math.max(1, ...watchedSections.map(section => section.durationMs))

  return <div className="dnp-analytics">
    <header className="dnp-a-header"><div><span className="dnp-a-eyebrow">Analityka · dane serwera</span><h2>Droga odwiedzających przez stronę</h2><p>Każdy wiersz historii pochodzi z zapisanych zdarzeń. Powroty rozpoznajemy po anonimowym identyfikatorze, wyłącznie po zgodzie analitycznej.</p></div><button className="dnp-a-refresh" type="button" onClick={() => void loadSummary()}><RotateCcw aria-hidden="true" /> Odśwież</button></header>
    <div className="dnp-a-controls"><div role="group" aria-label="Zakres dat">{[7,30,90,180].map(days => <button key={days} type="button" className={range === days ? 'is-active' : ''} aria-pressed={range === days} onClick={() => setRange(days)}>{days} dni</button>)}</div><span role="status">{status}</span></div>
    {!serverSession && <label className="dnp-a-key">Klucz administratora<input type="password" autoComplete="off" value={key} onChange={event => setKey(event.target.value)} /><button className="dnp-a-refresh" type="button" onClick={() => void loadSummary()}>Pobierz dane</button></label>}
    {!summary ? <div className="dnp-a-empty" role="status">{status}</div> : <>
      <section className="dnp-a-kpis" aria-label="Podsumowanie ruchu">
        <article><Users aria-hidden="true" /><span>Odwiedzający</span><strong>{summary.uniqueVisitors}</strong><small>anonimowych identyfikatorów</small></article>
        <article><Gauge aria-hidden="true" /><span>Wizyty</span><strong>{summary.uniqueVisits}</strong><small>otwarć strony</small></article>
        <article><RotateCcw aria-hidden="true" /><span>Powracający</span><strong>{summary.returningVisitors}</strong><small>więcej niż jedna wizyta</small></article>
        <article><CalendarDays aria-hidden="true" /><span>Łączny czas</span><strong>{duration(summary.engagedDurationMs)}</strong><small>sekcje i spacer 360</small></article>
      </section>
      <div className="dnp-a-top-grid">
        <section className="dnp-a-card"><div className="dnp-a-card-head"><div><span>Sekcje</span><h3>Najdłużej oglądane</h3></div><small>Łączny aktywny czas</small></div>
          {watchedSections.length ? <ol className="dnp-a-sections">{watchedSections.map((section, index) => <li key={section.id}><span className="dnp-a-rank">{String(index + 1).padStart(2, '0')}</span><div><div className="dnp-a-section-line"><strong>{sectionName(section.id)}</strong><b>{duration(section.durationMs)}</b></div><div className="dnp-a-bar"><i style={{ width: `${Math.max(3, section.durationMs / maxDuration * 100)}%` }} /></div><small>{section.views} zarejestrowanych wejść</small></div></li>)}</ol> : <p className="dnp-a-empty-inline">Nie zarejestrowano jeszcze czasu w sekcjach.</p>}
        </section>
        <section className="dnp-a-card"><div className="dnp-a-card-head"><div><span>Anonimowe identyfikatory</span><h3>Odwiedzający i powroty</h3></div><small>{summary.visitors.length} ostatnich</small></div>
          <div className="dnp-a-visitors">{summary.visitors.length ? summary.visitors.map(visitor => <button key={visitor.lookup} type="button" className={selected === visitor.lookup ? 'is-active' : ''} onClick={() => void loadJourney(visitor.lookup)}><span className="dnp-a-avatar"><Users aria-hidden="true" /></span><span><strong>Odwiedzający {visitor.id}</strong><small>{dateTime(visitor.lastSeen)} · {deviceName(visitor.device)}</small></span><b>{visitor.visits} {visitor.visits === 1 ? 'wizyta' : 'wizyt'}</b><ChevronRight aria-hidden="true" /></button>) : <p className="dnp-a-empty-inline">Brak zarejestrowanych odwiedzających w tym okresie.</p>}</div>
        </section>
      </div>
      {selected && <section className="dnp-a-card dnp-a-detail" aria-label="Przebieg wizyt odwiedzającego">
        <div className="dnp-a-card-head"><div><span>Historia jednego identyfikatora</span><h3>Przebieg wizyt</h3><p>{selectedVisitor ? `Odwiedzający ${selectedVisitor.id} · ${selectedVisitor.visits} ${selectedVisitor.visits === 1 ? 'wizyta' : 'wizyt'} · ${duration(selectedVisitor.durationMs)} aktywnego czasu` : 'Odwiedzający'}</p></div></div>
        {journeyStatus && <p className="dnp-a-inline-status" role="status">{journeyStatus}</p>}
        {journey && <>
          <div className="dnp-a-visit-picker" role="group" aria-label="Wybierz wizytę">{journey.visits.map((visit, index) => <button type="button" key={visit.id} className={visit.id === journey.selectedVisit ? 'is-active' : ''} aria-pressed={visit.id === journey.selectedVisit} onClick={() => void loadJourney(selected, visit.id)}><span>{index === journey.visits.length - 1 ? 'Pierwsza wizyta' : 'Powrót'}</span><strong>{dateTime(visit.firstSeen)}</strong><small>{duration(visit.durationMs)} aktywnie · {deviceName(visit.device)} · {visit.source}</small></button>)}</div>
          {selectedVisit && <><div className="dnp-a-timeline-head"><div><span>Wybrana wizyta</span><h4>Sekcje w czasie</h4></div><p>Oś pozioma: godzina · oś pionowa: sekcja. Ciągła linia łączy zarejestrowane wejścia i zakończenia pomiaru czasu.</p></div>
            <Timeline visit={selectedVisit} events={journey.events} />
            <details className="dnp-a-activity"><summary>Lista zdarzeń tej wizyty ({journey.events.length})</summary><ol>{journey.events.map((event, index) => <li key={`${event.at}-${index}`}><time>{clock(Date.parse(event.at))}</time><strong>{sectionKey(event) ? sectionName(sectionKey(event)) : event.type.replaceAll('_', ' ')}</strong><small>{event.durationMs ? duration(event.durationMs) : 'wejście / akcja'}{event.house && event.house !== 'unknown' ? ` · dom ${event.house}` : ''}</small></li>)}</ol></details>
          </>}
          {journey.truncated && <p className="dnp-a-note">Lista zdarzeń jest ograniczona do pierwszych 400 wpisów tej wizyty.</p>}
        </>}
      </section>}
      <p className="dnp-a-note">Pomiar opisuje kolejność oglądanych sekcji, a nie dokładne piksele przewijania. Nie łączymy analityki z danymi z formularzy. Dane wcześniejsze niż uruchomienie pomiaru nie są odtwarzane.</p>
    </>}
  </div>
}
