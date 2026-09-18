import type { AnalyticsEvent } from '../lib/analytics'

export type DemoJourneyStep = {
  sectionId: string
  label: string
  durationSec: number
  kind?: 'section' | 'tour'
  note?: string
}

export const demoJourneyRows = [
  { id: 'hero', label: 'Hero / start' },
  { id: 'homes', label: 'Domy i ceny' },
  { id: 'why-home', label: 'Dlaczego dom' },
  { id: 'location', label: 'Lokalizacja' },
  { id: 'layout', label: 'Układ domu' },
  { id: 'gallery', label: 'Galeria' },
  { id: 'tour-exterior', label: '↳ Spacer zewnętrzny' },
  { id: 'tour-interior', label: '↳ Spacer wnętrza' },
  { id: 'standard', label: 'Standard' },
  { id: 'security', label: 'Bezpieczny zakup' },
  { id: 'schedule', label: 'Harmonogram' },
  { id: 'journal', label: 'Dziennik budowy' },
  { id: 'team', label: 'Zespół' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Kontakt' },
] as const

export const demoVisitor = {
  id: 'visitor_demo_7f2c91a8',
  visitId: 'visit_demo_20260918_01',
  sessionId: 'session_demo_01',
  device: 'desktop' as const,
  viewport: '1440+',
  source: 'google',
  medium: 'organic',
  campaign: '—',
  houseCode: 'B',
}

export const demoJourney: DemoJourneyStep[] = [
  { sectionId: 'hero', label: 'Hero / start', durationSec: 25, note: 'Czyta główny komunikat' },
  { sectionId: 'homes', label: 'Domy i ceny', durationSec: 90, note: 'Porównuje działki i wybiera Dom B' },
  { sectionId: 'why-home', label: 'Dlaczego dom', durationSec: 50 },
  { sectionId: 'location', label: 'Lokalizacja', durationSec: 55 },
  { sectionId: 'homes', label: 'Domy i ceny', durationSec: 40, note: 'Wraca sprawdzić Dom B' },
  { sectionId: 'layout', label: 'Układ domu', durationSec: 100, note: 'Klika pomieszczenia na rzucie' },
  { sectionId: 'gallery', label: 'Galeria', durationSec: 70 },
  { sectionId: 'tour-exterior', label: 'Spacer zewnętrzny', durationSec: 180, kind: 'tour', note: '14 kadrów · ogród i elewacje' },
  { sectionId: 'gallery', label: 'Galeria', durationSec: 30, note: 'Wraca po spacerze' },
  { sectionId: 'layout', label: 'Układ domu', durationSec: 40, note: 'Porównuje układ ze spacerem' },
  { sectionId: 'standard', label: 'Standard', durationSec: 75 },
  { sectionId: 'security', label: 'Bezpieczny zakup', durationSec: 60 },
  { sectionId: 'schedule', label: 'Harmonogram', durationSec: 50 },
  { sectionId: 'journal', label: 'Dziennik budowy', durationSec: 35 },
  { sectionId: 'team', label: 'Zespół', durationSec: 30 },
  { sectionId: 'faq', label: 'FAQ', durationSec: 75 },
  { sectionId: 'gallery', label: 'Galeria', durationSec: 25, note: 'Cofa się do spaceru wnętrza' },
  { sectionId: 'tour-interior', label: 'Spacer wnętrza', durationSec: 240, kind: 'tour', note: '30 kadrów · salon, pokoje, łazienki' },
  { sectionId: 'contact', label: 'Kontakt', durationSec: 80, note: 'Wypełnia formularz dla Domu B' },
]

export const demoJourneyDurationSec = demoJourney.reduce((sum, step) => sum + step.durationSec, 0)

function baseEvent(createdAt: string, eventName: AnalyticsEvent['eventName']): AnalyticsEvent {
  return {
    id: `demo-${eventName}-${createdAt}`,
    visitorId: demoVisitor.id,
    visitId: demoVisitor.visitId,
    sessionId: demoVisitor.sessionId,
    createdAt,
    eventName,
    houseCode: demoVisitor.houseCode,
    pagePath: '/',
    source: demoVisitor.source,
    utmMedium: demoVisitor.medium,
    deviceClass: demoVisitor.device,
    viewportBucket: demoVisitor.viewport,
  }
}

export function createDemoAnalyticsEvents(nowMs = Date.now()): AnalyticsEvent[] {
  const events: AnalyticsEvent[] = []
  const startMs = nowMs - demoJourneyDurationSec * 1000 - 120_000
  const iso = (offsetSec: number) => new Date(startMs + offsetSec * 1000).toISOString()
  events.push(baseEvent(iso(0), 'visit_start'), baseEvent(iso(1), 'page_view'))
  let cursor = 0
  let exteriorStarted = false
  let interiorStarted = false

  demoJourney.forEach((step, index) => {
    if (step.kind === 'tour') {
      const mode = step.sectionId === 'tour-exterior' ? 'exterior' : 'interior'
      const start = baseEvent(iso(cursor), 'tour_start'); start.tourMode = mode
      const engaged = baseEvent(iso(cursor + 8), 'tour_engaged'); engaged.tourMode = mode
      const scene = baseEvent(iso(cursor + step.durationSec), 'tour_scene_time'); scene.tourMode = mode; scene.sceneId = mode === 'exterior' ? '09_taras_przy_salonie' : 'int18-salon-wysoki-sufit'; scene.durationMs = step.durationSec * 1000
      events.push(start, engaged, scene)
      if (mode === 'exterior') exteriorStarted = true
      else interiorStarted = true
    } else {
      const view = baseEvent(iso(cursor), 'section_view'); view.sectionId = step.sectionId
      const timed = baseEvent(iso(cursor + step.durationSec), 'section_time'); timed.sectionId = step.sectionId; timed.durationMs = step.durationSec * 1000
      events.push(view, timed)
    }
    if (index === 1) events.push(baseEvent(iso(cursor + 50), 'house_select'), baseEvent(iso(cursor + 62), 'house_card_open'))
    if (index === 5) events.push(baseEvent(iso(cursor + 78), 'house_pdf_download'))
    cursor += step.durationSec
  })

  if (!exteriorStarted || !interiorStarted) throw new Error('Niepełna symulacja spacerów')
  events.push(baseEvent(iso(cursor - 65), 'contact_start'), baseEvent(iso(cursor - 5), 'contact_submit'))
  return events
}
