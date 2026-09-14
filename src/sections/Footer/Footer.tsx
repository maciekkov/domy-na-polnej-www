import { Facebook, Instagram, Leaf, Mail, MapPin, Phone } from 'lucide-react'
import { BrandLogo } from '../../components/common/BrandLogo'
import type { ContactData } from '../../data/runtime/types'

export function Footer({ contact }: { contact: ContactData }) {
  return (
    <footer className="site-footer" aria-label="Stopka strony">
      <div className="shell">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <a href="#start" aria-label="Domy na Polnej — początek strony"><BrandLogo tone="light" compact /></a>
            <p>Pięć wyjątkowych domów blisko Żar.<br />Spokój natury. Wysoka jakość życia.</p>
            <div className="site-footer__socials" aria-label="Media społecznościowe">
              <span className="is-disabled" aria-label="Facebook — adres do uzupełnienia"><Facebook aria-hidden="true" /></span>
              <a href={contact.instagramHref} target="_blank" rel="noreferrer" aria-label="Instagram Domy na Polnej"><Instagram aria-hidden="true" /></a>
            </div>
          </div>
          <nav aria-label="Nawigacja w stopce"><h3>Nawigacja</h3><a href="#domy">Domy i ceny</a><a href="#lokalizacja">Lokalizacja</a><a href="#dom">Dom</a><a href="#galeria">Spacer 360°</a><a href="#standard">Standard</a></nav>
          <div className="site-footer__docs"><h3>Dokumenty</h3><span>Polityka prywatności</span><button type="button" onClick={() => window.dispatchEvent(new Event('dnp-open-cookie-settings'))}>Ustawienia cookies</button><span>Prospekt / dokumenty</span><a href="#domy">Informacje cenowe</a><span>Dane dewelopera</span></div>
          <div className="site-footer__contact"><h3>Kontakt</h3><a href={contact.phoneHref}><Phone aria-hidden="true" />{contact.phoneDisplay}</a><a href={contact.emailHref}><Mail aria-hidden="true" />{contact.email}</a><a href={contact.mapHref} target="_blank" rel="noreferrer"><MapPin aria-hidden="true" /><span>{contact.addressLine1}<br />{contact.addressLine2}</span></a></div>
        </div>
        <div className="site-footer__bottom"><span>© 2026 Domy na Polnej. Wszelkie prawa zastrzeżone.</span><span>Naturalne miejsce. Prawdziwe wartości. <Leaf aria-hidden="true" /></span></div>
      </div>
    </footer>
  )
}
