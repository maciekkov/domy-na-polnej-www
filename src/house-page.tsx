// Small progressive enhancement of the already complete, indexable offer HTML.
import React from 'react'
import { createRoot } from 'react-dom/client'
import { ConsentBanner } from './components/common/ConsentBanner'
import { parseSiteData, resolveSiteDocuments } from './data/runtime/siteSchema.mjs'
import { applyMeta } from './lib/offers.mjs'
import { offerMarkup } from './lib/offerMarkup.mjs'
import { track, trackOnce, trackPageView, type AnalyticsEventName } from './lib/analytics'
import snapshot from '../public/data/site-data.json'
import assets from '../public/assets/data/asset-versions.json'
import './styles/fonts'
import './styles/site.css'
import './styles/offer-page.css'
const id = document.body.dataset.houseId || ''
const root = document.getElementById('offer-root')!
const allowed: AnalyticsEventName[] = ['house_pdf_download','house_contact_click','phone_click','email_click']
document.addEventListener('click',event=>{
 const link=(event.target as HTMLElement).closest<HTMLElement>('[data-event]')
 if(link && allowed.includes(link.dataset.event as AnalyticsEventName)) track(link.dataset.event as AnalyticsEventName,id)
 if((event.target as HTMLElement).closest('#offer-cookie-settings')) window.dispatchEvent(new Event('dnp-open-cookie-settings'))
})
const record = () => { trackPageView(); trackOnce('house_card_open', id, 'offer:'+id) }
record();window.addEventListener('dnp-consent-changed',record)
createRoot(document.getElementById('offer-consent')!).render(<React.StrictMode><ConsentBanner /></React.StrictMode>)
let revision=snapshot.revision
let pending=false
async function refresh(){
 if(pending)return;pending=true
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000)
 try{
  const response=await fetch('/data/site-data.json',{cache:'no-cache',signal:controller.signal})
  if(!response.ok)throw Error('HTTP '+response.status)
  const data=resolveSiteDocuments(parseSiteData(await response.json()))
  if(data.revision>=revision){root.innerHTML=offerMarkup(data,id,assets.assets);applyMeta(document,data,id);revision=data.revision}
  document.getElementById('offer-data-warning')!.hidden=true
 }catch{document.getElementById('offer-data-warning')!.hidden=false}
 finally{clearTimeout(timer);pending=false}
}
void refresh()
window.addEventListener('focus',()=>void refresh())
