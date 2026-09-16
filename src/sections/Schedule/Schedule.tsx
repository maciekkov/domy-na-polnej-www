import { ArrowRight, Check, HardHat } from 'lucide-react'
import type { ScheduleStage } from '../../data/schedule'
import './ScheduleRefinement.css'

export function Schedule({ stages }: { stages: ScheduleStage[] }) {
  return (
    <section id="harmonogram" className="schedule-section" aria-labelledby="schedule-title">
      <div className="shell">
        <div className="schedule-section__intro">
          <div className="schedule-section__copy">
            <div className="section-kicker"><b>09 / 12</b><span />Harmonogram</div>
            <h2 id="schedule-title">Od działki do kluczy</h2>
            <p>Przejrzysty harmonogram pokazuje, jak krok po kroku powstają Domy na Polnej. Sprawdź, na jakim etapie jesteśmy i co będzie dalej.</p>
          </div>

          <figure className="schedule-section__visual schedule-section__visual--agreement">
            <img src="/assets/images/schedule/umowa_deweloperska.webp" alt="Umowa deweloperska, plan domu i klucze na stole" width="1672" height="941" loading="lazy" decoding="async" />
          </figure>
        </div>

        <ol className="schedule-timeline" aria-label="Etapy realizacji inwestycji">
          {stages.map((stage) => (
            <li className={`schedule-stage schedule-stage--${stage.state}`} key={stage.id}>
              <div className="schedule-stage__rail" aria-hidden="true" />
              <div className="schedule-stage__marker" aria-hidden="true">
                {stage.state === 'completed' ? <Check /> : <span />}
              </div>
              <span className="schedule-stage__roman">{stage.id}</span>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
              <span className="schedule-stage__status">{stage.status}</span>
              <time>{stage.term}</time>
            </li>
          ))}
        </ol>

        <div className="schedule-section__footer">
          <a className="button button--olive schedule-section__cta" href="#dziennik">Zobacz postęp budowy <ArrowRight size={17} aria-hidden="true" /></a>
          <div className="schedule-section__promise"><HardHat aria-hidden="true" /><span><strong>Solidny proces.</strong><b>Pewny efekt.</b></span></div>
        </div>
      </div>
    </section>
  )
}
