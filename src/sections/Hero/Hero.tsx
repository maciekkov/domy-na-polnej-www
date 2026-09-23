import { ArrowDown, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from '../../components/common/Icons'
import { useState } from 'react'
import { useSiteData } from '../../data/runtime/SiteDataProvider'
import { formatArea, formatPrice } from '../../data/houses'

const slides = [
  { title: 'Inwestycja', alt: 'Wizualizacja pięciu wolnostojących domów na Polnej' },
  { title: 'Od strony wejścia', alt: 'Wizualizacja elewacji frontowej domu' },
  { title: 'Detal wejścia', alt: 'Wizualizacja podcienia wejściowego' },
  { title: 'Od strony ogrodu', alt: 'Wizualizacja elewacji ogrodowej z aranżacją tarasu' },
]
export function Hero() {
  const { data } = useSiteData()
  const [active, setActive] = useState(0)
  const [loaded, setLoaded] = useState(true)
  const house = data.houses[0]
  const available = data.houses.filter(h => h.status === 'Dostępny')
  const minimum = available.length ? Math.min(...available.map(h => h.price)) : null
  const plots = data.houses.map(h=>h.plot)
  const choose = (index:number) => { setLoaded(false); setActive((index + slides.length) % slides.length) }
  return (
    <section className="hero" id="start" aria-labelledby="hero-title">
      <div className="hero__media-stack">
        <picture className={`hero__media ${loaded ? 'is-loaded' : ''}`} key={active}>
          {active === 0 && <source media="(max-width: 640px)" srcSet="/assets/images/responsive/hero-mobile.webp?v=78765ade65711f2b" />}
          <img src={`/assets/images/responsive/hero-${active}-1672.webp`} srcSet={[640,1024,1672].map(w=>`/assets/images/responsive/hero-${active}-${w}.webp ${w}w`).join(', ')} sizes="100vw" width="1672" height="941" alt={slides[active].alt} loading="eager" fetchPriority={active === 0 ? 'high' : 'auto'} decoding="async" onLoad={()=>setLoaded(true)} />
        </picture>
      </div>
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__content shell">
        <div className="hero__copy">
          <p className="eyebrow eyebrow--light">{data.houses.length} domów wolnostojących <span>·</span> Grabik koło Żar</p>
          <h1 id="hero-title">Dom z ogrodem.<br /><em>Blisko Żar.</em></h1>
          <p className="hero__lead">Parterowy dom, {house.rooms} pokoi i własna działka.<br className="hero__desktop-break" /> Przestrzeń do życia — w domu i poza nim.</p>
          <div className="hero__buttons">
            <a className="button button--light" href="#domy">Wybierz dom i sprawdź cenę <ArrowRight size={19} /></a>
            <a className="hero__tour-link" href="#spacer-360">Rozejrzyj się w 360° <ArrowUpRight size={19} /></a>
          </div>
        </div>
        <div className="hero__bottom">
          <dl className="hero__facts">
            <div><dt>{formatArea(house.area)}</dt><dd>powierzchni użytkowej</dd></div>
            <div><dt>{Math.min(...plots)}–{Math.max(...plots)} m²</dt><dd>powierzchni działki</dd></div>
            <div><dt>{minimum ? `od ${formatPrice(minimum)}` : 'Sprawdź ofertę'}</dt><dd>{minimum ? 'cena brutto dostępnego domu' : 'aktualne statusy domów'}</dd></div>
          </dl>
          <div className="hero__controls" role="group" aria-label="Widoki inwestycji">
            <span className="hero__image-caption" aria-live="polite">Wizualizacja <b>{String(active+1).padStart(2,'0')} / 04</b></span>
            <button type="button" onClick={()=>choose(active-1)} aria-label="Poprzedni widok inwestycji"><ChevronLeft /></button>
            <button type="button" onClick={()=>choose(active+1)} aria-label="Następny widok inwestycji"><ChevronRight /></button>
          </div>
        </div>
      </div>
      <a className="hero__discover" href="#domy" aria-label="Przejdź do planu inwestycji"><ArrowDown size={20} /></a>
    </section>
  )
}
