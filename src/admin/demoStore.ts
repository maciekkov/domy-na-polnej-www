import { parseSiteData } from '../data/runtime/siteSchema.mjs'
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
  oldPrice: number | null
  newPrice: number | null
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
    priceHistory: [],
    leads: [],
    audit: [],
    revisions: [],
    lastBackupAt: '',
    govMode: 'demo',
  }
}

export function readAdminState(): AdminState {
  try {
    const value = localStorage.getItem(ADMIN_STATE_KEY)
    if (!value) return seedAdminState()
    const parsed = JSON.parse(value) as AdminState
    parseSiteData(parsed.draft, { allowDraftPrices: true }); parseSiteData(parsed.published)
    for (const field of ['leads','revisions','audit','priceHistory'] as const) if (!Array.isArray(parsed[field])) return seedAdminState()
    // Remove sample records shipped in earlier versions, also from browsers
    // that persisted that local demo. Preserve any records created by the user.
    return {
      ...parsed,
      leads: parsed.leads.filter((lead) => !['demo-1', 'demo-2', 'demo-3'].includes(lead.id)),
      priceHistory: parsed.priceHistory.filter((entry) => !entry.id.startsWith('seed-')),
      audit: parsed.audit.filter((entry) => entry.id !== 'audit-seed'),
      revisions: parsed.revisions.filter((entry) => !(entry.id === 1 && entry.summary === 'Wersja początkowa 01–12')),
      lastBackupAt: parsed.lastBackupAt === '2026-09-13T03:10:00.000Z' ? '' : parsed.lastBackupAt,
    }
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
  if (!value || !Number.isFinite(Date.parse(value))) return '—'
  return new Intl.DateTimeFormat('pl-PL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}
