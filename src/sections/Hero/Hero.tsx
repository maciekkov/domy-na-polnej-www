import { ArrowDown, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import './HeroRefinement.css'

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

const facts = [
  { value: '111 m²', label: 'powierzchni' },
  { value: '5', label: 'pokoi' },
  { value: '806–1006 m²', label: 'działki' },
  { value: '5', label: 'domów' },
]

const heroSlides = [
  { src: asset('assets/images/gallery/aerial.webp'), alt: 'Widok całej inwestycji Domy na Polnej — pięć domów w jednym rzędzie' },
  { src: asset('assets/images/hero_front_nowe.webp'), alt: 'Fotorealistyczny front domu z ogrodem, wejściem i wiatą' },
  { src: asset('assets/images/spacer-360/exterior/webp/04_podcien_wejsciowy.webp'), alt: 'Zbliżenie na podcień wejściowy i strefę wejścia domu' },
  { src: asset('assets/images/spacer-360/exterior/webp/08_elewacja_ogrodowa.webp'), alt: 'Tylna elewacja domu z ogrodem i tarasem' },
]

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(query.matches)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    if (reduceMotion) return
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [reduceMotion])

  useEffect(() => {
    if (reduceMotion) return
    const timer = window.setTimeout(() => {
      const next = heroSlides[(activeSlide + 1) % heroSlides.length]
      const preload = new Image()
      preload.decoding = 'async'
      preload.src = next.src
    }, 1400)
    return () => window.clearTimeout(timer)
  }, [activeSlide, reduceMotion])

  const slide = heroSlides[activeSlide]

  return (
    <section className="hero" id="start" aria-labelledby="hero-title">
      <div className="hero__media-stack" aria-hidden="true">
        <picture className="hero__media hero__media--slide is-active" key={slide.src}>
          <img src={slide.src} alt="" width="1672" height="941" loading="eager" fetchPriority="high" decoding="async" />
        </picture>
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

          <p className="hero__price"><span>Aktualne ceny</span><strong>od 779 000 zł</strong></p>

          <div className="hero__buttons">
            <a className="button button--light" href="#domy">
              Zobacz domy i ceny <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a className="button button--outline" href="#spacer-360">
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
