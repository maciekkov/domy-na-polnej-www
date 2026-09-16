export type HouseStatus = 'Dostępny' | 'Rezerwacja' | 'Sprzedany'

export type House = {
  id: 'A' | 'B' | 'C' | 'D' | 'E'
  name: string
  parcel: string
  status: HouseStatus
  price: number
  area: number
  plot: number
  rooms: number
  parking: number
  image: string
  pdf: string
  mapPolygon: string
  mapLabel: { x: number; y: number }
}

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export const houses: House[] = [
  {
    id: 'A', name: 'Dom A', parcel: '589/20', status: 'Dostępny', price: 779000,
    area: 111, plot: 810, rooms: 5, parking: 2,
    image: asset('assets/images/hero_front_nowe.webp'), pdf: asset('pdf/karta-dom-a.pdf'),
    mapPolygon: '54,258 367,225 425,641 114,673', mapLabel: { x: 14.2, y: 28.3 },
  },
  {
    id: 'B', name: 'Dom B', parcel: '589/19', status: 'Dostępny', price: 789000,
    area: 111, plot: 809, rooms: 5, parking: 2,
    image: asset('assets/images/hero_front_nowe.webp'), pdf: asset('pdf/karta-dom-b.pdf'),
    mapPolygon: '362,223 674,200 725,607 428,638', mapLabel: { x: 31.4, y: 26.8 },
  },
  {
    id: 'C', name: 'Dom C', parcel: '589/18', status: 'Rezerwacja', price: 799000,
    area: 111, plot: 807, rooms: 5, parking: 2,
    image: asset('assets/images/hero_front_nowe.webp'), pdf: asset('pdf/karta-dom-c.pdf'),
    mapPolygon: '669,205 956,175 1014,576 724,609', mapLabel: { x: 48.6, y: 25.2 },
  },
  {
    id: 'D', name: 'Dom D', parcel: '589/17', status: 'Dostępny', price: 809000,
    area: 111, plot: 806, rooms: 5, parking: 2,
    image: asset('assets/images/hero_front_nowe.webp'), pdf: asset('pdf/karta-dom-d.pdf'),
    mapPolygon: '958,178 1253,154 1295,551 1013,575', mapLabel: { x: 65.2, y: 24.1 },
  },
  {
    id: 'E', name: 'Dom E', parcel: '589/16', status: 'Dostępny', price: 819000,
    area: 111, plot: 1006, rooms: 5, parking: 2,
    image: asset('assets/images/hero_front_nowe.webp'), pdf: asset('pdf/karta-dom-e.pdf'),
    mapPolygon: '1252,154 1605,124 1526,528 1298,549', mapLabel: { x: 84.6, y: 22.6 },
  },
]

export type HouseId = House['id']

export const isHouseId = (value: string | null): value is HouseId =>
  houses.some((house) => house.id === value)

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('pl-PL').format(price).replace(/\u00a0/g, ' ') + ' zł'
