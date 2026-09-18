import { useEffect, useRef, useState } from 'react'

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

const benefits = [
  { icon: 'assets/images/ui/why-home/garden.png?v=5bc240f2929e0bc5', title: 'Własny ogród', text: 'Duże działki 806–1006 m²' },
  { icon: 'assets/images/ui/why-home/architecture.png?v=2a1a28acc5f65157', title: 'Nowoczesna architektura', text: 'Prosta forma, ponadczasowy styl' },
  { icon: 'assets/images/ui/why-home/nature.png?v=b06f93bac258b697', title: 'Spokojna okolica', text: 'Blisko natury, z dala od zgiełku' },
  { icon: 'assets/images/ui/why-home/value.png?v=94a0f04c1336b7e4', title: 'Wartość na lata', text: 'Dom pomyślany na kolejne etapy życia' },
]

export function WhyHome() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold: .2 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="dom" ref={sectionRef} className={`why-home ${visible ? 'is-visible' : ''}`} aria-labelledby="why-home-title">
      <div className="shell why-home__grid">
        <div className="why-home__content">
          <div className="section-kicker"><b>03 / 12</b><span />Dlaczego ten dom</div>
          <h2 id="why-home-title">Więcej niż dom.<br />Większa jakość życia.</h2>
          <p className="why-home__lead">Domy na Polnej to połączenie nowoczesnej architektury, prywatności i bliskości natury. Miejsce stworzone z myślą o rodzinach, które szukają spokoju, przestrzeni i trwałej wartości.</p>

          <div className="why-home__benefits">
            {benefits.map(({ icon, title, text }) => (
              <article className="benefit" key={title}>
                <img className="benefit__icon" src={asset(icon)} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>

          <div className="why-home__certainty" aria-label="Przewaga gotowego procesu">
            <strong>Dom bez prowadzenia budowy samemu</strong>
            <p>Znany zakres, określony standard i uporządkowany proces — zamiast samodzielnego koordynowania projektu, wykonawców, dostaw i odbiorów.</p>
          </div>

        </div>

        <figure className="why-home__visual">
          <img src={asset('assets/images/spacer-360/exterior/webp/08_elewacja_ogrodowa.webp?v=a20526b4ebd0cc9b')} alt="Dom na Polnej od strony ogrodu z widokiem na tylną elewację" width="1672" height="941" loading="lazy" decoding="async" />
        </figure>
      </div>
    </section>
  )
}
