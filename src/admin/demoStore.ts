import { fallbackSiteData } from '../data/runtime/fallback'
import type { SiteData } from '../data/runtime/types'

export const ADMIN_STATE_KEY = 'dnp-admin-demo-state-v1'
export const ADMIN_SESSION_KEY = 'dnp-admin-demo-session-v1'

export type LeadStatus = 'new' | 'contacted' | 'meeting' | 'reserved' | 'sold' | 'lost'
export type Lead = {
  id: string
  createdAt: string
  name: string
  phone: string
  email: string
  houseCode: string
  source: string
  campaign: string
  status: LeadStatus
  message: string
  note: string
}

export type PriceHistoryEntry = {
  id: string
  houseId: string
  oldPrice: number
  newPrice: number
  changedAt: string
  changedBy: string
  reason: string
  revisionId?: number
  govSyncStatus: 'demo' | 'not_applicable'
}

export type AuditEntry = {
  id: string
  createdAt: string
  action: string
  entity: string
  description: string
}

export type Revision = {
  id: number
  createdAt: string
  summary: string
  snapshot: SiteData
  isCurrent: boolean
}

export type AdminState = {
  draft: SiteData
  published: SiteData
  dirty: boolean
  priceHistory: PriceHistoryEntry[]
  leads: Lead[]
  audit: AuditEntry[]
  revisions: Revision[]
  lastBackupAt: string
  govMode: 'demo'
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const stamp = () => new Date().toISOString()

export const seedAdminState = (): AdminState => {
  const published = clone(fallbackSiteData)
  return {
    draft: clone(published),
    published,
    dirty: false,
    priceHistory: published.houses.map((house) => ({
      id: `seed-${house.id}`,
      houseId: house.id,
      oldPrice: house.price,
      newPrice: house.price,
      changedAt: '2026-09-13T18:00:00.000Z',
      changedBy: 'dane początkowe',
      reason: 'Import danych wersji 01–12',
      revisionId: 1,
      govSyncStatus: 'not_applicable',
    })),
    leads: [
      { id: 'demo-1', createdAt: '2026-09-13T08:42:00.000Z', name: 'Anna Nowak', phone: '+48 600 123 456', email: 'anna@example.test', houseCode: 'C', source: 'Google / organic', campaign: '—', status: 'new', message: 'Proszę o kontakt w sprawie dostępności domu C.', note: '' },
      { id: 'demo-2', createdAt: '2026-09-12T15:18:00.000Z', name: 'Piotr Zieliński', phone: '+48 600 456 789', email: 'piotr@example.test', houseCode: 'E', source: 'Instagram', campaign: 'jesien_dom_e', status: 'contacted', message: 'Chciałbym umówić prezentację działki.', note: 'Oddzwonić po 17:00.' },
      { id: 'demo-3', createdAt: '2026-09-11T10:05:00.000Z', name: 'Katarzyna W.', phone: '+48 600 987 654', email: '', houseCode: 'A', source: 'Direct', campaign: '—', status: 'meeting', message: 'Pytanie o standard i możliwość zmian.', note: 'Spotkanie w sobotę.' },
    ],
    audit: [{ id: 'audit-seed', createdAt: '2026-09-13T18:00:00.000Z', action: 'system_init', entity: 'System', description: 'Utworzono demonstracyjny stan panelu.' }],
    revisions: [{ id: 1, createdAt: '2026-09-13T18:00:00.000Z', summary: 'Wersja początkowa 01–12', snapshot: clone(published), isCurrent: true }],
    lastBackupAt: '2026-09-13T03:10:00.000Z',
    govMode: 'demo',
  }
}

export function readAdminState(): AdminState {
  try {
    const value = localStorage.getItem(ADMIN_STATE_KEY)
    return value ? JSON.parse(value) as AdminState : seedAdminState()
  } catch {
    return seedAdminState()
  }
}

export function persistAdminState(value: AdminState) {
  localStorage.setItem(ADMIN_STATE_KEY, JSON.stringify(value))
}

export function recordDemoLead(input: Pick<Lead, 'name' | 'phone' | 'email' | 'houseCode' | 'message'>) {
  const state = readAdminState()
  const lead: Lead = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: stamp(),
    source: 'Formularz WWW / demo',
    campaign: '—',
    status: 'new',
    note: '',
  }
  persistAdminState({
    ...state,
    leads: [lead, ...state.leads],
    audit: [auditEntry('lead_created', `Lead ${lead.id}`, 'Zapytanie zapisane przez formularz demonstracyjny.'), ...state.audit],
  })
  return lead
}

export function auditEntry(action: string, entity: string, description: string): AuditEntry {
  return { id: crypto.randomUUID(), createdAt: stamp(), action, entity, description }
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pl-PL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}
