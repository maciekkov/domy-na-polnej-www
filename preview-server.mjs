import { validateContact } from './src/lib/contactValidation.mjs'
import { createReadStream, existsSync, statSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, resolve, relative, isAbsolute } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { cacheControl } from './scripts/http-cache.mjs'

const port = Number(process.env.PORT || 4173)
const root = resolve(fileURLToPath(new URL('./dist/', import.meta.url)))
const types = {
  '.css':'text/css; charset=utf-8', '.html':'text/html; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml', '.webp':'image/webp', '.png':'image/png', '.jpg':'image/jpeg',
  '.pdf':'application/pdf', '.woff':'font/woff', '.woff2':'font/woff2', '.mp4':'video/mp4',
  '.xml':'application/xml; charset=utf-8', '.txt':'text/plain; charset=utf-8',
}
if (!existsSync(join(root, 'index.html'))) {
  console.error('Brak dist/index.html. Uruchom najpierw: npm run build'); process.exit(1)
}
function json(response, status, payload) {
  response.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' })
  response.end(JSON.stringify(payload))
}
const server = createServer((request, response) => {
  let url, pathname
  try { url = new URL(request.url ?? '/', 'http://localhost'); pathname = decodeURIComponent(url.pathname) }
  catch { json(response,400,{ ok:false }); return }
  if (/\\|\0/.test(pathname) || /(^|\/)\.(?!well-known\/)/.test(pathname)) { json(response,403,{ ok:false }); return }
  if (pathname === '/api/contact.php' && request.method === 'POST') {
    let body = '', rejected = false
    request.on('data', chunk => {
      body += chunk
      if (body.length > 32_768 && !rejected) { rejected = true; json(response,413,{ ok:false }) }
    })
    request.on('end', () => {
      if (rejected) return
      try {
        const data = JSON.parse(body || '{}')
        const errors = validateContact({
          name: typeof data.name === 'string' ? data.name : '',
          phone: typeof data.phone === 'string' ? data.phone : '',
          email: typeof data.email === 'string' ? data.email : '',
          message: typeof data.message === 'string' ? data.message : '',
          consentContact: data.consentContact === true,
          consentPrivacy: data.consentPrivacy === true,
        })
        if (Object.keys(errors).length) {
          json(response, 422, { ok: false, message: Object.values(errors)[0] }); return
        }
        // This process has no SMTP transport. The UI must disclose preview=true.
        json(response,200,{ ok:true, preview:true })
      } catch { json(response,400,{ ok:false, message:'Nieprawidłowe dane formularza.' }) }
    })
    return
  }
  if (pathname === '/api/analytics.php' && request.method === 'POST') {
    request.resume(); request.on('end', () => json(response,200,{ ok:true, preview:true })); return
  }
  // Never serve PHP source in a static preview.
  if (pathname.startsWith('/api/') || /\.php$/.test(pathname)) { json(response,404,{ ok:false }); return }
  if (!['GET','HEAD'].includes(request.method)) { json(response,405,{ ok:false }); return }
  let file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname))
  const rel = relative(root, file)
  if (rel.startsWith('..') || isAbsolute(rel)) { json(response,403,{ ok:false }); return }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file,'index.html')
  let code = 200
  if (!existsSync(file) || !statSync(file).isFile()) { file = join(root,'404.html'); code = 404 }
  if (!existsSync(file)) { json(response,404,{ ok:false }); return }
  const control = code === 404 ? 'no-store' : cacheControl(pathname)
  response.setHeader('Content-Type',types[extname(file)] ?? 'application/octet-stream')
  response.setHeader('Cache-Control',control)
  response.setHeader('X-Content-Type-Options','nosniff')
  const etag = '"' + createHash('sha256').update(readFileSync(file)).digest('hex') + '"'
  response.setHeader('ETag',etag)
  if (code === 200 && control !== 'no-store' && request.headers['if-none-match'] === etag) { response.writeHead(304); response.end(); return }
  response.statusCode = code
  if (request.method === 'HEAD') { response.end(); return }
  createReadStream(file).on('error', () => response.destroy()).pipe(response)
})
server.listen(port,'127.0.0.1', () => console.log(`Podgląd produkcji: http://127.0.0.1:${port} — formularz jest symulowany i oznaczony jako podgląd.`))
