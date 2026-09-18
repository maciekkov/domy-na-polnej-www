export type JournalPhoto = {
  src: string
  title: string
  alt: string
}

export type JournalEntry = {
  id: string
  date: string
  title: string
  description: string
  photoCount: number
  cover: string
  coverAlt: string
  photos: JournalPhoto[]
}

// Rzeczywiste wpisy będą publikowane z panelu po rozpoczęciu budowy.
import snapshot from '../../public/data/site-data.json'
import { parseSiteData } from './runtime/siteSchema.mjs'
export const journalEntries: JournalEntry[] = parseSiteData(snapshot).journal
