import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const port = 4173
const root = new URL('./dist/', import.meta.url).pathname
const types = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.pdf': 'application/pdf', '.woff': 'font/woff', '.woff2': 'font/woff2',
}

createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host}`)
  if (url.pathname === '/api/contact.php' && request.method === 'POST') {
    let body = ''
    request.on('data', (chunk) => { body += chunk })
    request.on('end', () => {
      try {
        const data = JSON.parse(body || '{}')
        if (!data.name || !data.phone || !data.consentContact || !data.consentPrivacy) {
          response.writeHead(422, { 'Content-Type': 'application/json; charset=utf-8' })
          response.end(JSON.stringify({ ok: false, message: 'Uzupełnij wymagane pola i zgody.' }))
          return
        }
        response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
        response.end(JSON.stringify({ ok: true, preview: true }))
      } catch {
        response.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' })
        response.end(JSON.stringify({ ok: false, message: 'Nieprawidłowe dane formularza.' }))
      }
    })
    return
  }

  const pathname = decodeURIComponent(url.pathname)
  const relative = normalize(pathname).replace(/^([/\\])+/, '')
  let file = join(root, relative || 'index.html')
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) file = join(root, 'index.html')
  response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(response)
}).listen(port, '127.0.0.1', () => {
  console.log(`Podgląd Domy na Polnej: http://127.0.0.1:${port}`)
})
