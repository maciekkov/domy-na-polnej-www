import { Menu, Phone, X } from '../common/Icons'
import type { MouseEvent } from 'react'
import { useSiteData } from '../../data/runtime/SiteDataProvider'
import { isSelling } from '../../lib/sales.mjs'
import { useEffect, useRef, useState } from 'react'
import { BrandLogo } from '../common/BrandLogo'
import type { ContactData } from '../../data/runtime/types'
import { track } from '../../lib/analytics'

type HeaderProps = {
  activeSection: 'hero' | 'homes' | 'why-home' | 'location' | 'layout' | 'gallery' | 'standard' | 'security' | 'schedule' | 'journal' | 'team' | 'faq'
  contact: ContactData
}

const navItems = [
  { label: 'Domy i ceny', href: '#domy', available: true, section: 'homes' },
  { label: 'Układ domu', href: '#uklad', available: true, section: 'layout' },
  { label: 'Lokalizacja', href: '#lokalizacja', available: true, section: 'location' },
  { label: 'Spacer 360°', href: '#spacer-360', available: true, section: 'gallery' },
  { label: 'Standard', href: '#standard', available: true, section: 'standard' },
  { label: 'Dokumenty', href: '#dokumenty', available: true, section: 'security' },
]

export function Header({ activeSection, contact }: HeaderProps) {
  const { data } = useSiteData()
  const headerRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > (window.innerWidth > 960 ? 12 : 90))
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const header = headerRef.current
    if (!header) return
    const blocked: Array<[HTMLElement, boolean]> = []
    let current: HTMLElement | null = header
    while (current?.parentElement) {
      for (const sibling of current.parentElement.children) {
        if (sibling !== current && sibling instanceof HTMLElement && !['SCRIPT','STYLE','LINK'].includes(sibling.tagName)) {
          blocked.push([sibling,sibling.inert]); sibling.inert = true
        }
      }
      current = current.parentElement
    }
    const controls = () => [...header.querySelectorAll<HTMLElement>('button:not([disabled]),a[href]')].filter(el=>el.getClientRects().length && !el.closest('[inert],[hidden]'))
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const items = controls(), index = items.indexOf(document.activeElement as HTMLElement)
        if (event.shiftKey && index <= 0) { event.preventDefault(); items.at(-1)?.focus() }
        else if (!event.shiftKey && (index < 0 || index === items.length-1)) { event.preventDefault(); items[0]?.focus() }
      }
      if (event.key === 'Escape') { setMenuOpen(false); menuRef.current?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); blocked.forEach(([el,inert])=>{el.inert=inert}) }
  }, [menuOpen])

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    const resize = () => { if(window.innerWidth > 960) setMenuOpen(false) }
    window.addEventListener('resize',resize)
    return () => {document.body.classList.remove('menu-open');window.removeEventListener('resize',resize)}
  }, [menuOpen])

  const darkHeader = scrolled || menuOpen
  const handleNav = (event: MouseEvent<HTMLAnchorElement>) => {
    const hash = event.currentTarget.getAttribute('href')
    setMenuOpen(false)
    if (menuOpen && hash?.startsWith('#')) requestAnimationFrame(() => {
      const target = document.getElementById(hash.slice(1))
      const heading = target?.querySelector<HTMLElement>('h1,h2,h3')
      if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}) }
    })
  }
  const phoneClick = () => track('phone_click')

  return (
    <header ref={headerRef} className={`site-header ${darkHeader ? 'site-header--scrolled' : ''}`}>
      <div className="site-header__inner shell">
        <a className="site-header__logo" href="#start" aria-label="Domy na Polnej — strona główna">
          <BrandLogo tone={darkHeader ? 'dark' : 'light'} compact={scrolled} />
        </a>

        <nav className="site-header__nav" aria-label="Główna nawigacja">
          {navItems.map((item) => (
            <a
              key={item.section === 'homes' && !isSelling(data) ? 'Domy i działki' : item.label}
              className={activeSection === item.section || (item.section === 'security' && ['schedule', 'journal'].includes(activeSection)) ? 'is-active' : ''}
              aria-current={activeSection === item.section ? 'location' : undefined}
              href={item.href}
              onClick={handleNav}
            >
              {item.section === 'homes' && !isSelling(data) ? 'Domy i działki' : item.label}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          <a className="site-header__phone" href={contact.phoneHref} aria-label={`Zadzwoń: ${contact.phoneDisplay}`} onClick={phoneClick}>
            <Phone size={16} aria-hidden="true" />
            <span>{contact.phoneDisplay}</span>
          </a>
          <a className="button button--header" href="#kontakt" onClick={handleNav}>Zapytaj o dom</a>
        </div>

        <button
          ref={menuRef}
          className="site-header__menu-button"
          type="button"
          aria-label={menuOpen ? 'Zamknij menu' : 'Otwórz menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      <nav id="mobile-menu" inert={!menuOpen} aria-hidden={!menuOpen} className={`mobile-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Nawigacja mobilna">
        {navItems.map((item) => (
          <a key={item.section === 'homes' && !isSelling(data) ? 'Domy i działki' : item.label} href={item.href} onClick={handleNav}>{item.section === 'homes' && !isSelling(data) ? 'Domy i działki' : item.label}<span aria-hidden="true">↗</span></a>
        ))}
        {!isSelling(data) && <a href="#przedsprzedaz" onClick={handleNav}>Powiadom o przedsprzedaży <span aria-hidden="true">↗</span></a>}
        <a className="mobile-nav__contact" href="#kontakt" onClick={handleNav}>Zapytaj o dom <span aria-hidden="true">↗</span></a>
        <a className="button button--olive" href={contact.phoneHref} onClick={phoneClick}>Zadzwoń: {contact.phoneDisplay}</a>
      </nav>
    </header>
  )
}
