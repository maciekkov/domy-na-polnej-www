// Keep the original investment rendering; this is a layout change, not an image replacement.
const livingRoomImage = '/assets/images/spacer-360/interior/webp/int11c-idz-do-jadalni.webp?v=ebd95fd4d4eaacba'

export function CathedralCeiling() {
  return (
    <section className="cathedral-ceiling" id="wysoki-sufit" aria-labelledby="cathedral-ceiling-title">
      <div className="shell cathedral-ceiling__grid">
        <div className="cathedral-ceiling__intro">
          <div className="cathedral-ceiling__eyebrow"><span aria-hidden="true" />Architektura przestrzeni</div>
          <h2 id="cathedral-ceiling-title">Wysokość,<br />która nadaje<br /><em>charakter.</em></h2>
          <p>Sufit katedralny o wysokości do 5,82 m nadaje otwartej strefie dziennej wyjątkową przestronność. Salon, jadalnia i kuchnia tworzą jedną, spójną całość.</p>
          <div className="cathedral-ceiling__metric" aria-label="Sufit katedralny o wysokości do 5,82 metra">
            <div className="cathedral-ceiling__measurement" aria-hidden="true">
              <div className="cathedral-ceiling__value"><span>Do</span><strong>5,82<small> m</small></strong></div>
              <span className="cathedral-ceiling__metric-label">Sufit katedralny</span>
            </div>
            <div className="cathedral-ceiling__space" aria-hidden="true">
              <svg viewBox="0 0 72 76" fill="none" stroke="currentColor" strokeWidth="1.5" focusable="false">
                <path d="M8 32 36 9l28 23v35H8Z" />
                <path d="M36 22v35m-4-30 4-5 4 5m-8 25 4 5 4-5" />
              </svg>
              <span>Więcej przestrzeni<br />na co dzień</span>
            </div>
          </div>
        </div>
        <div className="cathedral-ceiling__visual">
          <figure className="cathedral-ceiling__photo">
            <img src={livingRoomImage} width="1672" height="941" loading="lazy" decoding="async" alt="Wizualizacja otwartej strefy dziennej z salonem, jadalnią i kuchnią" />
            <figcaption>Wizualizacja przykładowej aranżacji wnętrza</figcaption>
          </figure>
          <div className="cathedral-ceiling__garden">
            <span className="garden-eyebrow">Prywatna przestrzeń</span>
            <h3>Własna działka. Ogród za tarasem.</h3>
            <p>Każdy z pięciu domów ma własną działkę; ogród jest naturalnym przedłużeniem strefy dziennej.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
