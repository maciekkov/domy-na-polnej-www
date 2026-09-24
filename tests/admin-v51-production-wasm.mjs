import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const base = process.env.PHP_WASM_NODE_MODULES
if (!base) throw new Error('Set PHP_WASM_NODE_MODULES')
const { PHP } = await import(pathToFileURL(base + '/@php-wasm/universal/index.js'))
const { loadNodeRuntime } = await import(pathToFileURL(base + '/@php-wasm/node/index.js'))
const php = new PHP(await loadNodeRuntime('8.3', { emscriptenOptions: { processId: process.pid } }))
try {
  for (const path of ['/www','/www/administrator','/www/api','/www/api/lib','/private','/private/dnp','/private/dnp/data','/private/dnp/data/analytics']) php.mkdir(path)
  for (const path of ['administrator/auth.php','administrator/index.php','administrator/analytics.php','administrator/journey.php','api/analytics-summary.php','api/analytics-journey.php','api/lib/security.php']) php.writeFile('/www/' + path, readFileSync('hosting/public_html/' + path))
  const password = 'qa-only-password-random-123456789'
  const key = 'qa-only-key-12345678901234567890'
  php.writeFile('/private/dnp/config.php', `<?php return ['admin'=>['login'=>'analityka','password_sha256'=>'${createHash('sha256').update(password).digest('hex')}','control_key'=>'${key}'],'security'=>['allowed_origins'=>['https://domynapolnej.pl'],'storage_dir'=>'/private/dnp/data']];`)
  const uri = '/administrator/'
  async function request(path, method='GET', body, cookie, contentType='application/x-www-form-urlencoded') {
    return php.run({scriptPath:'/www/administrator/' + path, relativeUri:'/administrator/' + path, method, headers:{Host:'domynapolnej.pl','Content-Type':contentType,...(cookie ? {Cookie:cookie} : {})}, ...(body ? {body:new TextEncoder().encode(body)} : {}), $_SERVER:{REMOTE_ADDR:'192.0.2.25',HTTPS:'on',REQUEST_URI:uri}})
  }
  const login = await request('index.php')
  assert.equal(login.httpStatusCode,200)
  assert.match(login.text, /Zaloguj się/)
  assert.doesNotMatch(login.text, /admin-app\.js/)
  const csrf = login.text.match(/name="csrf" value="([a-f0-9]+)"/)?.[1]
  assert.ok(csrf)
  const setCookie = Object.entries(login.headers).find(([key]) => key.toLowerCase() === 'set-cookie')?.[1]
  const cookie = (Array.isArray(setCookie) ? setCookie[0] : setCookie ?? '').split(';')[0]
  assert.match(cookie,/dnp_panel_v51=/)
  const wrong = await request('index.php','POST',`csrf=${csrf}&login=analityka&password=wrong`,cookie)
  assert.match(wrong.text,/Nieprawidłowy login/)
  const denied = await request('analytics.php','POST','{"rangeDays":30}',cookie,'application/json')
  assert.equal(denied.httpStatusCode,401)
  const ok = await request('index.php','POST',`csrf=${csrf}&login=analityka&password=${password}`,cookie)
  assert.equal(ok.httpStatusCode,303)
  const renewed = Object.entries(ok.headers).find(([key]) => key.toLowerCase() === 'set-cookie')?.[1]
  const signedInCookie = (Array.isArray(renewed) ? renewed[0] : renewed ?? '').split(';')[0]
  assert.match(signedInCookie,/dnp_panel_v51=/)
  const authorized = await request('index.php','GET',undefined,signedInCookie)
  assert.match(authorized.text,/admin-app\.js/)
  const event = {createdAt:new Date().toISOString(),visitorId:'visitor-qa',visitId:'visit-qa',eventName:'section_time',sectionId:'hero',durationMs:8000,deviceClass:'mobile',pagePath:'/'}
  php.writeFile('/private/dnp/data/analytics/analytics-' + new Date().toISOString().slice(0,10) + '.ndjson', JSON.stringify(event)+'\n')
  const response = await request('analytics.php','POST','{"rangeDays":30}',signedInCookie,'application/json')
  assert.equal(response.httpStatusCode,200,response.text)
  const summary = JSON.parse(response.text)
  assert.equal(summary.ok,true)
  assert.equal(summary.uniqueVisitors,1)
  const deniedJourney = await request('journey.php','POST',JSON.stringify({visitor:summary.visitors[0].lookup,rangeDays:30}),cookie,'application/json')
  assert.equal(deniedJourney.httpStatusCode,401)
  const journey = await request('journey.php','POST',JSON.stringify({visitor:summary.visitors[0].lookup,rangeDays:30}),signedInCookie,'application/json')
  assert.equal(journey.httpStatusCode,200,journey.text)
  assert.equal(JSON.parse(journey.text).events[0].durationMs,8000)
  console.log('PASS: PHP login, produkcyjne statystyki i historia wizyt z kontrolą sesji.')
} finally { php.exit() }
