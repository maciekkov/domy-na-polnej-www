import {existsSync,readFileSync,writeFileSync,mkdirSync,renameSync,unlinkSync} from 'node:fs'
import {randomUUID} from 'node:crypto'
import {resolve,join,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {parseSiteData,resolveSiteDocuments} from '../src/data/runtime/siteSchema.mjs'
import {pageMeta,structuredData,safeJson,escapeHtml as e,SITE_ORIGIN,money,areaText,moneyPerSqm} from '../src/lib/offers.mjs'
const root=resolve(import.meta.dirname,'..')
export function headFor(html,data,id=null){
 const m=pageMeta(data,id)
 html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${e(m.title)}</title>`)
 for(const [attr,key,value] of [['name','description',m.description],['property','og:title',m.title],['property','og:description',m.description],['property','og:url',m.canonical],['property','og:image',m.image],['name','twitter:title',m.title],['name','twitter:description',m.description],['name','twitter:image',m.image]]){
  const re=new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*\\/?>`)
  const tag=`<meta ${attr}="${key}" content="${e(value)}" />`
  html=re.test(html)?html.replace(re,tag):html.replace('</head>',tag+'\n</head>')
 }
 html=html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/,`<link rel="canonical" href="${m.canonical}" />`)
 html=html.replace(/<script(?: id="site-schema")? type="application\/ld\+json">[\s\S]*?<\/script>/,`<script id="site-schema" type="application/ld+json">${safeJson(structuredData(data,id))}</script>`)
 return html
}
export function homeSnapshot(data){
 const h=data.houses[0], available=data.houses.filter(x=>x.status==='Dostępny'), plots=data.houses.map(x=>x.plot)
 const lowest=available.length?money(Math.min(...available.map(x=>x.price))):null
 const price=lowest?`od ${lowest}`:'Sprawdź ofertę'
 return `<section class="hero" id="start" aria-labelledby="hero-title"><div class="hero__media-stack"><picture class="hero__media is-loaded"><source media="(max-width:640px)" srcset="/assets/images/responsive/hero-mobile.webp"><img src="/assets/images/responsive/hero-0-1672.webp" srcset="/assets/images/responsive/hero-0-640.webp 640w, /assets/images/responsive/hero-0-1024.webp 1024w, /assets/images/responsive/hero-0-1672.webp 1672w" sizes="100vw" width="1672" height="941" alt="Wizualizacja inwestycji Domy na Polnej" fetchpriority="high"></picture></div><div class="hero__shade" aria-hidden="true"></div><div class="hero__content shell"><div class="hero__copy"><p class="eyebrow eyebrow--light">${data.houses.length} domów wolnostojących <span>·</span> Grabik koło Żar</p><h1 id="hero-title">Dom z ogrodem.<br><em>Blisko Żar.</em></h1><p class="hero__lead">Parterowy dom, ${h.rooms} pokoi i własna działka.<br class="hero__desktop-break"> Przestrzeń do życia — w domu i poza nim.</p><div class="hero__buttons"><a class="button button--light" href="#domy">Wybierz dom i sprawdź cenę →</a><a class="hero__tour-link" href="${e(data.contact.phoneHref)}">${e(data.contact.phoneDisplay)}</a></div></div><div class="hero__bottom"><dl class="hero__facts"><div><dt>${e(areaText(h.area))}</dt><dd>powierzchni użytkowej</dd></div><div><dt>${Math.min(...plots)}–${Math.max(...plots)} m²</dt><dd>powierzchni działki</dd></div><div><dt>${e(price)}</dt><dd>cena brutto dostępnego domu</dd></div></dl><span class="hero__image-caption">Wizualizacja 01 / 04</span></div></div></section>
 <section id="domy" class="nojs-offers shell"><h2>Domy i ceny</h2><p>Pełny plan i spacery wymagają JavaScript. Ceny, dokumenty i kontakt są dostępne poniżej.</p><div class="nojs-offers__grid">${data.houses.map(x=>`<article><h3>${e(x.name)}</h3><p>${e(x.status)} · działka ${e(x.parcel)}</p><p>${e(areaText(x.area))} domu · ${x.plot} m² działki</p><strong>${e(money(x.price))}</strong><p>${e(moneyPerSqm(x))} brutto</p>${x.pdf?`<a href="${e(x.pdf)}">Karta domu PDF</a>`:''}</article>`).join('')}</div><p>${data.standardPdf?`<a href="${e(data.standardPdf)}">Standard techniczny PDF</a> · `:''}<a href="${e(data.contact.phoneHref)}">${e(data.contact.phoneDisplay)}</a> · <a href="${e(data.contact.emailHref)}">${e(data.contact.email)}</a></p><p><a href="/polityka-prywatnosci/">Polityka prywatności</a> · <a href="/polityka-cookies/">Polityka cookies</a></p></section>`
}

function replaceSnapshot(html,markup){
 // Markers survive Vite, and prevent replacing unrelated React markup.
 const fragment=`<div id="root"><!--dnp-home-start-->${markup}<!--dnp-home-end--></div>`
 return html.replace(/<div id="root">(?:<!--[\s\S]*?dnp-home-end-->|)\s*<\/div>/,fragment)
}
export function prepareSourcePages(projectRoot=root, suppliedData=null){
 const data=suppliedData ??resolveSiteDocuments(parseSiteData(JSON.parse(readFileSync(join(projectRoot,'public/data/site-data.json'),'utf8'))))
 const index=join(projectRoot,'index.html')
 if(!existsSync(index))return []
 let source=readFileSync(index,'utf8')
 const critical=['src/styles/tokens.css','src/styles/globals.css','src/styles/sections/hero.css'].map(p=>readFileSync(join(projectRoot,p),'utf8')).join('\n') + '\n.nojs-offers{padding-block:64px}.nojs-offers__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px}.nojs-offers article{padding:24px;border:1px solid #c9cdbf;border-radius:6px;background:#fdfcf8}.nojs-offers a{display:inline-flex;min-height:44px;align-items:center}.nojs-offers article strong{font-size:22px}\n@media(max-width:760px){:root{--shell:calc(100% - 40px)}}'
 source=source.replace(/<style id="dnp-critical-css">[\s\S]*?<\/style>/,`<style id="dnp-critical-css">${critical}</style>`)
 source=source.replace(/<link rel="preload" as="image"[^>]*>/g,'')
 source=source.replace('</head>',`<link rel="preload" as="image" href="/assets/images/responsive/hero-mobile.webp" media="(max-width:640px)" fetchpriority="high" />\n<link rel="preload" as="image" href="/assets/images/responsive/hero-0-1672.webp" imagesrcset="/assets/images/responsive/hero-0-640.webp 640w, /assets/images/responsive/hero-0-1024.webp 1024w, /assets/images/responsive/hero-0-1672.webp 1672w" imagesizes="100vw" media="(min-width:641px)" fetchpriority="high" />\n</head>`)

 const versionsPath=join(projectRoot,'public/assets/data/asset-versions.json')
 const versions=existsSync(versionsPath)?JSON.parse(readFileSync(versionsPath,'utf8')).assets:{}
 const mobileDigest=versions['/assets/images/responsive/hero-mobile.webp']
 let home=replaceSnapshot(headFor(source,data),homeSnapshot(data))
 if(mobileDigest) home=home.replace(/hero-mobile\.webp(?:\?v=[a-f0-9]+)?/g,`hero-mobile.webp?v=${mobileDigest}`)
 return [{path:index,content:home},{path:join(projectRoot,'public/sitemap.xml'),content:sitemapContent(data)}]
}
export function generateSourcePages(projectRoot=root){commitFileUpdates(prepareSourcePages(projectRoot))}
function sitemapContent(data){
 const paths=['/','/polityka-prywatnosci/','/polityka-cookies/']
 return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(p=>`\n  <url><loc>${SITE_ORIGIN+p}</loc></url>`).join('')}\n</urlset>\n`
}
export function writeSitemap(target,data){writeFileSync(join(target,'sitemap.xml'),sitemapContent(data))}
/** Publication refreshes metadata and HTML too: no React/Vite rebuild required. */
export function preparePublishedSeo(target,data){
 if(!existsSync(join(target,'index.html')))return []
 let index=readFileSync(join(target,'index.html'),'utf8')
 if(!index.includes('<!--dnp-home-start-->') || !index.includes('<!--dnp-home-end-->')) throw new Error('Brak znaczników strony głównej — wymagany pełny build.')
 return [{path:join(target,'index.html'),content:replaceSnapshot(headFor(index,data),homeSnapshot(data))},{path:join(target,'sitemap.xml'),content:sitemapContent(data)}]
}
export function refreshPublishedSeo(target,data){commitFileUpdates(preparePublishedSeo(target,data))}

/** Stage all output before touching published files. JSON is committed last by the caller.
 * File renames are atomic; on a deployment error, restore already changed files.
 * For globally atomic deployments, publish to a new directory then switch the web root.
 */
export function commitFileUpdates(updates){
 const staged=[];const completed=[]
 try{
  for(const item of updates){
   mkdirSync(dirname(item.path),{recursive:true})
   const previous=existsSync(item.path)?readFileSync(item.path):null
   const temporary=item.path+'.'+randomUUID()+'.tmp'
   staged.push({...item,temporary,previous})
   writeFileSync(temporary,item.content)
  }
  for(const item of staged){renameSync(item.temporary,item.path);completed.push(item)}
 }catch(error){
  for(const item of completed.reverse()){
   if(item.previous===null){if(existsSync(item.path))unlinkSync(item.path)}
   else{const rollback=item.path+'.rollback-'+randomUUID();writeFileSync(rollback,item.previous);renameSync(rollback,item.path)}
  }
  throw error
 }finally{for(const item of staged)if(existsSync(item.temporary))unlinkSync(item.temporary)}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 generateSourcePages();console.log('SEO: strona główna + sitemap wygenerowane z site-data.json')
}
