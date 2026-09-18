/** Deterministic cache busting for explicitly named public assets.
 * Run before Vite/TypeScript, not after hashing Vite chunks. Relative paths/IDs stay
 * unchanged; only a content-derived ?v is updated. Safe and idempotent.
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, relative, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { walk, root } from './asset-inventory.mjs'
export const portablePath = (file) => file.replaceAll('\\', '/')
const hash = (value) => createHash('sha256').update(value).digest('hex').slice(0, 16)
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
export function assetVersions(publicRoot) {
  const versions = {}
  for (const file of walk(publicRoot).sort()) {
    if (!/\.(?:webp|png|jpe?g|svg|gif|avif|mp4|pdf|woff2?)$/i.test(file) || portablePath(file).includes('/assets/build/')) continue
    versions['/' + relative(publicRoot, file).replaceAll('\\', '/')] = hash(readFileSync(file))
  }
  return versions
}
export function versionText(text, versions) {
  for (const [url, digest] of Object.entries(versions).sort((a,b) => b[0].length-a[0].length)) {
    // URLs may be prefixed by BASE_URL, a slash or the canonical origin.
    const name = url.slice(1)
    const expression = new RegExp(escape(name) + '(?:\\?v=[a-f0-9]{12,64})?(?=["\\\'`\\s)<>]|$)', 'g')
    text = text.replace(expression, `${name}?v=${digest}`)
  }
  return text
}
export function versionSiteData(data, versions) {
  // Serialization keeps all labels, coordinates and IDs exactly as supplied.
  return JSON.parse(versionText(JSON.stringify(data), versions))
}
export function syncAssetVersions(projectRoot = root) {
  const publicRoot = join(projectRoot, 'public')
  const versions = assetVersions(publicRoot)
  const scripts = walk(join(publicRoot, 'tour')).filter(file => /\.(?:js|css)$/.test(file)).sort()
  const release = hash(JSON.stringify(versions) + scripts.map(file => readFileSync(file, 'utf8').replace(/\?v=[a-f0-9]{12,64}/g, '')).join('\n'))
  const files = [join(projectRoot, 'index.html'), ...walk(join(projectRoot, 'src')), ...walk(join(publicRoot, 'tour')), ...walk(join(publicRoot, 'data')), ...walk(join(publicRoot, 'assets/data'))]
  let changed = 0
  for (const file of files) {
    if (!/\.(?:tsx?|js|css|json|html)$/.test(file) || portablePath(file).endsWith('/asset-versions.json')) continue
    let original = readFileSync(file, 'utf8'), text = versionText(original, versions)
    if (portablePath(file).includes('/public/tour/')) {
      for (const script of scripts) {
        const filename = portablePath(script).split('/').at(-1)
        text = text.replace(new RegExp('((?:/tour/|\\./)' + escape(filename) + ')(?:\\?v=[a-f0-9]{12,64})?(?=["\\\'])', 'g'), `$1?v=${release}`)
      }
    }
    if (text !== original) { writeFileSync(file, text); changed++ }
  }
  const target = join(publicRoot, 'assets/data/asset-versions.json')
  mkdirSync(join(publicRoot, 'assets/data'), { recursive: true })
  writeFileSync(target, JSON.stringify({ release, assets: versions }, null, 2) + '\n')
  return { changed, assets: Object.keys(versions).length, release }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log('Asset versions:', syncAssetVersions())
