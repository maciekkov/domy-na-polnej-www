import { Handshake, Landmark, ScrollText, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { purchaseSteps, safetyPillars } from '../../data/purchaseProcess'

const pillarIcons = [ShieldCheck, ScrollText, Handshake]
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`
const stepIcons = [
  'assets/images/ui/purchase/step-01.png',
  'assets/images/ui/purchase/step-02.png',
  'assets/images/ui/purchase/step-03.png',
  'assets/images/ui/purchase/step-04.png',
  'assets/images/ui/purchase/step-05.png',
]

export function SecurityProcess() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || visible) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { threshold: .22 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [visible])

  return (
    <section id="bezpieczenstwo" ref={sectionRef} className={`security-section ${visible ? 'is-visible' : ''}`} aria-labelledby="security-title">
      <div className="shell">
        <div className="section-kicker section-kicker--dark"><b>08 / 12</b><span />Bezpieczeństwo + proces zakupu</div>
        <h2 id="security-title">Bezpieczny zakup od pierwszej wpłaty do odbioru</h2>
        <p className="security-section__lead">Przejrzysty proces, ustawowe mechanizmy ochrony i pełne wsparcie na każdym etapie. Jasno pokazujemy, co dzieje się z wpłatami i jakie dokumenty otrzymujesz.</p>

        <div className="safety-pillars">
          {safetyPillars.map((pillar, index) => {
            const Icon = pillarIcons[index]
            return (
              <article className="safety-pillar" key={pillar.id}>
                <span className="safety-pillar__icon"><Icon aria-hidden="true" /></span>
                <div><h3>{pillar.title}</h3><p>{pillar.text}</p></div>
              </article>
            )
          })}
        </div>

        <div className="purchase-process">
          <div className="purchase-process__heading">
            <h3>Prosty proces zakupu</h3>
            <p>Od wyboru konkretnego domu do odbioru kluczy — krok po kroku.</p>
          </div>
          <ol className="purchase-timeline">
            {purchaseSteps.map((step, index) => (
              <li key={step.id}>
                <div className="purchase-timeline__visual" aria-hidden="true">
                  <img src={asset(stepIcons[index])} alt="" loading="lazy" decoding="async" />
                  <b className="purchase-timeline__number">{String(index + 1).padStart(2, '0')}</b>
                </div>
                {index < purchaseSteps.length - 1 ? <span className="purchase-timeline__connector" aria-hidden="true" /> : null}
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="security-section__note"><Landmark aria-hidden="true" /> Szczegółowe warunki rezerwacji, płatności i odbioru będą wynikały z dokumentów dotyczących konkretnego domu.</p>
        </div>
      </div>
    </section>
  )
}
