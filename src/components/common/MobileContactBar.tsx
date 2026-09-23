import { useEffect, useState } from 'react'
import type { ContactData } from '../../data/runtime/types'
import { Phone, ArrowUpRight } from './Icons'
import { track } from '../../lib/analytics'
export function MobileContactBar({contact}: {contact:ContactData}) {
  const [visible,setVisible]=useState(false)
  useEffect(()=>{
    const update=()=>{
      const hero=document.getElementById('start'),form=document.getElementById('kontakt')
      setVisible(!!hero && hero.getBoundingClientRect().bottom < 80 && (!form || form.getBoundingClientRect().top > innerHeight - 120))
    }
    update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update)
    return()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update)}
  },[])
  if(!visible)return null
  return <nav className="mobile-contact-bar" aria-label="Szybki kontakt"><a href={contact.phoneHref} onClick={()=>track('phone_click')}><Phone size={18} />Zadzwoń</a><a href="#kontakt">Zapytaj o dom <ArrowUpRight size={18} /></a></nav>
}
