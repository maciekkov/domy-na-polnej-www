/** Shared presentation policy. A prelaunch is not a zero-priced offer. */
export const PRICE_PENDING = 'Już wkrótce'
export const isSelling = data => data.salesStage === 'selling'
export const hasPrice = house => typeof house.price === 'number' && Number.isFinite(house.price) && house.price > 0
export const publishedPrice = (data, house) => isSelling(data) && hasPrice(house)
export const publicStatus = (data, status) => !isSelling(data) && status === 'Dostępny' ? 'Przed sprzedażą' : status
/** Only explicit publication may turn an internal draft into a public snapshot. */
export function publicSnapshot(input) {
  const data = structuredClone(input)
  if (data.salesStage === 'prelaunch') {
    for (const house of data.houses ?? []) {
      house.price = null
      house.priceHistory = []
      house.mandatoryPayments = []
    }
  }
  return data
}

export function faqForStage(data,items) {
  return items.map(item => item.id !== 'price-scope' ? item : isSelling(data) ? {
    ...item,
    question:'Co dokładnie obejmuje cena całkowita?',
    answer:'Ceny brutto, ceny za metr kwadratowy oraz obowiązkowe dodatkowe świadczenia publikujemy przy poszczególnych domach. Zakres wykonania i szczegółowe warunki sprzedaży określają aktualny Standard techniczny oraz dokumenty umowy.'
  } : {...item,question:'Kiedy będzie dostępny cennik?'})
}
