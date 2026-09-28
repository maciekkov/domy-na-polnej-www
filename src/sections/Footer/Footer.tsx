import { Instagram, Leaf, Mail, MapPin, Phone } from '../../components/common/Icons'
import { BrandLogo } from '../../components/common/BrandLogo'
import type { ContactData } from '../../data/runtime/types'
import { useSiteData } from '../../data/runtime/SiteDataProvider'
import { isSelling } from '../../lib/sales.mjs'
import { track } from '../../lib/analytics'

export function Footer({ contact }: { contact: ContactData }) {
  const { data } = useSiteData()
  return (
    <footer className="site-footer" aria-label="Stopka strony">
      <div className="shell">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <a href="#start" aria-label="Domy na Polnej — początek strony"><BrandLogo tone="light" compact /></a>
            <p>Pięć domów wolnostojących w Grabiku.<br />Jeden poziom. Własny ogród.</p>
            <div className="site-footer__socials" aria-label="Media społecznościowe">
              <a href={contact.instagramHref} target="_blank" rel="noreferrer" aria-label="Instagram Domy na Polnej"><Instagram aria-hidden="true" /></a>
            </div>
          </div>
          <nav aria-label="Nawigacja w stopce"><h3>Nawigacja</h3><a href="#domy">{isSelling(data) ? 'Domy i ceny' : 'Domy i działki'}</a><a href="#lokalizacja">Lokalizacja</a><a href="#uklad">Układ domu</a><a href="#spacer-360">Spacer 360°</a><a href="#standard">Standard</a>{!isSelling(data) && <a href="#przedsprzedaz">Powiadomienie o przedsprzedaży</a>}</nav>
          <div className="site-footer__docs"><h3>Dokumenty</h3><a href="/polityka-prywatnosci/">Polityka prywatności</a><a href="/polityka-cookies/">Polityka cookies</a><button className="site-footer__link-button" type="button" onClick={() => window.dispatchEvent(new Event('dnp-open-cookie-settings'))}>Ustawienia cookies</button><a href="#standard">Standard techniczny</a><a href="#dokumenty">Karty domów i dokumenty</a></div>
          <div className="site-footer__contact"><h3>Kontakt</h3><a href={contact.phoneHref} onClick={() => track('phone_click')}><Phone aria-hidden="true" />{contact.phoneDisplay}</a><a href={contact.emailHref} onClick={() => track('email_click')}><Mail aria-hidden="true" />{contact.email}</a><a href={contact.mapHref} target="_blank" rel="noreferrer" onClick={() => track('directions_click')}><MapPin aria-hidden="true" /><span>{contact.addressLine1}<br />{contact.addressLine2}</span></a></div>
        </div>
        <div className="site-footer__legal"><span>X-SMART DEVELOP sp. z o.o. · ul. Warszawska 58/3, 68-300 Lubsko</span><span>KRS 0001091198 · NIP 8943230686 · REGON 527945971</span></div>
        <div className="site-footer__bottom"><span>© 2026 Domy na Polnej. Wszelkie prawa zastrzeżone.</span><span>Naturalne miejsce. Prawdziwe wartości. <Leaf aria-hidden="true" /></span></div>
      </div>
    </footer>
  )
}
