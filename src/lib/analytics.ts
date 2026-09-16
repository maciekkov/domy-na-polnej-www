export const ANALYTICS_CONSENT_KEY = 'dnp-analytics-consent-v1'
export const ANALYTICS_EVENTS_KEY = 'dnp-analytics-events-v2'
const ANALYTICS_SESSION_KEY = 'dnp-analytics-session-v1'
const PAGE_VIEW_PREFIX = 'dnp-analytics-page-view:'

export type AnalyticsEventName = 'page_view' | 'house_select' | 'house_card_open' | 'house_contact_click' | 'house_pdf_download' | 'gallery_open' | 'tour_start' | 'tour_engaged' | 'contact_start' | 'contact_submit' | 'phone_click' | 'email_click' | 'directions_click'

export type AnalyticsEvent = {
  id: string
  sessionId: string
  createdAt: string
  eventName: AnalyticsEventName
  houseCode?: string
  pagePath: string
  source: string
}

const isLocalPreview = () => ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)

export function analyticsAllowed() {
  return localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'accepted'
}

function getSessionId() {
  let id = sessionStorage.getItem(ANALYTICS_SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(ANALYTICS_SESSION_KEY, id)
  }
  return id
}

function makeEvent(eventName: AnalyticsEventName, houseCode?: string): AnalyticsEvent {
  const source = new URLSearchParams(window.location.search).get('utm_source') ?? 'direct'
  return {
    id: crypto.randomUUID(),
    sessionId: getSessionId(),
    createdAt: new Date().toISOString(),
    eventName,
    houseCode,
    pagePath: window.location.pathname,
    source,
  }
}

function storeLocal(event: AnalyticsEvent) {
  try {
    const current = JSON.parse(localStorage.getItem(ANALYTICS_EVENTS_KEY) ?? '[]') as AnalyticsEvent[]
    current.push(event)
    localStorage.setItem(ANALYTICS_EVENTS_KEY, JSON.stringify(current.slice(-5000)))
  } catch {
  }
}

function sendFirstParty(event: AnalyticsEvent) {
  const payload = JSON.stringify({
    sessionId: event.sessionId,
    eventName: event.eventName,
    houseCode: event.houseCode,
    pagePath: event.pagePath,
    source: event.source,
  })

  try {
    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon('/api/analytics.php', new Blob([payload], { type: 'application/json' }))
      if (sent) return
    }
    void fetch('/api/analytics.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    })
  } catch {
  }
}

export function track(eventName: AnalyticsEventName, houseCode?: string) {
  if (!analyticsAllowed()) return
  const event = makeEvent(eventName, houseCode)
  if (isLocalPreview()) storeLocal(event)
  else sendFirstParty(event)
}

export function trackPageView() {
  if (!analyticsAllowed()) return
  const marker = `${PAGE_VIEW_PREFIX}${window.location.pathname}${window.location.search}`
  if (sessionStorage.getItem(marker)) return
  sessionStorage.setItem(marker, '1')
  track('page_view')
}
