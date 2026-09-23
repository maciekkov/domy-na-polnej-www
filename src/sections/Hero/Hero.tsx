import { ArrowDown, ArrowRight, ArrowUpRight } from '../../components/common/Icons'
import { useSiteData } from '../../data/runtime/SiteDataProvider'
import { formatArea } from '../../data/houses'

export function Hero() {
  const { data } = useSiteData()
  const house = data.houses[0]
  const plots = data.houses.map(h => h.plot)

  return (
    <section className="hero" id="start" aria-labelledby="hero-title">
      <div className="hero__media-stack">
        <picture className="hero__media is-loaded">
          <source media="(max-width: 640px)" srcSet="/assets/images/responsive/hero-mobile.webp?v=78765ade65711f2b" />
          <img
            src="/assets/images/responsive/hero-0-1672.webp"
            srcSet={[640, 1024, 1672].map(w => `/assets/images/responsive/hero-0-${w}.webp ${w}w`).join(', ')}
            sizes="100vw"
            width="1672"
            height="941"
            alt="Wizualizacja pięciu wolnostojących domów na Polnej"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__content shell">
        <div className="hero__copy">
          <p className="eyebrow eyebrow--light">{data.houses.length} domów wolnostojących <span>·</span> Grabik koło Żar</p>
          <h1 id="hero-title">Dom z ogrodem.<br /><em>Blisko Żar.</em></h1>
          <p className="hero__lead">Parterowy dom, {house.rooms} pokoi i własna działka.<br className="hero__desktop-break" /> Przestrzeń do życia — w domu i poza nim.</p>
          <div className="hero__buttons">
            <a className="button button--light" href="#domy">Wybierz dom i zobacz szczegóły <ArrowRight size={19} /></a>
            <a className="hero__tour-link" href="#spacer-360">Rozejrzyj się w 360° <ArrowUpRight size={19} /></a>
          </div>
        </div>
        <div className="hero__bottom">
          <dl className="hero__facts">
            <div><dt>{formatArea(house.area)}</dt><dd>powierzchni użytkowej</dd></div>
            <div><dt>{Math.min(...plots)}–{Math.max(...plots)} m²</dt><dd>powierzchni działki</dd></div>
            <div><dt>Już wkrótce</dt><dd>start sprzedaży i cennik</dd></div>
          </dl>
        </div>
      </div>
      <a className="hero__discover" href="#domy" aria-label="Przejdź do planu inwestycji"><ArrowDown size={20} /></a>
    </section>
  )
}
