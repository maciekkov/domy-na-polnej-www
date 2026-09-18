import { ArrowRight, Building2, MapPin, School, ShoppingCart, Trees } from 'lucide-react'
import { track } from '../../lib/analytics'

const highlights = [
  { icon: Building2, value: '8 min', label: 'centrum Żar' },
  { icon: School, value: '4 min', label: 'szkoła / przedszkole' },
  { icon: ShoppingCart, value: '5 min', label: 'sklep Dino' },
  { icon: Trees, value: 'Za domem', label: 'las i tereny spacerowe' },
]

const mapUrl = 'https://www.google.com/maps/search/?api=1&query=51.657611,15.086237'

export function Location() {
  const directions = () => track('directions_click')
  return (
    <section id="lokalizacja" className="location" aria-labelledby="location-title">
      <div className="location__media" aria-hidden="true">
        <img src="/assets/images/location-map.webp?v=165b294398bf3ee5" alt="" width="2048" height="682" loading="lazy" decoding="async" />
      </div>
      <div className="location__shade" aria-hidden="true" />

      <div className="shell location__grid">
        <div className="location__content">
          <div className="section-kicker section-kicker--dark"><b>04 / 12</b><span />Lokalizacja</div>
          <h2 id="location-title">Spokój natury.<br />Blisko wszystkiego,<br className="location__desktop-break" /> co ważne.</h2>
          <p>Grabik, zaledwie kilka minut od Żar. Kameralna okolica, niska zabudowa, zieleń i szybki dojazd do miasta. Tu łączysz komfort życia blisko natury z wygodnym dostępem do szkół, sklepów i głównych tras.</p>

          <div className="location__facts">
            {highlights.map(({ icon: Icon, value, label }) => (
              <div className="location-fact" key={label}>
                <Icon aria-hidden="true" />
                <div><strong>{value}</strong><span>{label}</span></div>
              </div>
            ))}
          </div>

          <a className="button location__cta" href={mapUrl} target="_blank" rel="noreferrer" onClick={directions}>Zobacz na mapie <ArrowRight size={17} /></a>
        </div>

        <div className="location__map" aria-label="Mapa lokalizacji inwestycji w Grabiku koło Żar">
          <a className="location__route" href={mapUrl} target="_blank" rel="noreferrer" onClick={directions}>
            <MapPin aria-hidden="true" />
            <span><strong>Grabik</strong><small>Blisko Żar, woj. lubuskie</small></span>
            <b>Zobacz trasę <ArrowRight size={16} /></b>
          </a>
        </div>
      </div>
    </section>
  )
}
