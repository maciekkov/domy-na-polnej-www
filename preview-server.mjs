import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const port = Number(process.env.PORT || 4173)
const root = resolve(fileURLToPath(new URL('./dist/', import.meta.url)))
const types = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.pdf': 'application/pdf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
}

if (!existsSync(join(root, 'index.html'))) {
  console.error('Brak dist/index.html. Uruchom najpierw: npm run build')
  process.exit(1)
}

function json(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  response.end(JSON.stringify(payload))
}

createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host}`)

  if (url.pathname === '/api/contact.php' && request.method === 'POST') {
    let body = ''
    request.on('data', (chunk) => { body += chunk })
    request.on('end', () => {
      try {
        const data = JSON.parse(body || '{}')
        const emailOk = !data.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))
        if (!data.name || !data.phone || !data.consentContact || !data.consentPrivacy || !emailOk) {
          json(response, 422, { ok: false, message: 'Uzupełnij wymagane pola i podaj poprawny e-mail.' })
          return
        }
        json(response, 200, { ok: true, preview: true })
      } catch {
        json(response, 400, { ok: false, message: 'Nieprawidłowe dane formularza.' })
      }
    })
    return
  }

  if (url.pathname === '/api/analytics.php' && request.method === 'POST') {
    request.resume()
    request.on('end', () => json(response, 200, { ok: true, preview: true }))
    return
  }

  const pathname = decodeURIComponent(url.pathname)
  const relative = normalize(pathname).replace(/^([/\\])+/, '')
  let file = join(root, relative || 'index.html')

  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')

  if (!file.startsWith(root) || !existsSync(file)) {
    const localSpaRoutes = new Set(['/administrator', '/administracja'])
    if (localSpaRoutes.has(pathname.replace(/\/+$/, ''))) {
      file = join(root, 'index.html')
    } else {
      file = join(root, '404.html')
      response.statusCode = 404
    }
  }

  response.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream')
  if (!response.statusCode || response.statusCode === 200) response.statusCode = 200
  createReadStream(file).pipe(response)
}).listen(port, '127.0.0.1', () => {
  console.log(`Podgląd Domy na Polnej: http://127.0.0.1:${port}`)
})
