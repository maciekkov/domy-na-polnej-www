import type { House } from '../houses'
import type { JournalEntry } from '../journal'
import type { ScheduleStage } from '../schedule'

export type ContactData = {
  phoneDisplay: string
  phoneHref: string
  email: string
  emailHref: string
  addressLine1: string
  addressLine2: string
  mapHref: string
  instagramHref: string
  contactHours: string
}

export type SiteDocument = {
  id: string
  type: 'house_card' | 'standard_pdf' | 'prospectus' | 'privacy_policy' | 'cookies_policy' | 'price_information' | 'developer_information'
  houseId?: House['id']
  title: string
  publicUrl: string
  version: string
  active: boolean
  updatedAt: string
  sizeLabel: string
}

export type SiteData = {
  revision: number
  publishedAt: string
  houses: House[]
  contact: ContactData
  standardPdf: string
  schedule: ScheduleStage[]
  journal: JournalEntry[]
  documents: SiteDocument[]
}

