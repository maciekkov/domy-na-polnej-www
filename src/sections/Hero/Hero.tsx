import { ArrowDown, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

const facts = [
  { value: '111 m²', label: 'powierzchni' },
  { value: '5', label: 'pokoi' },
  { value: '806–1006 m²', label: 'działki' },
  { value: '5', label: 'domów' },
]

const heroSlides = [
  {
    desktop: asset('assets/images/house-front.webp'),
    mobile: asset('assets/images/house-front.webp'),
    alt: 'Front domu z ogrodem frontowym, wejściem i wiatą',
  },
  {
    desktop: asset('assets/images/spacer-360/exterior/webp/04_podcien_wejsciowy.webp'),
    mobile: asset('assets/images/spacer-360/exterior/webp/04_podcien_wejsciowy.webp'),
    alt: 'Zbliżenie na podcień wejściowy i strefę wejścia domu',
  },
  {
    desktop: asset('assets/images/spacer-360/exterior/webp/08_elewacja_ogrodowa.webp'),
    mobile: asset('assets/images/spacer-360/exterior/webp/08_elewacja_ogrodowa.webp'),
    alt: 'Tylna elewacja domu z ogrodem i tarasem',
  },
]

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length)
    }, 4000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <section className="hero" id="start" aria-labelledby="hero-title">
      <div className="hero__media-stack" aria-hidden="true">
        {heroSlides.map((slide, index) => (
          <picture className={`hero__media hero__media--slide ${activeSlide === index ? 'is-active' : ''}`} key={slide.desktop}>
            <source media="(max-width: 640px)" srcSet={slide.mobile} />
            <img src={slide.desktop} alt={slide.alt} width="1672" height="941" fetchPriority={index === 0 ? 'high' : 'auto'} />
          </picture>
        ))}
      </div>
      <div className="hero__shade" aria-hidden="true" />

      <div className="hero__content shell">
        <div className="hero__copy">
          <p className="eyebrow eyebrow--light">Domy na Polnej <span>·</span> Grabik</p>
          <h1 id="hero-title">5 wolnostojących<br />domów blisko Żar</h1>
          <p className="hero__lead">111 m² wygodnej przestrzeni, własne działki 806–1006 m²<br className="hero__desktop-break" /> i tylko pięć domów w spokojnym otoczeniu.</p>

          <dl className="hero__facts">
            {facts.map((fact) => (
              <div className="hero__fact" key={fact.label}>
                <dt>{fact.value}</dt>
                <dd>{fact.label}</dd>
              </div>
            ))}
          </dl>

          <div className="hero__buttons">
            <a className="button button--light" href="#domy">
              Zobacz domy i ceny <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a className="button button--outline" href="#galeria">
              Wejdź do spaceru — <strong>360°</strong> <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <a className="hero__discover" href="#domy">
        <ArrowDown size={20} aria-hidden="true" />
        <span>Poznaj inwestycję</span>
      </a>
    </section>
  )
}
