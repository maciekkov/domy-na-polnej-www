import { ArrowRight } from '../../components/common/Icons'

const livingRoomImage = '/assets/images/spacer-360/interior/webp/int11c-idz-do-jadalni.webp?v=ebd95fd4d4eaacba'

export function CathedralCeiling() {
  return (
    <section className="cathedral-ceiling" id="wysoki-sufit" aria-labelledby="cathedral-ceiling-title">
      <div className="shell cathedral-ceiling__grid">
        <div className="cathedral-ceiling__intro">
          <div className="cathedral-ceiling__eyebrow"><span aria-hidden="true" />Architektura przestrzeni</div>
          <h2 id="cathedral-ceiling-title">Wysokość,<br />która nadaje<br /><em>charakter.</em></h2>
          <p>Sufit katedralny nadaje otwartej strefie dziennej wyraźną skalę. Salon, jadalnia i kuchnia tworzą jedną całość.</p>
          <div className="cathedral-ceiling__metric">
            <strong>5,82 m</strong>
            <span>w najwyższym punkcie salonu</span>
          </div>
          
          <a href="#uklad" className="cathedral-ceiling__link">Zobacz układ domu <ArrowRight size={20} aria-hidden="true" /></a>
        </div>
        <div className="cathedral-ceiling__visual">
          <figure className="cathedral-ceiling__photo">
            <img src={livingRoomImage} width="1672" height="941" loading="lazy" decoding="async" alt="Wizualizacja otwartej strefy dziennej z salonem, jadalnią i kuchnią" />
            <figcaption>Wizualizacja przykładowej aranżacji wnętrza</figcaption>
          </figure>
          <p className="cathedral-ceiling__mobile-description">Sufit katedralny nadaje strefie dziennej wyraźną skalę. Salon, jadalnia i kuchnia tworzą jedną całość.</p>
          <div className="cathedral-ceiling__garden">
            <span className="garden-eyebrow">Prywatna przestrzeń</span><h3>Własna działka. <br />Ogród za tarasem.</h3>
            <p className="cathedral-ceiling__garden-desktop">Każdy z pięciu domów ma własną działkę; ogród jest naturalnym przedłużeniem strefy dziennej.</p>
            
          </div>
          <a href="#uklad" className="cathedral-ceiling__link cathedral-ceiling__link--mobile">Zobacz układ domu <ArrowRight size={20} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  )
}
