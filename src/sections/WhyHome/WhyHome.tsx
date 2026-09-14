import { useEffect, useRef, useState } from 'react'

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

const benefits = [
  { icon: 'assets/images/ui/why-home/garden.png', title: 'Własny ogród', text: 'Duże działki 806–1006 m²' },
  { icon: 'assets/images/ui/why-home/architecture.png', title: 'Nowoczesna architektura', text: 'Prosta forma, ponadczasowy styl' },
  { icon: 'assets/images/ui/why-home/nature.png', title: 'Spokojna okolica', text: 'Blisko natury, z dala od zgiełku' },
  { icon: 'assets/images/ui/why-home/value.png', title: 'Wartość na lata', text: 'Dom pomyślany na kolejne etapy życia' },
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

        </div>

        <figure className="why-home__visual">
          <img src="/assets/images/why-home.webp" alt="Dom na Polnej od strony przestronnego, zielonego ogrodu" width="1700" height="950" loading="eager" decoding="async" />
        </figure>
      </div>
    </section>
  )
}
