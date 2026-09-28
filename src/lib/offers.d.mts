import type { House } from '../data/houses'
import type { SiteData } from '../data/runtime/types'
export const SITE_ORIGIN: string
export const HOUSE_CODES: string[]
export function housePath(id: string): string
export function money(n: number): string
export function availablePrice(houses: House[]): number | null
export function offerLead(houses: House[], salesStage?: SiteData['salesStage']): string
export function escapeHtml(value: unknown): string
export function safeJson(value: unknown): string
export function pageMeta(data: SiteData, id?: string | null): {title: string; description: string; canonical: string; image: string}
export function structuredData(data: SiteData, id?: string | null): object
export function applyMeta(document: Document, data: SiteData, id?: string | null): void
