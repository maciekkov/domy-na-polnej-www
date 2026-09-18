/** Public content contract shared by the browser, export tool and publishing CLI.
 * Rejects unknown properties (including CRM records and secrets); never executes input.
 */
const HOUSE_IDS = ['A', 'B', 'C', 'D', 'E']
const STAGE_IDS = ['I', 'II', 'III', 'IV', 'V']
const fail = (path, message) => { throw new Error(`${path}: ${message}`) }
function object(value, keys, path) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(path, 'wymagany obiekt')
  for (const key of Object.keys(value)) if (!keys.includes(key)) fail(`${path}.${key}`, 'niedozwolone pole w danych publicznych')
}
function text(value, path, max = 500, allowEmpty = false) {
  if (typeof value !== 'string' || (!allowEmpty && !value.trim()) || value.length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value)) fail(path, 'nieprawidłowy tekst')
}
function number(value, path, min = 0, max = Number.MAX_SAFE_INTEGER, integer = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isSafeInteger(value))) fail(path, 'nieprawidłowa liczba')
}
function choice(value, values, path) { if (!values.includes(value)) fail(path, 'wartość spoza listy') }
function list(value, path, max = 200) { if (!Array.isArray(value) || value.length > max) fail(path, 'nieprawidłowa lista') }
function unique(items, field, path) {
  if (new Set(items.map(item => item[field])).size !== items.length) fail(path, `powtórzone ${field}`)
}
function publicUrl(value, path, allowEmpty = false) {
  text(value, path, 2048, allowEmpty)
  if (allowEmpty && value === '') return
  // Public documents can link to local legal pages. Never allow protocol-relative URLs,
  // encoded traversal, scripts, data/blob URLs or arbitrary private server files.
  let decoded
  try { decoded = decodeURIComponent(value) } catch { fail(path, 'nieprawidłowe kodowanie URL') }
  if (!value.startsWith('/') || value.startsWith('//') || /[\\\s<>"']/.test(decoded) || decoded.includes('..') || decoded.includes('://')) fail(path, 'wymagany bezpieczny lokalny URL')
  if (!/^\/(?:assets\/|pdf\/|documents\/|polityka-prywatnosci\/?$|polityka-cookies\/?$)/.test(value)) fail(path, 'URL spoza zasobów publicznych')
}
function httpsUrl(value, path, allowEmpty = false) {
  text(value, path, 2048, allowEmpty)
  if (allowEmpty && value === '') return
  let parsed
  try { parsed = new URL(value) } catch { fail(path, 'nieprawidłowy URL') }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) fail(path, 'wymagany HTTPS bez danych logowania')
}
export function parseSiteData(value) {
  object(value, ['revision','publishedAt','houses','contact','standardPdf','schedule','journal','documents'], 'site')
  number(value.revision, 'revision', 1, 1_000_000_000, true)
  text(value.publishedAt, 'publishedAt', 100)
  list(value.houses, 'houses', 5)
  if (value.houses.length !== 5) fail('houses', 'wymagane dokładnie pięć domów A–E')
  unique(value.houses, 'id', 'houses')
  for (const h of value.houses) {
    const path = `houses.${h?.id ?? '?'}`
    object(h, ['id','name','parcel','status','price','area','plot','rooms','parking','image','pdf','mapPolygon','mapLabel','priceHistory','mandatoryPayments'], path)
    choice(h.id, HOUSE_IDS, `${path}.id`)
    choice(h.status, ['Dostępny','Rezerwacja','Sprzedany'], `${path}.status`)
    for (const field of ['name','parcel','mapPolygon']) text(h[field], `${path}.${field}`, field === 'mapPolygon' ? 4000 : 100)
    number(h.price, `${path}.price`, 1, 100_000_000, true)
    number(h.area, `${path}.area`, 1, 10_000)
    number(h.plot, `${path}.plot`, 1, 1_000_000)
    number(h.rooms, `${path}.rooms`, 1, 100, true)
    number(h.parking, `${path}.parking`, 0, 100, true)
    publicUrl(h.image, `${path}.image`)
    publicUrl(h.pdf, `${path}.pdf`, true)
    object(h.mapLabel, ['x','y'], `${path}.mapLabel`)
    number(h.mapLabel.x, `${path}.mapLabel.x`, 0, 100)
    number(h.mapLabel.y, `${path}.mapLabel.y`, 0, 100)
    list(h.priceHistory, `${path}.priceHistory`, 200)
    for (const [historyIndex, entry] of h.priceHistory.entries()) {
      const historyPath = `${path}.priceHistory.${historyIndex}`
      object(entry, ['price','validFrom','validTo'], historyPath)
      number(entry.price, `${historyPath}.price`, 1, 100_000_000, true)
      text(entry.validFrom, `${historyPath}.validFrom`, 40)
      text(entry.validTo, `${historyPath}.validTo`, 40)
      if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(entry.validFrom) || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(entry.validTo)) fail(historyPath, 'daty historii ceny muszą być w formacie ISO')
    }
    list(h.mandatoryPayments, `${path}.mandatoryPayments`, 50)
    for (const [paymentIndex, payment] of h.mandatoryPayments.entries()) {
      const paymentPath = `${path}.mandatoryPayments.${paymentIndex}`
      object(payment, ['name','amount'], paymentPath)
      text(payment.name, `${paymentPath}.name`, 200)
      number(payment.amount, `${paymentPath}.amount`, 0, 100_000_000)
    }
  }
  const c = value.contact
  const contactKeys = ['phoneDisplay','phoneHref','email','emailHref','addressLine1','addressLine2','mapHref','instagramHref','contactHours']
  object(c, contactKeys, 'contact')
  for (const key of contactKeys) text(c[key], `contact.${key}`, 2048)
  if (!/^tel:\+?[0-9 ()-]{7,30}$/.test(c.phoneHref)) fail('contact.phoneHref', 'nieprawidłowy telefon')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email) || c.emailHref !== `mailto:${c.email}`) fail('contact.emailHref', 'e-mail i mailto muszą być zgodne')
  httpsUrl(c.mapHref, 'contact.mapHref')
  httpsUrl(c.instagramHref, 'contact.instagramHref')
  publicUrl(value.standardPdf, 'standardPdf', true)
  list(value.schedule, 'schedule', 5)
  if (value.schedule.length !== 5) fail('schedule', 'wymagane pięć etapów')
  unique(value.schedule, 'id', 'schedule')
  for (const [index,s] of value.schedule.entries()) {
    const path = `schedule.${index}`
    object(s, ['id','title','description','status','term','state'], path)
    choice(s.id, STAGE_IDS, `${path}.id`)
    if (s.id !== STAGE_IDS[index]) fail(path, 'kolejność etapów musi pozostać I–V')
    choice(s.state, ['completed','current','planned'], `${path}.state`)
    for (const key of ['title','description','status','term']) text(s[key], `${path}.${key}`, 2000)
  }
  list(value.journal, 'journal')
  unique(value.journal, 'id', 'journal')
  for (const [index,j] of value.journal.entries()) {
    const path = `journal.${index}`
    object(j, ['id','date','title','description','photoCount','cover','coverAlt','photos'], path)
    for (const key of ['id','date','title','description','coverAlt']) text(j[key], `${path}.${key}`, key === 'description' ? 10000 : 500)
    publicUrl(j.cover, `${path}.cover`)
    list(j.photos, `${path}.photos`, 50)
    number(j.photoCount, `${path}.photoCount`, 0, 50, true)
    if (j.photoCount !== j.photos.length) fail(`${path}.photoCount`, 'liczba zdjęć nie odpowiada liście')
    for (const photo of j.photos) {
      object(photo, ['src','title','alt'], `${path}.photos`)
      publicUrl(photo.src, `${path}.photos.src`)
      text(photo.title, `${path}.photos.title`, 500)
      text(photo.alt, `${path}.photos.alt`, 500)
    }
  }
  list(value.documents, 'documents', 100)
  unique(value.documents, 'id', 'documents')
  const activeSlots = new Set()
  for (const [index,d] of value.documents.entries()) {
    const path = `documents.${index}`
    object(d, ['id','type','houseId','title','publicUrl','version','active','updatedAt','sizeLabel'], path)
    choice(d.type, ['house_card','standard_pdf','prospectus','privacy_policy','cookies_policy','price_information','developer_information'], `${path}.type`)
    for (const key of ['id','title','version','updatedAt','sizeLabel']) text(d[key], `${path}.${key}`, 500)
    if (typeof d.active !== 'boolean') fail(`${path}.active`, 'wymagana wartość true/false')
    if (d.houseId !== undefined) choice(d.houseId, HOUSE_IDS, `${path}.houseId`)
    if (d.type === 'house_card' && !d.houseId) fail(path, 'karta domu wymaga houseId')
    publicUrl(d.publicUrl, `${path}.publicUrl`, !d.active)
    if (d.active && ['house_card','standard_pdf'].includes(d.type)) {
      const slot = `${d.type}:${d.houseId ?? ''}`
      if (activeSlots.has(slot)) fail(path, 'dwie aktywne wersje tego samego dokumentu')
      activeSlots.add(slot)
    }
  }
  return value
}

/** Document status and version control the visible house/standard links. */
export function resolveSiteDocuments(data) {
  const active = data.documents.filter(document => document.active)
  return {
    ...data,
    houses: data.houses.map(house => ({
      ...house,
      pdf: active.find(document => document.type === 'house_card' && document.houseId === house.id)?.publicUrl ?? '',
    })),
    standardPdf: active.find(document => document.type === 'standard_pdf')?.publicUrl ?? '',
  }
}
