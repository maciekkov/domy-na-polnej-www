import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, relative, join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = resolve(import.meta.dirname, '..')
export function walk(directory) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(join(directory, item.name)) : [join(directory, item.name)])
}
export const withoutVersion = (url) => url.replace(/\?v=[a-f0-9]{12,64}(?=[&#]|$)/g, '').split(/[?#]/)[0]
export function references(projectRoot = root) {
  const files = [join(projectRoot, 'index.html'), ...walk(join(projectRoot, 'src')), ...walk(join(projectRoot, 'public/tour')), ...walk(join(projectRoot, 'public/data')), ...walk(join(projectRoot, 'public/assets/data'))]
  const paths = new Map()
  const add = (url, file) => {
    const normalized = '/' + withoutVersion(url).replace(/^\//, '')
    if (!paths.has(normalized)) paths.set(normalized, [])
    paths.get(normalized).push(relative(projectRoot, file))
  }
  for (const file of files) {
    if (!/\.(?:tsx?|mjs|js|css|json|html)$/.test(file)) continue
    if (file.replaceAll('\\', '/').endsWith('/asset-versions.json')) continue
    const text = readFileSync(file, 'utf8')
    const pattern = /(?:assets\/|documents\/|pdf\/)[A-Za-z0-9_\-./]+\.(?:webp|png|jpe?g|svg|gif|avif|mp4|pdf|json|woff2?)(?:\?v=[a-f0-9]+)?/g
    for (const match of text.matchAll(pattern)) add(match[0], file)
  }
  // These URLs are intentionally computed from the finite StandardIconId union.
  for (const id of ['heat-pump','ventilation','floor-heating','blinds','windows','glazing','pv','fence']) {
    add(`assets/images/standard/icons/${id}.webp`, join(projectRoot, 'src/sections/Standard/Standard.tsx'))
  }
  for (const name of ['site-data.json']) add(`data/${name}`, join(projectRoot, 'src/data/runtime/SiteDataProvider.tsx'))
  return paths
}
export function inventory(projectRoot = root) {
  const refs = references(projectRoot)
  const publicRoot = join(projectRoot, 'public')
  const assets = walk(join(publicRoot, 'assets')).filter(file => !file.replaceAll('\\', '/').endsWith('/asset-versions.json'))
  const missing = [...refs.entries()].filter(([url]) => !existsSync(join(publicRoot, url.slice(1)))).map(([url, files]) => ({ url, files }))
  const unused = assets.filter(file => !refs.has('/' + relative(publicRoot, file).replaceAll('\\', '/')))
  return { references: refs.size, missing, unused: unused.map(file => ({ file: relative(projectRoot, file).replaceAll('\\', '/'), bytes: statSync(file).size })), publicBytes: walk(publicRoot).reduce((sum, file) => sum + statSync(file).size, 0) }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(inventory(), null, 2))
  if (inventory().missing.length) process.exitCode = 1
}
