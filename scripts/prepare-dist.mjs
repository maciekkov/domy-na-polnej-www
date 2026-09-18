import { refreshPublishedSeo } from './generate-seo.mjs'
import { parseSiteData, resolveSiteDocuments } from '../src/data/runtime/siteSchema.mjs'
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const dist = resolve(root, 'dist')
const api = resolve(root, 'api')

if (!existsSync(resolve(dist, 'index.html'))) {
  throw new Error('Brak dist/index.html. Najpierw uruchom build Vite.')
}

mkdirSync(resolve(dist, 'assets/build'), { recursive: true })
cpSync(resolve(root, 'scripts/build-cache.htaccess'), resolve(dist, 'assets/build/.htaccess'))

mkdirSync(resolve(dist, 'api'), { recursive: true })
for (const file of ['contact.php', 'analytics.php', 'analytics-summary.php', 'gov-sync.php', 'gov-sync-cron.php', 'event-names.json', 'config.example.php', '.htaccess']) {
  cpSync(resolve(api, file), resolve(dist, 'api', file))
}
cpSync(resolve(api,'lib'), resolve(dist,'api/lib'), { recursive: true })
mkdirSync(resolve(dist, 'api', 'data'), { recursive: true })
cpSync(resolve(api, 'data', '.gitkeep'), resolve(dist, 'api', 'data', '.gitkeep'))

const sourceHtml = readFileSync(resolve(dist, 'index.html'), 'utf8').replace(/<div id="root">[\s\S]*?<!--dnp-home-end--><\/div>/, '<div id="root"></div>')
const legalPages = [
  {
    path: 'polityka-prywatnosci',
    title: 'Polityka prywatności — Domy na Polnej',
    description: 'Polityka prywatności serwisu Domy na Polnej i informacje o przetwarzaniu danych osobowych.',
  },
  {
    path: 'polityka-cookies',
    title: 'Polityka cookies — Domy na Polnej',
    description: 'Informacje o plikach cookies, pamięci przeglądarki i analityce w serwisie Domy na Polnej.',
  },
]

for (const page of legalPages) {
  const dir = resolve(dist, page.path)
  mkdirSync(dir, { recursive: true })
  const canonical = `https://domynapolnej.pl/${page.path}/`
  const html = sourceHtml
    .replace(/<title>.*?<\/title>/s, `<title>${page.title}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${page.description}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${page.title}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${page.description}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${page.title}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${page.description}" />`)
  writeFileSync(resolve(dir, 'index.html'), html)
}

const notFound = sourceHtml
  .replace(/<title>.*?<\/title>/s, '<title>404 — Domy na Polnej</title>')
  .replace(/<meta name="robots" content="[^"]*" \/>/, '<meta name="robots" content="noindex, nofollow" />')
  .replace(/<link rel="canonical" href="[^"]*" \/>/, '')
  .replace(/<meta property="og:url" content="[^"]*" \/>/, '')
writeFileSync(resolve(dist, '404.html'), notFound)

console.log('dist przygotowany: frontend + API + strony prawne + 404')

refreshPublishedSeo(dist, resolveSiteDocuments(parseSiteData(JSON.parse(readFileSync(resolve(dist,'data/site-data.json'),'utf8')))))
