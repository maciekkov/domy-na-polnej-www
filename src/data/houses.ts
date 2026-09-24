export type HouseStatus = 'Dostępny' | 'Rezerwacja' | 'Sprzedany'

export type PublicPriceHistoryEntry = {
  price: number
  validFrom: string
  validTo: string
}

export type House = {
  id: 'A' | 'B' | 'C' | 'D' | 'E'
  name: string
  parcel: string
  status: HouseStatus
  price: number | null
  area: number
  plot: number
  rooms: number
  parking: number
  image: string
  pdf: string
  mapPolygon: string
  mapLabel: { x: number; y: number }
  priceHistory: PublicPriceHistoryEntry[]
  mandatoryPayments: Array<{ name: string; amount: number }>
}

import snapshot from '../../public/data/site-data.json'
import { parseSiteData } from './runtime/siteSchema.mjs'

export const houses: House[] = parseSiteData(snapshot).houses

export type HouseId = House['id']
export type HouseSelection = HouseId | 'unknown'

export const isHouseId = (value: string | null): value is HouseId =>
  houses.some((house) => house.id === value)

export const formatPrice = (price: number | null) =>
  price === null ? 'Już wkrótce' :
  new Intl.NumberFormat('pl-PL').format(price).replace(/\u00a0/g, ' ') + ' zł'

export const formatArea = (area: number) =>
  new Intl.NumberFormat('pl-PL', { minimumFractionDigits: Number.isInteger(area) ? 0 : 2, maximumFractionDigits: 2 }).format(area).replace(/\u00a0/g, ' ') + ' m²'

export const pricePerSqm = (house: Pick<House, 'price' | 'area'>) => house.price === null ? null : house.price / house.area
export const formatPricePerSqm = (house: Pick<House, 'price' | 'area'>) =>
  house.price === null ? 'Już wkrótce' :
  new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(house.price / house.area).replace(/\u00a0/g, ' ') + ' zł/m²'
