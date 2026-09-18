import eventNames from '../../api/event-names.json'

export const ANALYTICS_CONSENT_KEY = 'dnp-cookie-consent-v2'
export const ANALYTICS_EVENTS_KEY = 'dnp-analytics-events-v3'
const ANALYTICS_SESSION_KEY = 'dnp-analytics-session-v2'
const VISITOR_COOKIE = 'dnp_vid'
const VISIT_COOKIE = 'dnp_visit'
const VISITOR_MAX_AGE = 180 * 24 * 60 * 60
const VISIT_MAX_AGE = 30 * 60

export type AnalyticsConsent = 'all' | 'necessary'
export type AnalyticsEventName =
  | 'page_view' | 'visit_start' | 'section_view' | 'section_time'
  | 'house_select' | 'house_card_open' | 'house_contact_click' | 'house_pdf_download'
  | 'gallery_open' | 'tour_start' | 'tour_engaged' | 'tour_scene_view' | 'tour_scene_time'
  | 'contact_start' | 'contact_submit' | 'phone_click' | 'email_click' | 'directions_click'

export type AnalyticsDetails = {
  sectionId?: string
  tourMode?: 'interior' | 'exterior'
  sceneId?: string
  durationMs?: number
}

export type AnalyticsEvent = {
  id: string
  visitorId: string
  visitId: string
  sessionId: string
  createdAt: string
  eventName: AnalyticsEventName
  houseCode?: string
  pagePath: string
  source: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  referrerHost?: string
  deviceClass: 'mobile' | 'tablet' | 'desktop'
  viewportBucket: string
  sectionId?: string
  tourMode?: 'interior' | 'exterior'
  sceneId?: string
  durationMs?: number
}

let memorySession = ''
let memoryVisitor = ''
let memoryVisit = ''
const memoryOnce = new Set<string>()
let memoryConsent: AnalyticsConsent | null = null
let activeSection: { id: string; startedAt: number; houseCode?: string } | null = null
let listenersInstalled = false

const uuid = () => typeof crypto.randomUUID === 'function'
  ? crypto.randomUUID()
  : Array.from(crypto.getRandomValues(new Uint8Array(16)), x => x.toString(16).padStart(2, '0')).join('')

function clean(value: string | null | undefined, max = 80): string | undefined {
  const normalized = (value ?? '').replace(/[^a-zA-Z0-9._:-]/g, '').slice(0, max)
  return normalized || undefined
}
function readCookie(name: string): string | null {
  try {
    const prefix = `${encodeURIComponent(name)}=`
    const entry = document.cookie.split('; ').find(item => item.startsWith(prefix))
    return entry ? decodeURIComponent(entry.slice(prefix.length)) : null
  } catch { return null }
}
function setCookie(name: string, value: string, maxAge: number) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${Math.max(0, Math.floor(maxAge))}; Path=/; SameSite=Lax${secure}`
}
function clearCookie(name: string) { setCookie(name, '', 0) }

export function readConsent(): AnalyticsConsent | null {
  if (memoryConsent !== null) return memoryConsent
  try {
    const current = localStorage.getItem(ANALYTICS_CONSENT_KEY)
    if (current === 'all' || current === 'necessary') return (memoryConsent = current)
    // Migrate the previous explicit choice without silently upgrading a refusal.
    const legacy = localStorage.getItem('dnp-analytics-consent-v1')
    if (legacy === 'accepted') return (memoryConsent = 'all')
    if (legacy === 'necessary') return (memoryConsent = 'necessary')
  } catch { /* Storage may be unavailable. */ }
  return null
}

export function setConsent(value: AnalyticsConsent) {
  memoryConsent = value
  try {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, value)
    localStorage.removeItem('dnp-analytics-consent-v1')
  } catch { /* Retain this document's explicit choice in memory. */ }
  if (value === 'necessary') {
    flushSectionTime()
    memorySession = ''; memoryVisitor = ''; memoryVisit = ''; memoryOnce.clear(); activeSection = null
    clearCookie(VISITOR_COOKIE); clearCookie(VISIT_COOKIE)
    try { sessionStorage.removeItem(ANALYTICS_SESSION_KEY); localStorage.removeItem(ANALYTICS_EVENTS_KEY) } catch { /* Optional storage. */ }
  } else {
    installLifecycleListeners()
  }
  window.dispatchEvent(new Event('dnp-consent-changed'))
}

if (typeof window !== 'undefined') window.addEventListener('storage', event => {
  if (event.key !== ANALYTICS_CONSENT_KEY && event.key !== null) return
  const value = event.newValue
  memoryConsent = value === 'all' ? 'all' : value === 'necessary' ? 'necessary' : null
  if (memoryConsent !== 'all') {
    memorySession = ''; memoryVisitor = ''; memoryVisit = ''; memoryOnce.clear(); activeSection = null
    clearCookie(VISITOR_COOKIE); clearCookie(VISIT_COOKIE)
  }
  window.dispatchEvent(new Event('dnp-consent-changed'))
})

export const analyticsAllowed = () => readConsent() === 'all'

function sessionId() {
  try {
    const old = sessionStorage.getItem(ANALYTICS_SESSION_KEY)
    if (old) return old
    const id = memorySession || uuid(); memorySession = id; sessionStorage.setItem(ANALYTICS_SESSION_KEY, id); return id
  } catch { return memorySession ||= uuid() }
}
function visitorId() {
  if (!analyticsAllowed()) return ''
  const stored = readCookie(VISITOR_COOKIE)
  const id = stored && /^[a-zA-Z0-9_-]{8,100}$/.test(stored) ? stored : (memoryVisitor || uuid())
  memoryVisitor = id; setCookie(VISITOR_COOKIE, id, VISITOR_MAX_AGE); return id
}
function visitId() {
  if (!analyticsAllowed()) return ''
  const stored = readCookie(VISIT_COOKIE)
  const isExisting = stored && /^[a-zA-Z0-9_-]{8,100}$/.test(stored)
  const id = isExisting ? stored! : (memoryVisit || uuid())
  memoryVisit = id; setCookie(VISIT_COOKIE, id, VISIT_MAX_AGE); return id
}
function deviceClass(): AnalyticsEvent['deviceClass'] {
  const width = Math.max(window.innerWidth || 0, window.screen?.width || 0)
  const touch = navigator.maxTouchPoints > 0
  if (width <= 767) return 'mobile'
  if (touch && width <= 1180) return 'tablet'
  return 'desktop'
}
function viewportBucket() {
  const w = Math.max(0, window.innerWidth || 0)
  if (w < 480) return '<480'
  if (w < 768) return '480-767'
  if (w < 1024) return '768-1023'
  if (w < 1440) return '1024-1439'
  return '1440+'
}
function referrerHost() {
  if (!document.referrer) return undefined
  try { return clean(new URL(document.referrer).hostname, 120) } catch { return undefined }
}
function campaign() {
  const params = new URLSearchParams(window.location.search)
  return {
    source: clean(params.get('utm_source')) ?? 'direct',
    utmMedium: clean(params.get('utm_medium')),
    utmCampaign: clean(params.get('utm_campaign'), 120),
    utmContent: clean(params.get('utm_content'), 120),
  }
}

export function track(eventName: AnalyticsEventName, houseCode?: string, details: AnalyticsDetails = {}): boolean {
  if (!analyticsAllowed() || !eventNames.includes(eventName)) return false
  try {
    const campaignData = campaign()
    const event: AnalyticsEvent = {
      id: uuid(), visitorId: visitorId(), visitId: visitId(), sessionId: sessionId(), createdAt: new Date().toISOString(), eventName,
      houseCode: /^[A-E]$/.test(houseCode ?? '') ? houseCode : 'unknown',
      pagePath: window.location.pathname.slice(0, 180), source: campaignData.source,
      utmMedium: campaignData.utmMedium, utmCampaign: campaignData.utmCampaign, utmContent: campaignData.utmContent,
      referrerHost: referrerHost(), deviceClass: deviceClass(), viewportBucket: viewportBucket(),
      sectionId: clean(details.sectionId, 80), tourMode: details.tourMode, sceneId: clean(details.sceneId, 100),
      durationMs: Number.isFinite(details.durationMs) ? Math.max(0, Math.min(Math.round(details.durationMs!), 21_600_000)) : undefined,
    }
    const cleaned = Object.fromEntries(Object.entries(event).filter(([, value]) => value !== undefined)) as AnalyticsEvent
    if (['localhost', '127.0.0.1', '[::1]', '::1'].includes(window.location.hostname)) {
      try {
        const parsed = JSON.parse(localStorage.getItem(ANALYTICS_EVENTS_KEY) ?? '[]')
        const list: AnalyticsEvent[] = Array.isArray(parsed) ? parsed : []
        localStorage.setItem(ANALYTICS_EVENTS_KEY, JSON.stringify([...list, cleaned].slice(-5000)))
      } catch { /* Optional diagnostics. */ }
      return true
    }
    const { id, ...rest } = cleaned
    const payload = JSON.stringify({ eventId: id, ...rest })
    if (navigator.sendBeacon?.('/api/analytics.php', new Blob([payload], { type: 'application/json' }))) return true
    void fetch('/api/analytics.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {})
    return true
  } catch { return false }
}

export function trackOnce(eventName: AnalyticsEventName, houseCode?: string, discriminator = '', details: AnalyticsDetails = {}): void {
  if (!analyticsAllowed()) return
  const key = `dnp-event:${eventName}:${window.location.pathname}:${houseCode ?? 'unknown'}:${discriminator}`
  if (memoryOnce.has(key)) return
  try { if (sessionStorage.getItem(key)) return } catch { /* optional */ }
  if (!track(eventName, houseCode, details)) return
  memoryOnce.add(key); try { sessionStorage.setItem(key, '1') } catch { /* optional */ }
}

export function trackPageView(houseCode?: string) {
  if (!analyticsAllowed()) return
  const newVisit = !readCookie(VISIT_COOKIE)
  visitorId(); visitId();
  if (newVisit) trackOnce('visit_start', houseCode, visitId())
  trackOnce('page_view', houseCode)
  installLifecycleListeners()
}

export function trackSection(sectionId: string, houseCode?: string) {
  if (!analyticsAllowed()) return
  const normalized = clean(sectionId, 80)
  if (!normalized || activeSection?.id === normalized) return
  flushSectionTime()
  activeSection = { id: normalized, startedAt: performance.now(), houseCode }
  track('section_view', houseCode, { sectionId: normalized })
}

export function flushSectionTime() {
  if (!analyticsAllowed() || !activeSection) { activeSection = null; return }
  const elapsed = performance.now() - activeSection.startedAt
  if (elapsed >= 500) track('section_time', activeSection.houseCode, { sectionId: activeSection.id, durationMs: elapsed })
  activeSection = null
}

function installLifecycleListeners() {
  if (listenersInstalled || typeof window === 'undefined') return
  listenersInstalled = true
  window.addEventListener('pagehide', flushSectionTime)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushSectionTime()
  })
}
