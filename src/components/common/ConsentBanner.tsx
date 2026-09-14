import { BarChart3, Settings2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ANALYTICS_CONSENT_KEY, track } from '../../lib/analytics'

export function ConsentBanner() {
  const [open, setOpen] = useState(() => !localStorage.getItem(ANALYTICS_CONSENT_KEY))
  const [settings, setSettings] = useState(false)

  useEffect(() => {
    const reopen = () => { setOpen(true); setSettings(true) }
    window.addEventListener('dnp-open-cookie-settings', reopen)
    return () => window.removeEventListener('dnp-open-cookie-settings', reopen)
  }, [])

  const decide = (value: 'accepted' | 'necessary') => {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, value)
    setOpen(false)
    if (value === 'accepted') track('page_view')
  }

  if (!open) return null
  return (
    <aside className="consent-banner" aria-label="Ustawienia prywatności">
      <button className="consent-banner__close" type="button" onClick={() => decide('necessary')} aria-label="Zamknij i pozostaw tylko niezbędne"><X /></button>
      <div className="consent-banner__icon"><BarChart3 aria-hidden="true" /></div>
      <div className="consent-banner__copy">
        <strong>Twoja prywatność</strong>
        <p>Używamy danych niezbędnych do działania strony. Za Twoją zgodą zbieramy anonimowe statystyki, aby sprawdzać, które elementy oferty są pomocne.</p>
        {settings && <p className="consent-banner__detail"><b>Niezbędne</b> — zawsze aktywne. <b>Analityczne</b> — anonimowe i opcjonalne.</p>}
      </div>
      <div className="consent-banner__actions">
        <button className="button button--olive" type="button" onClick={() => decide('accepted')}>Akceptuj analitykę</button>
        <button className="button consent-banner__necessary" type="button" onClick={() => decide('necessary')}>Tylko niezbędne</button>
        {!settings && <button className="consent-banner__settings" type="button" onClick={() => setSettings(true)}><Settings2 /> Ustawienia</button>}
      </div>
    </aside>
  )
}
