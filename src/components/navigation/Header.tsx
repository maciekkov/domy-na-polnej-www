import { Menu, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BrandLogo } from '../common/BrandLogo'
import type { ContactData } from '../../data/runtime/types'
import { track } from '../../lib/analytics'

type HeaderProps = {
  activeSection: 'hero' | 'homes' | 'why-home' | 'location' | 'layout' | 'gallery' | 'standard' | 'security' | 'schedule' | 'journal' | 'team' | 'faq'
  contact: ContactData
}

const navItems = [
  { label: 'Domy i ceny', href: '#domy', available: true, section: 'homes' },
  { label: 'Lokalizacja', href: '#lokalizacja', available: true, section: 'location' },
  { label: 'Dom', href: '#dom', available: true, section: 'why-home' },
  { label: 'Spacer 360°', href: '#galeria', available: true, section: 'gallery' },
  { label: 'Standard', href: '#standard', available: true, section: 'standard' },
]

export function Header({ activeSection, contact }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 90)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const darkHeader = scrolled || menuOpen
  const handleNav = () => setMenuOpen(false)
  const phoneClick = () => track('phone_click')

  return (
    <header className={`site-header ${darkHeader ? 'site-header--scrolled' : ''}`}>
      <div className="site-header__inner shell">
        <a className="site-header__logo" href="#start" aria-label="Domy na Polnej — strona główna">
          <BrandLogo tone={darkHeader ? 'dark' : 'light'} compact={scrolled} />
        </a>

        <nav className="site-header__nav" aria-label="Główna nawigacja">
          {navItems.map((item) => (
            <a
              key={item.label}
              className={activeSection === item.section || (item.section === 'standard' && ['security', 'schedule', 'journal'].includes(activeSection)) ? 'is-active' : ''}
              href={item.href}
              onClick={handleNav}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          <a className="site-header__phone" href={contact.phoneHref} aria-label={`Zadzwoń: ${contact.phoneDisplay}`} onClick={phoneClick}>
            <Phone size={16} aria-hidden="true" />
            <span>{contact.phoneDisplay}</span>
          </a>
          <a className="button button--header" href={contact.phoneHref} onClick={phoneClick}>Zadzwoń</a>
        </div>

        <button
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

      <nav id="mobile-menu" className={`mobile-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Nawigacja mobilna">
        {navItems.map((item) => (
          <a key={item.label} href={item.href} onClick={handleNav}>{item.label}<span aria-hidden="true">↗</span></a>
        ))}
        <a className="button button--olive" href={contact.phoneHref} onClick={phoneClick}>Zadzwoń: {contact.phoneDisplay}</a>
      </nav>
    </header>
  )
}
