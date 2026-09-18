import {existsSync,readFileSync,writeFileSync,mkdirSync,renameSync,unlinkSync} from 'node:fs'
import {randomUUID} from 'node:crypto'
import {resolve,join,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {parseSiteData,resolveSiteDocuments} from '../src/data/runtime/siteSchema.mjs'
import {pageMeta,structuredData,safeJson,escapeHtml as e,SITE_ORIGIN} from '../src/lib/offers.mjs'
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
 return `<section class="hero-fallback" aria-label="Domy na Polnej"><div class="hero-fallback__shade"></div><div class="hero-fallback__inner"><p class="hero-fallback__eyebrow">Domy na Polnej <span>·</span> Grabik</p><h1>5 wolnostojących<br/>domów blisko Żar</h1><p class="hero-fallback__lead">111 m² wygodnej przestrzeni, własne działki 806–1006 m² i tylko pięć domów w spokojnym otoczeniu.</p><div class="hero-fallback__facts"><span><strong>111 m²</strong> powierzchni</span><span><strong>5</strong> pokoi</span><span><strong>806–1006 m²</strong> działki</span><span><strong>5</strong> domów</span></div><div class="hero-fallback__buttons"><a href="/#domy">Zobacz domy i ceny</a><a href="${e(data.contact.phoneHref)}">${e(data.contact.phoneDisplay)}</a></div></div></section>`
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
 const source=readFileSync(index,'utf8')
 const home=replaceSnapshot(headFor(source,data),homeSnapshot(data))
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
