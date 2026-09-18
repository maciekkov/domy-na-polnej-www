/** Offline preview of the actual shared tour player, without npm dependencies. */
import http from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const base = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public')
const port = Number(process.env.PORT || 4180)
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT musi być liczbą od 1 do 65535')
const mime = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon' }
const server = http.createServer(async (req, res) => {
  if (!['GET','HEAD'].includes(req.method || '')) { res.writeHead(405,{Allow:'GET, HEAD'});res.end();return }
  try {
    const url = new URL(req.url || '/', 'http://localhost')
    let requested = decodeURIComponent(url.pathname)
    if (requested === '/' || requested === '/index.html') requested = '/tour/preview.html'
    const file = path.resolve(base, '.' + requested)
    if (!file.startsWith(base + path.sep) || !(await stat(file)).isFile()) { res.writeHead(404);res.end('Nie znaleziono pliku.');return }
    const content = await readFile(file)
    res.writeHead(200,{'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Content-Length':content.length,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'})
    res.end(req.method === 'HEAD' ? undefined : content)
  } catch (error) { res.writeHead(error.code === 'ENOENT' ? 404 : 400);res.end('Nie można odczytać pliku.') }
})
server.on('error', error => { console.error('Nie udało się uruchomić podglądu:',error.message);process.exitCode=1 })
server.listen(port,'127.0.0.1',() => console.log(`Podgląd spacerów: http://127.0.0.1:${port}\nWnętrze: http://127.0.0.1:${port}/tour/spacer-360-wewnatrz.html\nEDYCJA PINÓW: http://127.0.0.1:${port}/tour/spacer-360-wewnatrz.html?edit=1\nZatrzymanie: Ctrl+C`))
process.on('SIGINT', () => server.close())
