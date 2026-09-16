import { contact } from '../contact'
import { houses } from '../houses'
import { journalEntries } from '../journal'
import { scheduleStages } from '../schedule'
import { standardPdf } from '../standard'
import type { SiteData, SiteDocument } from './types'

const documents: SiteDocument[] = [
  ...houses.map((house) => ({ id: `house-${house.id.toLowerCase()}`, type: 'house_card' as const, houseId: house.id, title: `Karta domu ${house.id}`, publicUrl: house.pdf, version: '1.0', active: true, updatedAt: '13.09.2026', sizeLabel: 'PDF' })),
  { id: 'standard', type: 'standard_pdf', title: 'Standard techniczny', publicUrl: standardPdf, version: '1.0', active: true, updatedAt: '03.08.2026', sizeLabel: '6,0 MB' },
  { id: 'prospectus', type: 'prospectus', title: 'Prospekt informacyjny', publicUrl: '', version: '—', active: false, updatedAt: '—', sizeLabel: 'Brak pliku' },
  { id: 'privacy', type: 'privacy_policy', title: 'Polityka prywatności', publicUrl: '/polityka-prywatnosci/', version: '1.0', active: true, updatedAt: '16.09.2026', sizeLabel: 'WWW' },
  { id: 'cookies', type: 'cookies_policy', title: 'Polityka cookies', publicUrl: '/polityka-cookies/', version: '1.0', active: true, updatedAt: '16.09.2026', sizeLabel: 'WWW' },
]

export const fallbackSiteData: SiteData = { revision: 1, publishedAt: '13.09.2026, 22:00', houses, contact: { ...contact, contactHours: 'Biuro sprzedaży · Pon. – Pt. 9:00 – 17:00' }, standardPdf, schedule: scheduleStages, journal: journalEntries, documents }
