import { Cookie, Settings2, X } from './Icons'
import { useEffect, useState } from 'react'
import { readConsent, setConsent, trackPageView } from '../../lib/analytics'

export function ConsentBanner() {
  const [open, setOpen] = useState(() => !readConsent() || (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type === 'reload')
  const [settings, setSettings] = useState(false)

  useEffect(() => {
    const reopen = () => { setOpen(true); setSettings(true) }
    window.addEventListener('dnp-open-cookie-settings', reopen)
    return () => window.removeEventListener('dnp-open-cookie-settings', reopen)
  }, [])

  const decide = (value: 'all' | 'necessary') => {
    setConsent(value)
    setOpen(false)
    if (value === 'all') trackPageView()
  }

  if (!open) return null
  return (
    <aside className="consent-banner" aria-label="Ustawienia plików cookie">
      <button className="consent-banner__close" type="button" onClick={() => decide('necessary')} aria-label="Zamknij i pozostaw tylko niezbędne pliki cookie"><X /></button>
      <div className="consent-banner__icon"><Cookie aria-hidden="true" /></div>
      <div className="consent-banner__copy">
        <strong>Pliki cookie</strong>
        <p>Używamy niezbędnych plików cookie do działania strony i zapamiętania ustawień. Za zgodą możemy także używać własnych plików cookie do pomiaru korzystania z serwisu.</p>
        {readConsent() && <p className="consent-banner__detail">Zapisany wybór: {readConsent() === 'all' ? 'wszystkie pliki cookie' : 'tylko niezbędne'}. Możesz go teraz zmienić.</p>}
        {settings && <p className="consent-banner__detail"><b>Niezbędne</b> — działanie i zapamiętanie ustawień. <b>Analityczne</b> — rozpoznanie powrotów, urządzenia oraz czasu spędzonego w sekcjach i spacerach; bez danych wpisywanych do formularza i bez reklamowych trackerów.</p>}
        <a className="consent-banner__policy" href="/polityka-cookies/">Polityka cookies</a>
      </div>
      <div className="consent-banner__actions">
        <button className="button button--olive" type="button" onClick={() => decide('all')}>Akceptuj wszystkie</button>
        <button className="button consent-banner__necessary" type="button" onClick={() => decide('necessary')}>Tylko niezbędne</button>
        {!settings && <button className="consent-banner__settings" type="button" onClick={() => setSettings(true)}><Settings2 /> Ustawienia</button>}
      </div>
    </aside>
  )
}
