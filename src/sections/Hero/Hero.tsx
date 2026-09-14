import { ArrowDown, ArrowRight } from 'lucide-react'

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

const facts = [
  { value: '111 m²', label: 'powierzchni' },
  { value: '5', label: 'pokoi' },
  { value: '806–1006 m²', label: 'działki' },
  { value: '5', label: 'domów' },
]

export function Hero() {
  return (
    <section className="hero" id="start" aria-labelledby="hero-title">
      <picture className="hero__media" aria-hidden="true">
        <source media="(max-width: 640px)" srcSet={asset('assets/images/hero-mobile.webp')} />
        <img src={asset('assets/images/hero-desktop.webp')} alt="" width="1672" height="941" fetchPriority="high" />
      </picture>
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
              Wejdź do domu — <strong>360°</strong> <ArrowRight size={17} aria-hidden="true" />
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
