import { CreditCard, FileText, Handshake, House, KeyRound, Landmark, ScrollText, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { purchaseSteps, safetyPillars } from '../../data/purchaseProcess'
const pillarIcons = [ShieldCheck, ScrollText, Handshake]
const processIcons = [House, FileText, Handshake, CreditCard, KeyRound]

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

        <div className="security-ref__pillars">
          {safetyPillars.map((pillar, index) => {
            const Icon = pillarIcons[index]
            return (
              <article className="security-ref__pillar" key={pillar.id}>
                <span className="security-ref__pillar-icon"><Icon aria-hidden="true" /></span>
                <div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.text}</p>
                </div>
              </article>
            )
          })}
        </div>

        <div className="security-ref__process">
          <div className="security-ref__process-heading">
            <h3>Prosty proces zakupu</h3>
            <p>Od wyboru konkretnego domu do odbioru kluczy — krok po kroku.</p>
          </div>

          <ol className="security-ref__timeline">
            {purchaseSteps.map((step, index) => {
              const Icon = processIcons[index]
              return (
                <li className="security-ref__step" key={step.id}>
                  <div className="security-ref__step-head" aria-hidden="true">
                    <span className="security-ref__medallion"><Icon /></span>
                    <b>{step.id}</b>
                  </div>
                  {index < purchaseSteps.length - 1 ? <span className="security-ref__connector" aria-hidden="true"><i>›</i></span> : null}
                  <h4>{step.title}</h4>
                  <p>{step.text}</p>
                </li>
              )
            })}
          </ol>

          <p className="security-section__note"><Landmark aria-hidden="true" /> Szczegółowe warunki rezerwacji, płatności i odbioru będą wynikały z dokumentów dotyczących konkretnego domu.</p>
        </div>
      </div>
    </section>
  )
}
