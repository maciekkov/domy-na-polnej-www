import { preparePublishedSeo, prepareSourcePages, commitFileUpdates } from './generate-seo.mjs'
import { resolveSiteDocuments } from '../src/data/runtime/siteSchema.mjs'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, join, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { parseSiteData } from '../src/data/runtime/siteSchema.mjs'
import { assetVersions, versionSiteData } from './version-assets.mjs'
import { withoutVersion } from './asset-inventory.mjs'

function publicationDate(value) {
  const text = String(value ?? '').trim()
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ,]|$)/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  const pl = text.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})(?:[ ,]|$)/)
  if (pl) return `${pl[3]}-${pl[2].padStart(2,'0')}-${pl[1].padStart(2,'0')}`
  throw new Error('publishedAt musi zawierać rozpoznawalną datę publikacji')
}

export function mergePublicPriceHistory(input, previous) {
  if (!previous) return input
  const next = structuredClone(input)
  for (const house of next.houses ?? []) {
    const old = previous.houses?.find(item => item.id === house.id)
    if (!old || old.price === house.price) continue
    if (!Array.isArray(house.priceHistory)) house.priceHistory = []
    const validFrom = publicationDate(old.publishedAt ?? previous.publishedAt)
    const validTo = publicationDate(next.publishedAt)
    if (validTo < validFrom) throw new Error(`Data publikacji nowej ceny Domu ${house.id} nie może poprzedzać poprzedniej ceny`)
    const entry = { price: old.price, validFrom, validTo }
    const duplicate = house.priceHistory.some(item => item.price === entry.price && item.validFrom === entry.validFrom && item.validTo === entry.validTo)
    if (!duplicate) house.priceHistory = [entry, ...house.priceHistory]
  }
  return next
}

export function validateFiles(data, publicRoot) {
  const urls = [...data.houses.flatMap(house => [house.image,house.pdf]), data.standardPdf,
    ...data.documents.filter(document => document.active).map(document => document.publicUrl),
    ...data.journal.flatMap(entry => [entry.cover, ...entry.photos.map(photo => photo.src)])]
  for (const url of urls.filter(Boolean)) {
    if (/^\/polityka-(?:prywatnosci|cookies)\/?$/.test(url)) continue
    const file = resolve(publicRoot, '.' + withoutVersion(url))
    if (relative(resolve(publicRoot), file).startsWith('..') || isAbsolute(relative(resolve(publicRoot), file)) || !existsSync(file)) throw new Error(`Nie ma pliku publicznego: ${url}`)
  }
}
export function preparePublication(input, publicRoot) {
  const data = parseSiteData(input)
  validateFiles(data, publicRoot)
  return versionSiteData(data, assetVersions(publicRoot))
}
export function publishFile(inputPath, { projectRoot, target = 'public', checkOnly = false, allowRollback = false } = {}) {
  projectRoot ??= resolve(import.meta.dirname, '..')
  if (!['public','dist'].includes(target)) throw new Error('--target musi wskazywać public lub dist')
  const publicRoot = join(projectRoot, target)
  if (target === 'dist' && !existsSync(join(publicRoot, 'index.html'))) throw new Error('Brak gotowego builda. Najpierw npm run build.')
  const output = join(publicRoot, 'data/site-data.json')
  const previous = existsSync(output) ? readFileSync(output) : null
  const previousData = previous ? JSON.parse(previous.toString()) : null
  const input = mergePublicPriceHistory(JSON.parse(readFileSync(inputPath, 'utf8')), previousData)
  const data = preparePublication(input, publicRoot)
  if (previous && !allowRollback && data.revision <= previousData.revision) {
    throw new Error('Nowa rewizja musi być wyższa. Świadomy rollback: --allow-rollback.')
  }
  const resolvedData = resolveSiteDocuments(data)
  const htmlUpdates = target === 'dist' ? preparePublishedSeo(publicRoot, resolvedData) : prepareSourcePages(projectRoot, resolvedData)
  if (checkOnly) return { valid: true, revision: data.revision, output, written: false }
  if (previous) {
    const backups = join(projectRoot, 'backups/site-data'); mkdirSync(backups, { recursive: true })
    writeFileSync(join(backups, `${Date.now()}-${randomUUID()}.json`), previous)
  }
  commitFileUpdates([...htmlUpdates, { path: output, content: JSON.stringify(data, null, 2) + '\n' }])
  return { valid: true, revision: data.revision, output: relative(projectRoot, output), written: true }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    if (!args[0]) throw new Error('Użycie: npm run content:publish -- plik.json [--target public|dist] [--check] [--allow-rollback]')
    const at = args.indexOf('--target')
    if (at >= 0 && !['public','dist'].includes(args[at+1])) throw new Error('--target wymaga wartości public lub dist')
    for (let i = 1; i < args.length; i++) {
      if (args[i] === '--target') { i++; continue }
      if (!['--check','--allow-rollback'].includes(args[i])) throw new Error(`Nieznany argument: ${args[i]}`)
    }
    console.log(publishFile(args[0], { target: at < 0 ? 'public' : args[at+1], checkOnly: args.includes('--check'), allowRollback: args.includes('--allow-rollback') }))
  } catch (error) { console.error(`Publikacja przerwana: ${error.message}`); process.exitCode = 1 }
}
