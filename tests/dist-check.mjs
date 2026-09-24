import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { walk, root } from '../scripts/asset-inventory.mjs'
const dir=join(root,'dist'),read=p=>readFileSync(join(dir,p),'utf8')
assert.ok(existsSync(join(dir,'index.html')),'Najpierw npm run build')
const files=walk(dir), compiled=files.filter(f=>/\.(js|css)$/.test(f) && !f.includes('/administrator/')).map(f=>readFileSync(f,'utf8')).join('\n')
for (const token of ['dnp-admin-demo-state-v1','anna@example.test','piotr@example.test','admin-login__card','admin-topbar__actions']) assert.ok(!compiled.includes(token),`Demo wyciekło do builda: ${token}`)
for (const file of ['administrator/index.php','administrator/auth.php','administrator/analytics.php','administrator/journey.php','administrator/.htaccess','administrator/assets/admin-app.js','administrator/assets/admin-app.css']) assert.ok(existsSync(join(dir,file)),`Brak dist/${file}`)
assert.ok(read('administrator/index.php').includes('dnp_panel_authenticated()'),'Panel produkcyjny wymaga logowania po stronie PHP')
assert.ok(read('administrator/assets/admin-app.js').includes('Panel serwera'),'Panel v5.1 nie został zbudowany')
for (const sample of ['Anna Nowak','Piotr Zieliński','Katarzyna W.','anna@example.test','visitor_demo_7f2c91a8']) assert.ok(!read('administrator/assets/admin-app.js').includes(sample),`Przykładowe dane wyciekły do panelu: ${sample}`)
for (const file of ['data/site-data.json','404.html','polityka-prywatnosci/index.html','polityka-cookies/index.html','api/contact.php','api/analytics.php','assets/build/.htaccess']) assert.ok(existsSync(join(dir,file)),`Brak dist/${file}`)
assert.ok(!existsSync(join(dir,'api/config.php')),'Nie wolno pakować sekretów SMTP')
assert.ok(read('assets/build/.htaccess').includes('immutable'))
assert.ok(read('.htaccess').includes('no-store'))
const allData=['data/site-data.json','assets/data/spacer-360-wewnetrzny.json','assets/data/spacer-360-zewnetrzny.json'].map(read).join('\n')
for (const match of allData.matchAll(/"(\/(?:assets|pdf|documents)\/[^"?]+)(?:\?v=[a-f0-9]+)?"/g)) assert.ok(existsSync(join(dir,match[1])),`Brak opublikowanego zasobu ${match[1]}`)
for (const id of ['a','b','c','d','e']) assert.ok(!existsSync(join(dir,`dom-${id}`)),`Nie powinno być osobnej strony dom-${id}`)
for(const path of ['api/lib/security.php','api/event-names.json'])assert.ok(existsSync(join(dir,path)),path)
assert.ok(!files.some(file=>/rate-secret|rates\.json|\.ndjson$/.test(file)),'Prywatne logi w buildzie')
console.log('PASS dist: osobny panel v5.1 za PHP, brak demo w publicznym bundle strony i brak sekretów.')
