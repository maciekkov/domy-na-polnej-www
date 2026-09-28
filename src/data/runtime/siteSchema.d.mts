import type { SiteData } from './types'
export function parseSiteData(value: unknown, options?: { allowDraftPrices?: boolean }): SiteData
export function resolveSiteDocuments(data: SiteData): SiteData
