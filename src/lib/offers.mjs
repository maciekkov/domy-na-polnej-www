/** A single price/status/SEO policy, used at build time and in the browser. */
export const SITE_ORIGIN = 'https://domynapolnej.pl'
export const HOUSE_CODES = ['A','B','C','D','E']
export const housePath = id => `/dom-${id.toLowerCase()}/`
export const money = n => new Intl.NumberFormat('pl-PL').format(n).replace(/\u00a0/g, ' ') + ' zł'
export const areaText = n => new Intl.NumberFormat('pl-PL',{minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2}).format(n).replace(/\u00a0/g,' ') + ' m²'
export const unitPrice = h => h.price / h.area
export const moneyPerSqm = h => new Intl.NumberFormat('pl-PL',{minimumFractionDigits:2,maximumFractionDigits:2}).format(unitPrice(h)).replace(/\u00a0/g,' ') + ' zł/m²'
export function availablePrice(houses) {
  const available = houses.filter(h => h.status === 'Dostępny' && Number.isFinite(h.price) && h.price > 0)
  return available.length ? Math.min(...available.map(h => h.price)) : null
}
export function offerLead(_houses) {
  return 'Sprzedaż i cennik już wkrótce'
}
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
export const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
export function pageMeta(data, id = null) {
  const h = data.houses.find(h => h.id === id)
  if (id && !h) throw new Error('Nieznany dom')
  const title = h ? `${h.name} — ${areaText(h.area)}, działka ${h.plot} m² | Domy na Polnej` : 'Domy na Polnej — Grabik koło Żar'
  const description = h
    ? `${h.name} w Grabiku koło Żar. Dom wolnostojący ${areaText(h.area)}, ${h.rooms} pokoi, działka ${h.plot} m² (${h.parcel}). ${h.status}. Sprzedaż i cennik już wkrótce.`
    : 'Domy na Polnej w Grabiku pod Żarami — pięć wolnostojących domów z własnymi działkami. Sprzedaż i cennik już wkrótce.'
  return { title, description, canonical: SITE_ORIGIN + (h ? housePath(h.id) : '/'), image: SITE_ORIGIN + (h?.image ?? data.houses[0].image) }
}
export function structuredData(data, id = null) {
  const m = pageMeta(data, id)
  const org = {'@type':'Organization','@id':SITE_ORIGIN+'/#organization',name:'X-SMART DEVELOP sp. z o.o.',url:SITE_ORIGIN+'/',email:data.contact.email,telephone:data.contact.phoneHref.slice(4)}
  const website = {'@type':'WebSite','@id':SITE_ORIGIN+'/#website',url:SITE_ORIGIN+'/',name:'Domy na Polnej',inLanguage:'pl-PL',publisher:{'@id':org['@id']}}
  const graph = [org,website]
  if (id) {
    const h = data.houses.find(h => h.id === id)
    const home = {'@type':['SingleFamilyResidence','Product'],'@id':m.canonical+'#dom',name:h.name,description:m.description,url:m.canonical,image:[m.image],identifier:h.parcel,numberOfRooms:h.rooms,
      floorSize:{'@type':'QuantitativeValue',value:h.area,unitCode:'MTK'},
      address:{'@type':'PostalAddress',addressLocality:'Grabik',addressRegion:'lubuskie',addressCountry:'PL'},
      additionalProperty:[{'@type':'PropertyValue',name:'Powierzchnia działki',value:h.plot,unitCode:'MTK'},{'@type':'PropertyValue',name:'Miejsca postojowe',value:h.parking}]}
    graph.push(home,{'@type':'RealEstateListing','@id':m.canonical+'#strona',name:m.title,url:m.canonical,description:m.description,inLanguage:'pl-PL',mainEntity:{'@id':home['@id']},isPartOf:{'@id':website['@id']}})
    graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Domy na Polnej',item:SITE_ORIGIN+'/'},{'@type':'ListItem',position:2,name:h.name,item:m.canonical}]})
  } else {
    graph.push({'@type':'ItemList',name:'Domy na Polnej — domy A–E',url:SITE_ORIGIN+'/#domy',itemListElement:data.houses.map((h,i)=>({'@type':'ListItem',position:i+1,name:h.name,item:{'@type':'Product',name:h.name,sku:h.id,url:SITE_ORIGIN+'/?dom='+h.id+'#domy'}}))})
  }
  return {'@context':'https://schema.org','@graph':graph}
}
export function applyMeta(document, data, id = null) {
  const m=pageMeta(data,id)
  document.title=m.title
  const set=(attr,key,value)=>{let el=document.head.querySelector(`meta[${attr}="${key}"]`);if(!el){el=document.createElement('meta');el.setAttribute(attr,key);document.head.append(el)}el.content=value}
  set('name','description',m.description)
  for (const [key,v] of Object.entries({title:m.title,description:m.description,url:m.canonical,image:m.image})) set('property','og:'+key,v)
  for (const [key,v] of Object.entries({title:m.title,description:m.description,image:m.image})) set('name','twitter:'+key,v)
  let c=document.querySelector('link[rel="canonical"]');if(!c){c=document.createElement('link');c.rel='canonical';document.head.append(c)}c.href=m.canonical
  let ld=document.querySelector('#site-schema');if(!ld){ld=document.createElement('script');ld.id='site-schema';ld.type='application/ld+json';document.head.append(ld)}ld.textContent=safeJson(structuredData(data,id))
}
