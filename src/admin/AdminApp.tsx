import {
  AlertTriangle, BarChart3, BookOpen, Building2, CalendarDays, ChevronRight, ClipboardList,
  Download, ExternalLink, FileText, Gauge, HardHat, Home, KeyRound, LayoutDashboard, LogOut,
  Menu, MessageSquare, Pencil, Plus, RotateCcw, Save, Search, Settings, ShieldCheck, Upload, Users, X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { BrandLogo } from '../components/common/BrandLogo'
import { formatPrice, type House, type HouseStatus } from '../data/houses'
import { PUBLISHED_DATA_KEY, SITE_DATA_EVENT } from '../data/runtime/SiteDataProvider'
import type { SiteData, SiteDocument } from '../data/runtime/types'
import { ANALYTICS_EVENTS_KEY, type AnalyticsEvent } from '../lib/analytics'
import {
  ADMIN_SESSION_KEY, auditEntry, formatDate, persistAdminState, readAdminState,
  seedAdminState, type AdminState, type Lead, type LeadStatus,
} from './demoStore'

type AdminPage = 'dashboard' | 'houses' | 'construction' | 'documents' | 'leads' | 'analytics' | 'settings'

const pageNames: Record<AdminPage, string> = {
  dashboard: 'Pulpit', houses: 'Domy i ceny', construction: 'Budowa', documents: 'Dokumenty',
  leads: 'Zapytania', analytics: 'Analityka', settings: 'Ustawienia',
}

const menu: Array<{ id: AdminPage; icon: typeof Home }> = [
  { id: 'dashboard', icon: LayoutDashboard }, { id: 'houses', icon: Building2 },
  { id: 'construction', icon: HardHat }, { id: 'documents', icon: FileText },
  { id: 'leads', icon: MessageSquare }, { id: 'analytics', icon: BarChart3 },
  { id: 'settings', icon: Settings },
]

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const now = () => new Date().toISOString()

function Metric({ label, value, note, icon: Icon }: { label: string; value: string; note: string; icon: typeof Home }) {
  return <article className="admin-metric"><span><Icon aria-hidden="true" /></span><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div></article>
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase().replaceAll(' ', '-').replaceAll('ó', 'o')
  return <span className={`admin-status admin-status--${normalized}`}>{status}</span>
}

function Empty({ children }: { children: ReactNode }) {
  return <div className="admin-empty"><Search aria-hidden="true" /><p>{children}</p></div>
}

function useAdminModal(onClose: () => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.body.classList.add('modal-open')
    document.addEventListener('keydown', onKey)
    return () => { document.body.classList.remove('modal-open'); document.removeEventListener('keydown', onKey) }
  }, [onClose])
}

export function AdminApp() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) === 'active')
  const [state, setState] = useState<AdminState>(() => readAdminState())
  const [page, setPage] = useState<AdminPage>('dashboard')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [editingHouse, setEditingHouse] = useState<House['id'] | null>(null)
  const [priceCandidate, setPriceCandidate] = useState<{ house: House; price: number; reason: string } | null>(null)
  const [leadDetail, setLeadDetail] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  useEffect(() => persistAdminState(state), [state])
  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(''), 3200)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const updateDraft = (updater: (draft: SiteData) => void, action = 'draft_update', entity = 'Dane strony') => {
    setState((current) => {
      const draft = clone(current.draft)
      updater(draft)
      return { ...current, draft, dirty: true, audit: [auditEntry(action, entity, 'Zapisano zmianę w wersji roboczej.'), ...current.audit] }
    })
  }

  const publish = () => {
    setState((current) => {
      if (!current.dirty) return current
      const revisionId = Math.max(...current.revisions.map((item) => item.id), 0) + 1
      const published: SiteData = { ...clone(current.draft), revision: revisionId, publishedAt: new Date().toLocaleString('pl-PL') }
      localStorage.setItem(PUBLISHED_DATA_KEY, JSON.stringify(published))
      window.dispatchEvent(new Event(SITE_DATA_EVENT))
      return {
        ...current, draft: clone(published), published, dirty: false,
        revisions: [
          { id: revisionId, createdAt: now(), summary: 'Publikacja zmian z panelu demonstracyjnego', snapshot: clone(published), isCurrent: true },
          ...current.revisions.map((item) => ({ ...item, isCurrent: false })),
        ],
        audit: [auditEntry('publish', `Rewizja ${revisionId}`, 'Opublikowano atomowo aktualny snapshot danych.'), ...current.audit],
      }
    })
    setNotice('Zmiany opublikowane. Publiczna strona odczyta nowy snapshot na tym urządzeniu.')
  }

  if (!authenticated) return <AdminLogin onSuccess={() => setAuthenticated(true)} />

  const logout = () => { sessionStorage.removeItem(ADMIN_SESSION_KEY); setAuthenticated(false) }
  const changePage = (next: AdminPage) => { setPage(next); setMobileMenu(false) }

  return (
    <div className="admin-app">
      <aside className={`admin-sidebar ${mobileMenu ? 'is-open' : ''}`}>
        <div className="admin-sidebar__brand"><BrandLogo tone="dark" compact /><button type="button" onClick={() => setMobileMenu(false)} aria-label="Zamknij menu"><X /></button></div>
        <div className="admin-demo-badge"><ShieldCheck /> Środowisko demo</div>
        <nav aria-label="Panel administratora">
          {menu.map((item) => {
            const Icon = item.icon
            return <button key={item.id} type="button" className={page === item.id ? 'is-active' : ''} onClick={() => changePage(item.id)}><Icon /><span>{pageNames[item.id]}</span><ChevronRight /></button>
          })}
        </nav>
        <div className="admin-sidebar__footer"><a href="/" target="_blank" rel="noreferrer"><ExternalLink /> Otwórz stronę</a><button type="button" onClick={logout}><LogOut /> Wyloguj</button></div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-button" type="button" onClick={() => setMobileMenu(true)} aria-label="Otwórz menu"><Menu /></button>
          <div><span>Domy na Polnej</span><h1>{pageNames[page]}</h1></div>
          <div className="admin-topbar__actions">
            {state.dirty && <span className="admin-draft-indicator">Nieopublikowane zmiany</span>}
            <button className="admin-button admin-button--primary" type="button" onClick={publish} disabled={!state.dirty}><Upload /> Publikuj zmiany</button>
          </div>
        </header>
        <div className="admin-safety-banner"><AlertTriangle /><div><strong>Tryb DEMO</strong><span>Dane cenowe nie są wysyłane do żadnego zewnętrznego systemu. Wysyłka produkcyjna jest twardo zablokowana.</span></div></div>

        <div className="admin-content">
          {page === 'dashboard' && <Dashboard state={state} setPage={changePage} />}
          {page === 'houses' && <HousesPage state={state} onEdit={setEditingHouse} />}
          {page === 'construction' && <ConstructionPage state={state} updateDraft={updateDraft} />}
          {page === 'documents' && <DocumentsPage state={state} updateDraft={updateDraft} />}
          {page === 'leads' && <LeadsPage state={state} setState={setState} onOpen={setLeadDetail} />}
          {page === 'analytics' && <AnalyticsPage state={state} />}
          {page === 'settings' && <SettingsPage state={state} setState={setState} updateDraft={updateDraft} onNotice={setNotice} />}
        </div>
      </main>

      {editingHouse && <HouseEditor house={state.draft.houses.find((item) => item.id === editingHouse)!} history={state.priceHistory.filter((item) => item.houseId === editingHouse)} onClose={() => setEditingHouse(null)} onStatus={(status) => updateDraft((draft) => { draft.houses.find((item) => item.id === editingHouse)!.status = status }, 'status_change', `Dom ${editingHouse}`)} onSave={(house) => updateDraft((draft) => { const index = draft.houses.findIndex((item) => item.id === house.id); draft.houses[index] = house }, 'house_update', house.name)} onPrice={(price, reason) => setPriceCandidate({ house: state.draft.houses.find((item) => item.id === editingHouse)!, price, reason })} />}
      {priceCandidate && <PriceConfirmation candidate={priceCandidate} onCancel={() => setPriceCandidate(null)} onConfirm={() => {
        setState((current) => {
          const draft = clone(current.draft)
          const house = draft.houses.find((item) => item.id === priceCandidate.house.id)!
          const oldPrice = house.price
          house.price = priceCandidate.price
          return { ...current, draft, dirty: true, priceHistory: [{ id: crypto.randomUUID(), houseId: house.id, oldPrice, newPrice: priceCandidate.price, changedAt: now(), changedBy: 'admin (demo)', reason: priceCandidate.reason, govSyncStatus: 'demo' }, ...current.priceHistory], audit: [auditEntry('price_change', house.name, `${formatPrice(oldPrice)} → ${formatPrice(priceCandidate.price)}`), ...current.audit] }
        })
        setPriceCandidate(null)
        setNotice('Cena zapisana w trwałej historii draftu. Opublikuj zmiany, aby pokazać ją na stronie.')
      }} />}
      {leadDetail && <LeadDrawer lead={state.leads.find((item) => item.id === leadDetail)!} onClose={() => setLeadDetail(null)} onSave={(lead) => setState((current) => ({ ...current, leads: current.leads.map((item) => item.id === lead.id ? lead : item), audit: [auditEntry('lead_update', lead.name, `Status: ${lead.status}`), ...current.audit] }))} />}
      <div className={`admin-notice ${notice ? 'is-visible' : ''}`} role="status">{notice}</div>
      {mobileMenu && <button className="admin-sidebar-backdrop" type="button" onClick={() => setMobileMenu(false)} aria-label="Zamknij menu" />}
    </div>
  )
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (login === 'admin' && password === 'admin') {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'active')
      onSuccess()
    } else setError('Nieprawidłowy login lub hasło.')
  }
  return <main className="admin-login"><section className="admin-login__card"><BrandLogo tone="dark" /><div className="admin-demo-badge"><ShieldCheck /> Panel demonstracyjny</div><h1>Zaloguj się</h1><p>Zarządzaj ofertą, budową, zapytaniami i statystykami inwestycji.</p><form onSubmit={submit}><label>Login<input value={login} onChange={(event) => setLogin(event.target.value)} autoComplete="username" autoFocus /></label><label>Hasło<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>{error && <div className="admin-form-error" role="alert">{error}</div>}<button className="admin-button admin-button--primary" type="submit"><KeyRound /> Zaloguj</button></form><small>Wersja DEMO · login: admin · hasło: admin</small><a href="/">← Wróć do strony publicznej</a></section></main>
}

function Dashboard({ state, setPage }: { state: AdminState; setPage: (page: AdminPage) => void }) {
  const available = state.published.houses.filter((item) => item.status === 'Dostępny').length
  const reserved = state.published.houses.filter((item) => item.status === 'Rezerwacja').length
  const newLeads = state.leads.filter((item) => item.status === 'new').length
  const events = readAnalytics()
  const issues = [
    ...state.draft.documents.filter((item) => !item.active).map((item) => `Brak aktywnego dokumentu: ${item.title}`),
    ...(state.dirty ? ['W panelu znajdują się nieopublikowane zmiany.'] : []),
    'Daty harmonogramu i wpisy dziennika wymagają potwierdzenia przed publikacją.',
  ]
  return <>
    <div className="admin-metrics">
      <Metric icon={Home} label="Oferta" value={`${available} dostępne`} note={`${reserved} rezerwacja · ${5 - available - reserved} sprzedanych`} />
      <Metric icon={MessageSquare} label="Nowe zapytania" value={`${newLeads} nowe`} note={`${state.leads.length} wszystkich w demo`} />
      <Metric icon={Gauge} label="Zmierzony ruch — 30 dni" value={`${new Set(events.map((item) => item.sessionId || item.id)).size} sesji`} note="Wyłącznie po zgodzie analitycznej" />
      <Metric icon={BarChart3} label="Konwersje" value={`${events.filter((item) => item.eventName === 'contact_submit').length} kontaktów`} note="Dane tego urządzenia" />
      <Metric icon={Building2} label="Najpopularniejszy dom" value={mostPopularHouse(events)} note="Według wyborów domu" />
      <Metric icon={Users} label="Najlepsze źródło" value={topSource(state.leads)} note="Według leadów demo" />
    </div>
    <div className="admin-dashboard-grid">
      <section className="admin-panel"><div className="admin-panel__heading"><div><span>Kontrola jakości</span><h2>Wymaga uwagi</h2></div><b>{issues.length}</b></div><ul className="admin-alert-list">{issues.map((issue) => <li key={issue}><AlertTriangle /><span>{issue}</span></li>)}</ul></section>
      <section className="admin-panel"><div className="admin-panel__heading"><div><span>Mini CRM</span><h2>Ostatnie zapytania</h2></div><button type="button" onClick={() => setPage('leads')}>Wszystkie <ChevronRight /></button></div><div className="admin-compact-leads">{state.leads.slice(0, 5).map((lead) => <div key={lead.id}><span><strong>{lead.name}</strong><small>{formatDate(lead.createdAt)} · Dom {lead.houseCode}</small></span><StatusPill status={leadStatusLabel(lead.status)} /></div>)}</div></section>
    </div>
  </>
}

function HousesPage({ state, onEdit }: { state: AdminState; onEdit: (id: House['id']) => void }) {
  return <section className="admin-panel"><div className="admin-panel__heading"><div><span>Oferta A–E</span><h2>Domy i ceny</h2><p>Zmiany zapisujesz w wersji roboczej, a na stronę trafiają dopiero po publikacji.</p></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Dom</th><th>Status</th><th>Aktualna cena</th><th>Działka</th><th>PDF</th><th>Akcje</th></tr></thead><tbody>{state.draft.houses.map((house) => <tr key={house.id}><td><strong>{house.name}</strong><small>dz. {house.parcel}</small></td><td><StatusPill status={house.status} /></td><td><strong>{formatPrice(house.price)}</strong>{state.published.houses.find((item) => item.id === house.id)?.price !== house.price && <small className="admin-changed">zmiana w draft</small>}</td><td>{house.plot} m²</td><td><a href={house.pdf} target="_blank" rel="noreferrer">Podgląd <ExternalLink /></a></td><td><button className="admin-icon-button" type="button" onClick={() => onEdit(house.id)} aria-label={`Edytuj ${house.name}`}><Pencil /></button></td></tr>)}</tbody></table></div></section>
}

function HouseEditor({ house, history, onClose, onStatus, onSave, onPrice }: { house: House; history: AdminState['priceHistory']; onClose: () => void; onStatus: (status: HouseStatus) => void; onSave: (house: House) => void; onPrice: (price: number, reason: string) => void }) {
  useAdminModal(onClose)
  const [form, setForm] = useState(() => clone(house))
  const [newPrice, setNewPrice] = useState(house.price)
  const [reason, setReason] = useState('')
  return <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="house-editor-title"><button className="admin-modal__backdrop" type="button" onClick={onClose} aria-label="Zamknij" /><section className="admin-drawer"><header><div><span>Edycja oferty</span><h2 id="house-editor-title">{house.name}</h2></div><button type="button" onClick={onClose} aria-label="Zamknij"><X /></button></header><div className="admin-drawer__body">
    <div className="admin-form-section"><h3>Oferta</h3><div className="admin-form-grid"><label>Status<select value={form.status} onChange={(event) => { const status = event.target.value as HouseStatus; setForm({ ...form, status }); onStatus(status) }}><option>Dostępny</option><option>Rezerwacja</option><option>Sprzedany</option></select></label><label>Powierzchnia domu<input type="number" value={form.area} onChange={(event) => setForm({ ...form, area: Number(event.target.value) })} /></label><label>Powierzchnia działki<input type="number" value={form.plot} onChange={(event) => setForm({ ...form, plot: Number(event.target.value) })} /></label><label>Pokoje<input type="number" value={form.rooms} onChange={(event) => setForm({ ...form, rooms: Number(event.target.value) })} /></label><label>Miejsca postojowe<input type="number" value={form.parking} onChange={(event) => setForm({ ...form, parking: Number(event.target.value) })} /></label><label>Numer działki<input value={form.parcel} onChange={(event) => setForm({ ...form, parcel: event.target.value })} /></label></div><button className="admin-button" type="button" onClick={() => onSave(form)}><Save /> Zapisz parametry w draft</button></div>
    <div className="admin-form-section admin-price-box"><h3>Zmiana ceny</h3><p>Zmiana ceny zawsze tworzy wpis w nieusuwalnej historii.</p><label>Obecna cena<input value={formatPrice(house.price)} disabled /></label><label>Nowa cena<input type="number" value={newPrice} onChange={(event) => setNewPrice(Number(event.target.value))} /></label><label>Powód zmiany <small>(opcjonalnie)</small><input value={reason} onChange={(event) => setReason(event.target.value)} /></label><button className="admin-button admin-button--primary" type="button" disabled={newPrice === house.price || newPrice < 1} onClick={() => onPrice(newPrice, reason)}>Zapisz zmianę ceny</button></div>
    <div className="admin-form-section"><h3>Materiały i integracje</h3><label>Karta PDF<input value={form.pdf} onChange={(event) => setForm({ ...form, pdf: event.target.value })} /></label><label>Zdjęcie główne<input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} /></label><p className="admin-help">Kontekst URL i masterplanu pozostaje przypisany do kodu {house.id}. Geometria mapy nie jest edytowana w panelu.</p></div>
    <div className="admin-form-section"><h3>Historia cen</h3><div className="admin-history">{history.map((item) => <div key={item.id}><time>{formatDate(item.changedAt)}</time><strong>{formatPrice(item.newPrice)}</strong><span>{item.reason || 'Bez opisu'} · {item.govSyncStatus === 'demo' ? 'DEMO' : 'import'}</span></div>)}</div></div>
  </div></section></div>
}

function PriceConfirmation({ candidate, onCancel, onConfirm }: { candidate: { house: House; price: number; reason: string }; onCancel: () => void; onConfirm: () => void }) {
  useAdminModal(onCancel)
  return <div className="admin-modal admin-modal--center" role="alertdialog" aria-modal="true" aria-labelledby="price-title"><button className="admin-modal__backdrop" type="button" onClick={onCancel} aria-label="Anuluj" /><section className="admin-confirm"><AlertTriangle /><h2 id="price-title">Zmiana ceny {candidate.house.name}</h2><div className="admin-price-diff"><span>{formatPrice(candidate.house.price)}</span><ChevronRight /><strong>{formatPrice(candidate.price)}</strong></div><p>Zmiana zostanie dopisana do trwałej historii cen. Poprzedniego wpisu nie będzie można usunąć.</p><div><button className="admin-button" type="button" onClick={onCancel}>Anuluj</button><button className="admin-button admin-button--primary" type="button" onClick={onConfirm}>Potwierdź zmianę</button></div></section></div>
}

function ConstructionPage({ state, updateDraft }: { state: AdminState; updateDraft: (updater: (draft: SiteData) => void, action?: string, entity?: string) => void }) {
  const [tab, setTab] = useState<'schedule' | 'journal'>('schedule')
  return <><div className="admin-tabs"><button className={tab === 'schedule' ? 'is-active' : ''} type="button" onClick={() => setTab('schedule')}><CalendarDays /> Harmonogram</button><button className={tab === 'journal' ? 'is-active' : ''} type="button" onClick={() => setTab('journal')}><BookOpen /> Dziennik budowy</button></div>
    {tab === 'schedule' ? <section className="admin-panel"><div className="admin-panel__heading"><div><span>Etapy I–V</span><h2>Harmonogram</h2><p>Liczba etapów jest zamrożona. Możesz aktualizować status, opis i planowany okres.</p></div></div><div className="admin-schedule-editor">{state.draft.schedule.map((stage, index) => <article key={stage.id}><b>{stage.id}</b><div><strong>{stage.title}</strong><label>Status<select value={stage.state} onChange={(event) => updateDraft((draft) => { const target = draft.schedule[index]; target.state = event.target.value as typeof target.state; target.status = target.state === 'completed' ? 'Zakończone' : target.state === 'current' ? 'W trakcie' : 'Planowane' }, 'schedule_update', `Etap ${stage.id}`)}><option value="completed">Zakończony</option><option value="current">Aktualny</option><option value="planned">Planowany</option></select></label><label>Termin<input value={stage.term} onChange={(event) => updateDraft((draft) => { draft.schedule[index].term = event.target.value }, 'schedule_update', `Etap ${stage.id}`)} /></label><label>Opis<input value={stage.description} onChange={(event) => updateDraft((draft) => { draft.schedule[index].description = event.target.value }, 'schedule_update', `Etap ${stage.id}`)} /></label></div></article>)}</div></section>
    : <section className="admin-panel"><div className="admin-panel__heading"><div><span>Aktualizacje inwestycji</span><h2>Dziennik budowy</h2><p>Wpisy pozostają w wersji roboczej do momentu publikacji całego snapshotu.</p></div><button className="admin-button admin-button--primary" type="button" onClick={() => updateDraft((draft) => { draft.journal.unshift({ id: `nowy-wpis-${Date.now()}`, date: new Date().toLocaleDateString('pl-PL'), title: 'Nowy wpis roboczy', description: 'Uzupełnij rzetelny opis wykonanych prac.', photoCount: 0, cover: '/assets/images/neighborhood/plots-front.webp', coverAlt: 'Materiał roboczy — wymaga podmiany na zdjęcie budowy', photos: [] }) }, 'journal_create', 'Nowy wpis')}><Plus /> Dodaj wpis</button></div><div className="admin-journal-editor">{state.draft.journal.map((entry, index) => <article key={entry.id}><img src={entry.cover} alt="" /><div><label>Data<input value={entry.date} onChange={(event) => updateDraft((draft) => { draft.journal[index].date = event.target.value }, 'journal_update', entry.title)} /></label><label>Tytuł<input value={entry.title} onChange={(event) => updateDraft((draft) => { draft.journal[index].title = event.target.value }, 'journal_update', entry.title)} /></label><label>Opis<textarea rows={3} value={entry.description} onChange={(event) => updateDraft((draft) => { draft.journal[index].description = event.target.value }, 'journal_update', entry.title)} /></label><small>{entry.photoCount} zdjęć · slug: {entry.id}</small></div></article>)}</div></section>}
  </>
}

function DocumentsPage({ state, updateDraft }: { state: AdminState; updateDraft: (updater: (draft: SiteData) => void, action?: string, entity?: string) => void }) {
  const updateDocument = (index: number, changes: Partial<SiteDocument>) => updateDraft((draft) => { draft.documents[index] = { ...draft.documents[index], ...changes, updatedAt: new Date().toLocaleDateString('pl-PL') }; const doc = draft.documents[index]; if (doc.type === 'standard_pdf' && doc.publicUrl) draft.standardPdf = doc.publicUrl; if (doc.type === 'house_card' && doc.houseId && doc.publicUrl) draft.houses.find((item) => item.id === doc.houseId)!.pdf = doc.publicUrl }, 'document_update', state.draft.documents[index].title)
  return <section className="admin-panel"><div className="admin-panel__heading"><div><span>Pliki publiczne</span><h2>Dokumenty</h2><p>Panel pilnuje aktywności i publicznych adresów. W trybie lokalnym wybór pliku rejestruje metadane, a docelowy upload wykona backend Hostinger.</p></div></div><div className="admin-documents">{state.draft.documents.map((doc, index) => <article key={doc.id}><span className="admin-document-icon"><FileText /></span><div><strong>{doc.title}</strong><small>Wersja {doc.version} · {doc.updatedAt} · {doc.sizeLabel}</small><label>Publiczny URL<input value={doc.publicUrl} onChange={(event) => updateDocument(index, { publicUrl: event.target.value })} placeholder="/documents/plik.pdf" /></label></div><div className="admin-document-actions"><StatusPill status={doc.active ? 'Aktywny' : 'Brak pliku'} />{doc.publicUrl && <a href={doc.publicUrl} target="_blank" rel="noreferrer" aria-label={`Podgląd ${doc.title}`}><ExternalLink /></a>}<label className="admin-icon-button" title="Zarejestruj nowy plik"><Upload /><input type="file" accept="application/pdf" onChange={(event) => { const file = event.target.files?.[0]; if (file) updateDocument(index, { active: true, version: String(Number.parseFloat(doc.version || '0') + .1), sizeLabel: `${(file.size / 1048576).toFixed(1)} MB` }) }} /></label><button className="admin-icon-button" type="button" onClick={() => updateDocument(index, { active: !doc.active })} aria-label={doc.active ? `Dezaktywuj ${doc.title}` : `Aktywuj ${doc.title}`}><ShieldCheck /></button></div></article>)}</div></section>
}

function LeadsPage({ state, setState, onOpen }: { state: AdminState; setState: React.Dispatch<React.SetStateAction<AdminState>>; onOpen: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const leads = state.leads.filter((lead) => `${lead.name} ${lead.houseCode} ${lead.phone}`.toLowerCase().includes(query.toLowerCase()))
  return <section className="admin-panel"><div className="admin-panel__heading"><div><span>Mini CRM</span><h2>Zapytania</h2><p>Dane osobowe pozostają wyłącznie w tej części panelu i nie są łączone z eventami analitycznymi.</p></div><label className="admin-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Szukaj klienta lub domu" /></label></div>{leads.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Data</th><th>Klient</th><th>Dom</th><th>Źródło</th><th>Status</th><th>Akcje</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id}><td>{formatDate(lead.createdAt)}</td><td><strong>{lead.name}</strong><small>{lead.phone}</small></td><td>Dom {lead.houseCode}</td><td>{lead.source}<small>{lead.campaign !== '—' ? lead.campaign : ''}</small></td><td><select className="admin-status-select" value={lead.status} onChange={(event) => setState((current) => ({ ...current, leads: current.leads.map((item) => item.id === lead.id ? { ...item, status: event.target.value as LeadStatus } : item), audit: [auditEntry('lead_status', lead.name, `Nowy status: ${event.target.value}`), ...current.audit] }))}>{leadStatusOptions()}</select></td><td><button className="admin-icon-button" type="button" onClick={() => onOpen(lead.id)} aria-label={`Otwórz zapytanie ${lead.name}`}><ChevronRight /></button></td></tr>)}</tbody></table></div> : <Empty>Brak zapytań spełniających kryteria.</Empty>}</section>
}

function LeadDrawer({ lead, onClose, onSave }: { lead: Lead; onClose: () => void; onSave: (lead: Lead) => void }) {
  useAdminModal(onClose)
  const [form, setForm] = useState(() => clone(lead))
  return <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="lead-title"><button className="admin-modal__backdrop" type="button" onClick={onClose} aria-label="Zamknij" /><section className="admin-drawer"><header><div><span>Zapytanie · Dom {lead.houseCode}</span><h2 id="lead-title">{lead.name}</h2></div><button type="button" onClick={onClose}><X /></button></header><div className="admin-drawer__body"><div className="admin-lead-contact"><a href={`tel:${lead.phone}`}>{lead.phone}</a>{lead.email && <a href={`mailto:${lead.email}`}>{lead.email}</a>}<small>{formatDate(lead.createdAt)} · {lead.source} · {lead.campaign}</small></div><div className="admin-form-section"><h3>Wiadomość</h3><p>{lead.message}</p></div><div className="admin-form-section"><label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as LeadStatus })}>{leadStatusOptions()}</select></label><label>Notatka<textarea rows={6} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></label><button className="admin-button admin-button--primary" type="button" onClick={() => { onSave(form); onClose() }}><Save /> Zapisz</button></div></div></section></div>
}

function AnalyticsPage({ state }: { state: AdminState }) {
  const [range, setRange] = useState('30')
  const events = readAnalytics().filter((event) => Date.now() - new Date(event.createdAt).getTime() < Number(range) * 86400000)
  const counts = (name: AnalyticsEvent['eventName']) => events.filter((item) => item.eventName === name).length
  const rows = state.draft.houses.map((house) => ({ id: house.id, selections: events.filter((item) => item.houseCode === house.id && item.eventName === 'house_select').length, pdf: events.filter((item) => item.houseCode === house.id && item.eventName === 'house_pdf_download').length, leads: state.leads.filter((item) => item.houseCode === house.id).length }))
  const max = Math.max(...rows.map((item) => item.selections + item.pdf + item.leads), 1)
  return <><div className="admin-page-tools"><div className="admin-tabs"><button className={range === '7' ? 'is-active' : ''} onClick={() => setRange('7')} type="button">7 dni</button><button className={range === '30' ? 'is-active' : ''} onClick={() => setRange('30')} type="button">30 dni</button><button className={range === '90' ? 'is-active' : ''} onClick={() => setRange('90')} type="button">90 dni</button></div><span>First-party · bez GA4 · bez PII</span></div><div className="admin-metrics admin-metrics--analytics"><Metric icon={Gauge} label="Zmierzone sesje" value={String(new Set(events.map((item) => item.sessionId || item.id)).size)} note="Po zgodzie" /><Metric icon={MessageSquare} label="Leady" value={String(state.leads.length)} note="Formularze demo" /><Metric icon={Download} label="Pobrania PDF" value={String(counts('house_pdf_download'))} note="Karty domów" /><Metric icon={Home} label="Starty spaceru" value={String(counts('tour_start'))} note={`${counts('tour_engaged')} zaangażowanych`} /></div><div className="admin-analytics-grid"><section className="admin-panel"><div className="admin-panel__heading"><div><span>Lejek</span><h2>Ścieżka do kontaktu</h2></div></div><div className="admin-funnel"><div><strong>{events.length}</strong><span>Eventy</span></div><ChevronRight /><div><strong>{counts('house_select')}</strong><span>Wybrano dom</span></div><ChevronRight /><div><strong>{counts('house_pdf_download') + counts('house_card_open') + counts('tour_engaged')}</strong><span>Wysoka intencja</span></div><ChevronRight /><div><strong>{counts('contact_submit')}</strong><span>Kontakt</span></div></div></section><section className="admin-panel"><div className="admin-panel__heading"><div><span>A–E</span><h2>Zainteresowanie domami</h2></div></div><div className="admin-house-bars">{rows.map((row) => <div key={row.id}><b>{row.id}</b><span><i style={{ width: `${((row.selections + row.pdf + row.leads) / max) * 100}%` }} /></span><small>{row.selections} wyborów · {row.pdf} PDF · {row.leads} leadów</small></div>)}</div></section></div><section className="admin-panel"><div className="admin-panel__heading"><div><span>Prywatność</span><h2>Zakres pomiaru</h2></div></div><p className="admin-help">Analityka uruchamia się wyłącznie po zgodzie. Nie zapisuje imienia, telefonu, e-maila, wiadomości, ruchu myszy ani nagrań sesji. Odmowa nie wpływa na działanie strony.</p></section></>
}

function SettingsPage({ state, setState, updateDraft, onNotice }: { state: AdminState; setState: React.Dispatch<React.SetStateAction<AdminState>>; updateDraft: (updater: (draft: SiteData) => void, action?: string, entity?: string) => void; onNotice: (text: string) => void }) {
  const contact = state.draft.contact
  const setContact = (key: keyof typeof contact, value: string) => updateDraft((draft) => { draft.contact[key] = value; if (key === 'phoneDisplay') draft.contact.phoneHref = `tel:${value.replace(/[^+\d]/g, '')}`; if (key === 'email') draft.contact.emailHref = `mailto:${value}` }, 'settings_update', 'Kontakt')
  const backup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `dnp-demo-backup-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url)
    setState((current) => ({ ...current, lastBackupAt: now(), audit: [auditEntry('backup', 'System', 'Wyeksportowano lokalną kopię demonstracyjną.'), ...current.audit] }))
  }
  const reset = () => { const fresh = seedAdminState(); persistAdminState(fresh); localStorage.removeItem(PUBLISHED_DATA_KEY); setState(fresh); window.dispatchEvent(new Event(SITE_DATA_EVENT)); onNotice('Przywrócono początkowy stan demonstracyjny.') }
  return <div className="admin-settings-grid"><section className="admin-panel"><div className="admin-panel__heading"><div><span>Dane globalne</span><h2>Kontakt</h2><p>Jedna zmiana aktualizuje header, sekcję kontaktu i footer po publikacji.</p></div></div><div className="admin-form-grid"><label>Telefon<input value={contact.phoneDisplay} onChange={(event) => setContact('phoneDisplay', event.target.value)} /></label><label>E-mail<input value={contact.email} onChange={(event) => setContact('email', event.target.value)} /></label><label>Adres — linia 1<input value={contact.addressLine1} onChange={(event) => setContact('addressLine1', event.target.value)} /></label><label>Adres — linia 2<input value={contact.addressLine2} onChange={(event) => setContact('addressLine2', event.target.value)} /></label><label>Godziny kontaktu<input value={contact.contactHours} onChange={(event) => setContact('contactHours', event.target.value)} /></label><label>Instagram<input value={contact.instagramHref} onChange={(event) => setContact('instagramHref', event.target.value)} /></label><label className="admin-form-wide">Link do mapy<input value={contact.mapHref} onChange={(event) => setContact('mapHref', event.target.value)} /></label></div></section><section className="admin-panel admin-gov-panel"><div className="admin-panel__heading"><div><span>Integracja cenowa</span><h2>Gov Sync</h2></div><StatusPill status="DEMO" /></div><div className="admin-gov-status"><div><span>Integracja zewnętrzna</span><strong>Wyłączona</strong></div><div><span>Payload preview</span><strong>Dostępny</strong></div><div><span>Wysyłka produkcyjna</span><strong>Zablokowana</strong></div></div><p>Adapter może przygotować i zwalidować podgląd danych. Kod demonstracyjny nie posiada endpointu ani credentiali i nie wykonuje zewnętrznego żądania.</p><details><summary>Podgląd payloadu demo</summary><pre>{JSON.stringify({ mode: 'demo', revision: state.draft.revision, houses: state.draft.houses.map(({ id, price, status }) => ({ id, price, status })), would_send: false }, null, 2)}</pre></details></section><section className="admin-panel"><div className="admin-panel__heading"><div><span>Wersjonowanie</span><h2>Historia publikacji</h2></div></div><div className="admin-revisions">{state.revisions.map((revision) => <div key={revision.id}><span><strong>Rewizja {revision.id}</strong><small>{formatDate(revision.createdAt)} · {revision.summary}</small></span>{revision.isCurrent ? <StatusPill status="Aktualna" /> : <button className="admin-button" type="button" onClick={() => setState((current) => ({ ...current, draft: clone(revision.snapshot), dirty: true, audit: [auditEntry('rollback_prepare', `Rewizja ${revision.id}`, 'Przygotowano starszy snapshot jako nowy draft.'), ...current.audit] }))}><RotateCcw /> Przywróć jako draft</button>}</div>)}</div></section><section className="admin-panel"><div className="admin-panel__heading"><div><span>Tylko do odczytu</span><h2>Dziennik operacji</h2></div></div><div className="admin-audit-list">{state.audit.slice(0, 20).map((entry) => <div key={entry.id}><time>{formatDate(entry.createdAt)}</time><strong>{entry.action}</strong><span>{entry.entity} · {entry.description}</span></div>)}</div></section><section className="admin-panel"><div className="admin-panel__heading"><div><span>Bezpieczeństwo danych</span><h2>Kopia i reset demo</h2></div></div><p>Ostatni eksport: {formatDate(state.lastBackupAt)}. Wersja demonstracyjna zapisuje dane wyłącznie w tej przeglądarce.</p><div className="admin-button-row"><button className="admin-button admin-button--primary" type="button" onClick={backup}><Download /> Eksportuj kopię JSON</button><button className="admin-button admin-button--danger" type="button" onClick={() => window.confirm('Usunąć wszystkie lokalne zmiany demonstracyjne?') && reset()}><RotateCcw /> Resetuj demo</button></div></section></div>
}

function readAnalytics(): AnalyticsEvent[] {
  try { return JSON.parse(localStorage.getItem(ANALYTICS_EVENTS_KEY) ?? '[]') as AnalyticsEvent[] } catch { return [] }
}
function mostPopularHouse(events: AnalyticsEvent[]) {
  const counts = ['A', 'B', 'C', 'D', 'E'].map((id) => ({ id, count: events.filter((event) => event.houseCode === id).length })).sort((a, b) => b.count - a.count)
  return counts[0].count ? `Dom ${counts[0].id}` : 'Brak danych'
}
function topSource(leads: Lead[]) {
  const groups = new Map<string, number>(); leads.forEach((lead) => groups.set(lead.source, (groups.get(lead.source) ?? 0) + 1)); return [...groups].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Brak danych'
}
function leadStatusLabel(status: LeadStatus) { return ({ new: 'Nowe', contacted: 'Skontaktowano', meeting: 'Spotkanie', reserved: 'Rezerwacja', sold: 'Sprzedane', lost: 'Utracone' } as const)[status] }
function leadStatusOptions() { return (['new', 'contacted', 'meeting', 'reserved', 'sold', 'lost'] as LeadStatus[]).map((status) => <option value={status} key={status}>{leadStatusLabel(status)}</option>) }
