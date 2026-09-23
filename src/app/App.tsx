import { useCallback, useEffect, useState } from 'react'
import { MobileContactBar } from '../components/common/MobileContactBar'
import { Header } from '../components/navigation/Header'
import { isHouseId, type HouseId, type HouseSelection } from '../data/houses'
import { useSiteData } from '../data/runtime/SiteDataProvider'
import { Hero } from '../sections/Hero/Hero'
import { Homes } from '../sections/Homes/Homes'
import { WhyHome } from '../sections/WhyHome/WhyHome'
import { Location } from '../sections/Location/Location'
import { Layout } from '../sections/Layout/Layout'
import { Gallery } from '../sections/Gallery/Gallery'
import { Standard } from '../sections/Standard/Standard'
import { SecurityProcess } from '../sections/SecurityProcess/SecurityProcess'
import { Schedule } from '../sections/Schedule/Schedule'
import { Journal } from '../sections/Journal/Journal'
import { Team } from '../sections/Team/Team'
import { FaqContact } from '../sections/FaqContact/FaqContact'
import { Footer } from '../sections/Footer/Footer'
import { ConsentBanner } from '../components/common/ConsentBanner'
import { applyMeta } from '../lib/offers.mjs'
import { track, trackPageView, trackSection } from '../lib/analytics'

type SectionId = 'hero' | 'homes' | 'why-home' | 'location' | 'layout' | 'gallery' | 'standard' | 'security' | 'schedule' | 'journal' | 'team' | 'faq'

export function App() {
  const { data, error: dataError } = useSiteData()
  const { houses } = data
  const initial = new URLSearchParams(window.location.search).get('dom')
  const [selectedId, setSelectedId] = useState<HouseId | null>(isHouseId(initial) ? initial : null)
  const [activeSection, setActiveSection] = useState<SectionId>('hero')

  const selectHouse = useCallback((id: HouseId) => {
    const house = houses.find((item) => item.id === id)
    if (!house) return
    setSelectedId(id)
    const params = new URLSearchParams(window.location.search)
    params.set('dom', id)
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}${window.location.hash}`)
    track('house_select', id)
  }, [houses])

  const changeFormHouse = useCallback((value: HouseSelection) => {
    if (value !== 'unknown') { selectHouse(value); return }
    setSelectedId(null)
    const params = new URLSearchParams(window.location.search)
    params.delete('dom')
    const search = params.toString()
    window.history.replaceState({}, '', `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`)
  }, [selectHouse])

  const askAboutHouse = useCallback((id: HouseId) => {
    selectHouse(id)
    window.setTimeout(() => {
      const form = document.getElementById('kontakt')
      form?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
      form?.querySelector<HTMLInputElement>('input[name="name"]')?.focus({preventScroll:true})
    }, 40)
    track('house_contact_click', id)
  }, [selectHouse])

  useEffect(() => {
    // Native hash semantics, with a focus destination and reduced-motion support.
    const followAnchor = (event: MouseEvent) => {
      if(event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
      const anchor = (event.target as Element)?.closest<HTMLAnchorElement>('a[href^="#"]')
      const hash = anchor?.getAttribute('href')
      if(!hash || hash.length < 2) return
      const destination = document.getElementById(decodeURIComponent(hash.slice(1)))
      if(!destination) return
      event.preventDefault()
      window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}${hash}`)
      const heading = destination.querySelector<HTMLElement>('h1,h2,h3') ?? destination
      if(!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex','-1')
      heading.focus({preventScroll:true})
      destination.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})
    }
    document.addEventListener('click',followAnchor)
    return()=>document.removeEventListener('click',followAnchor)
  }, [])

  useEffect(() => { trackPageView() }, [])
  useEffect(() => { trackSection(activeSection, selectedId ?? undefined) }, [activeSection, selectedId])
  useEffect(() => {
    const onConsent = () => { trackPageView(selectedId ?? undefined); trackSection(activeSection, selectedId ?? undefined) }
    window.addEventListener('dnp-consent-changed', onConsent)
    return () => window.removeEventListener('dnp-consent-changed', onConsent)
  }, [activeSection, selectedId])
  useEffect(() => { applyMeta(document, data) }, [data])

  useEffect(() => {
    const sections: Array<[SectionId, string]> = [
      ['hero', 'start'],
      ['homes', 'domy'],
      ['why-home', 'dom'],
      ['location', 'lokalizacja'],
      ['layout', 'uklad'],
      ['gallery', 'galeria'],
      ['standard', 'standard'],
      ['security', 'bezpieczenstwo'],
      ['schedule', 'harmonogram'],
      ['journal', 'dziennik'],
      ['team', 'zespol'],
      ['faq', 'faq'],
    ]
    const elements = sections
      .map(([id, elementId]) => [id, document.getElementById(elementId)] as const)
      .filter((entry): entry is readonly [SectionId, HTMLElement] => Boolean(entry[1]))
    const visible = new Map<SectionId, number>()
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const match = elements.find(([, element]) => element === entry.target)
        if (match) visible.set(match[0], entry.isIntersecting ? entry.intersectionRatio : 0)
      })
      const current = [...visible.entries()].sort((a, b) => b[1] - a[1])[0]
      if (current?.[1]) setActiveSection(current[0])
    }, { rootMargin: '-28% 0px -55% 0px', threshold: [0, .15, .35, .6] })
    elements.forEach(([, element]) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">Przejdź do treści</a>
      <Header activeSection={activeSection} contact={data.contact} />
      <main id="main">
        <Hero />
        {dataError && <p className="site-data-warning" role="status">{dataError}</p>}
        <Homes houses={houses} selectedId={selectedId} onSelect={selectHouse} onAsk={askAboutHouse} />
        <WhyHome />
        <Location />
        <Layout />
        <Gallery selectedHouse={selectedId ?? 'unknown'} />
        <Standard pdfUrl={data.standardPdf} />
        <SecurityProcess />
        <Schedule stages={data.schedule} />
        <Journal entries={data.journal} />
        <Team />
        <FaqContact selectedHouse={selectedId ?? 'unknown'} onHouseChange={changeFormHouse} contact={data.contact} />
      </main>
      <Footer contact={data.contact} />
      <MobileContactBar contact={data.contact} />
      <ConsentBanner />
    </>
  )
}
