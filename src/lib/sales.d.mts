import type { House } from '../data/houses'
import type { SiteData } from '../data/runtime/types'
export const PRICE_PENDING: string
export function isSelling(data: Pick<SiteData, 'salesStage'>): boolean
export function hasPrice(house: Pick<House, 'price'>): boolean
export function publishedPrice(data: Pick<SiteData, 'salesStage'>, house: Pick<House, 'price'>): boolean
export function publicStatus(data: Pick<SiteData, 'salesStage'>, status: House['status']): string
export function publicSnapshot(input: SiteData): SiteData
export function faqForStage(data: Pick<SiteData,'salesStage'>, items: Array<{id:string;question:string;answer:string}>): Array<{id:string;question:string;answer:string}>
