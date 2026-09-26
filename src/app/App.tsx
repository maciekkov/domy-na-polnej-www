import { useCallback, useEffect, useState } from 'react'
import { Header } from '../components/navigation/Header'
import { isHouseId, type HouseId, type HouseSelection } from '../data/houses'
import { useSiteData } from '../data/runtime/SiteDataProvider'
import { Hero } from '../sections/Hero/Hero'
import { Homes } from '../sections/Homes/Homes'
import { WhyHome } from '../sections/WhyHome/WhyHome'
import { Location } from '../sections/Location/Location'
import { Layout } from '../sections/Layout/Layout'
import { CathedralCeiling } from '../sections/CathedralCeiling/CathedralCeiling'
import { Gallery } from '../sections/Gallery/Gallery'
import { Standard } from '../sections/Standard/Standard'
import { SecurityProcess } from '../sections/SecurityProcess/SecurityProcess'
import { Schedule } from '../sections/Schedule/Schedule'
import { Presale } from '../sections/Presale/Presale'
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

  useEffect(() => {
    const syncHistory = () => {
      const id = new URLSearchParams(window.location.search).get('dom')
      setSelectedId(isHouseId(id) ? id : null)
    }
    window.addEventListener('popstate', syncHistory)
    return () => window.removeEventListener('popstate', syncHistory)
  }, [])

  const changeFormHouse = useCallback((value: HouseSelection) => {
    if (value !== 'unknown') { selectHouse(value); return }
    setSelectedId(null)
    const params = new URLSearchParams(window.location.search)
    params.delete('dom')
    const search = params.toString()
    window.history.replaceState({}, '', `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`)
  }, [selectHouse])

  useEffect(() => {
    // Native hash semantics, with a focus destination and reduced-motion support.
    const followAnchor = (event: MouseEvent) => {
      if(event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
      const anchor = (event.target as Element)?.closest<HTMLAnchorElement>('a[href^="#"]')
      const hash = anchor?.getAttribute('href')
      if(!hash || hash.length < 2) return
      let decoded: string
      try { decoded = decodeURIComponent(hash.slice(1)) } catch { return }
      const destination = document.getElementById(decoded)
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
    // A top-of-viewport marker also works for sections taller than the screen.
    let frame = 0
    const update = () => {
      frame = 0
      let current: SectionId = 'hero'
      for (const [id, element] of [...elements].sort((a,b) => a[1].offsetTop - b[1].offsetTop)) {
        if (element.getBoundingClientRect().top <= 160) current = id
      }
      setActiveSection(current)
    }
    const queue = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
    }
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">Przejdź do treści</a>
      <Header activeSection={activeSection} contact={data.contact} />
      <main id="main">
        <Hero />
        {dataError && <p className="site-data-warning" role="status">{dataError}</p>}
        <Homes houses={houses} selectedId={selectedId} onSelect={selectHouse} />
        <WhyHome />
        <Layout />
        <CathedralCeiling />
        <Location />
        <Gallery selectedHouse={selectedId ?? 'unknown'} />
        <Standard pdfUrl={data.standardPdf} />
        <SecurityProcess />
        <Schedule stages={data.schedule} />
        <Journal entries={data.journal} />
        <Presale />
        <Team />
        <FaqContact selectedHouse={selectedId ?? 'unknown'} onHouseChange={changeFormHouse} contact={data.contact} />
      </main>
      <Footer contact={data.contact} />
      <ConsentBanner />
    </>
  )
}
