export const ANALYTICS_CONSENT_KEY = 'dnp-analytics-consent-v1'
export const ANALYTICS_EVENTS_KEY = 'dnp-analytics-events-v1'

export type AnalyticsEventName = 'page_view' | 'house_select' | 'house_card_open' | 'house_contact_click' | 'house_pdf_download' | 'gallery_open' | 'tour_start' | 'tour_engaged' | 'contact_start' | 'contact_submit' | 'phone_click' | 'email_click' | 'directions_click'

export type AnalyticsEvent = {
  id: string
  createdAt: string
  eventName: AnalyticsEventName
  houseCode?: string
  pagePath: string
  source: string
}

export function analyticsAllowed() {
  return localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'accepted'
}

export function track(eventName: AnalyticsEventName, houseCode?: string) {
  if (!analyticsAllowed()) return
  try {
    const current = JSON.parse(localStorage.getItem(ANALYTICS_EVENTS_KEY) ?? '[]') as AnalyticsEvent[]
    const source = new URLSearchParams(window.location.search).get('utm_source') ?? 'direct'
    current.push({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), eventName, houseCode, pagePath: window.location.pathname, source })
    localStorage.setItem(ANALYTICS_EVENTS_KEY, JSON.stringify(current.slice(-5000)))
  } catch {
    // Analytics must never interrupt the sales path.
  }
}
