import { ArrowRight, Gem, Handshake, Leaf } from '../../components/common/Icons'
import { teamMembers } from '../../data/team'

export function Team() {
  return (
    <section id="zespol" className="team-section" aria-labelledby="team-title">
      <div className="shell team-section__grid">
        <div className="team-section__intro">
          <div className="section-kicker"><b>11 / 12</b><span />Inwestor / zespół</div>
          <h2 id="team-title">Za projektem stoją<br />konkretni ludzie</h2>
          <p>Przygotowanie inwestycji, organizacja budowy i projekt architektoniczny mają swoich opiekunów. Poniżej poznasz osoby oraz pracownię zaangażowane w Domy na Polnej.</p>
          <p className="team-section__note">Masz pytanie o dom, standard lub kolejne etapy? Skontaktuj się bezpośrednio z biurem inwestycji.</p>

          <a className="button button--olive team-section__cta" href="#kontakt">Porozmawiaj z nami <ArrowRight size={17} aria-hidden="true" /></a>
        </div>

        <div className="team-section__people">
          <div className="team-cards">
            {teamMembers.map((member) => (
              <article className="team-card" key={member.id}>
                {member.image ? (
                  <div className="team-card__portrait">
                    <img src={`${import.meta.env.BASE_URL}${member.image.replace(/^\//, '')}`} alt={member.imageAlt ?? ''} loading="lazy" decoding="async" style={{ objectPosition: member.imagePosition }} />
                  </div>
                ) : (
                  <a className="team-card__portrait team-card__portrait--brand" href={member.website} target="_blank" rel="noreferrer" aria-label={`Otwórz stronę ${member.role}`}>
                    <img src={`${import.meta.env.BASE_URL}${member.brandGraphic?.replace(/^\//, '')}`} alt={member.brandGraphicAlt ?? ''} loading="lazy" decoding="async" />
                  </a>
                )}
                <div className="team-card__body">
                  <h3>{member.name}</h3>
                  <p className="team-card__role">{member.role}</p>
                  <p className="team-card__statement">{member.statement}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
