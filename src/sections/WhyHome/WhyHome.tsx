import { ArrowRight } from '../../components/common/Icons'

type BenefitKind = 'level' | 'plot' | 'garden' | 'rooms'
type LifestyleKind = 'daily' | 'green' | 'layout'

type Benefit = {
  kind: BenefitKind
  title: string
  text: string
}

const benefits: Benefit[] = [
  { kind: 'level', title: 'Jeden poziom', text: 'Parterowy układ bez schodów między pokojami.' },
  { kind: 'plot', title: 'Własna działka', text: '806–1006 m² przestrzeni wokół domu.' },
  { kind: 'garden', title: 'Ogród od zachodu', text: 'Wyjście ze strefy dziennej w stronę ogrodu. Więcej światła, więcej prywatności.' },
  { kind: 'rooms', title: '5 pokoi', text: 'Salon, 3 sypialnie, 2 łazienki i dodatkowy gabinet.' },
]

function BenefitGlyph({ kind }: { kind: BenefitKind }) {
  return (
    <svg className="benefit__glyph" viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
      {kind === 'level' && <>
        <path d="M8.5 45.5h47" />
        <path d="M13 43V27.5L32 15l19 12.5V43" />
        <path d="M20 43V31h24v12M27 43V31" />
        <path d="M47 40.5c4.2-1.1 6.8-3.5 8.1-7.1M50 38.5c-1.2-2.8-.9-5.3 1.2-7.5M52 40.1c2.4-.6 4.2.1 5.5 2.1" />
      </>}
      {kind === 'plot' && <>
        <path d="M13 20 43 14l7.5 30L20 51 11 35Z" />
        <path d="M19 24.5 39 20l5 19.5-20.5 5-5.5-20Z" strokeDasharray="3.2 3.2" />
        <path d="M7 39c4.4-.7 7.8-3.6 9.8-8M49.5 24c3.5 1.7 5.8 4.7 6.8 8.8" />
        <path d="M8.5 43c2.9-1.8 4.1-4.5 3.7-8.1M55.5 19.5c-2.7 2.4-3.6 5-2.7 7.8" />
      </>}
      {kind === 'garden' && <>
        <circle cx="40.5" cy="20.5" r="7" />
        <path d="M40.5 8v4.5M40.5 28.5V33M28 20.5h4.5M48.5 20.5H53M31.7 11.7l3.2 3.2M46.1 26.1l3.2 3.2M49.3 11.7l-3.2 3.2" />
        <path d="M9 48.5c6-7.6 12.3-11.4 19-11.4 6.2 0 11.1 2.5 14.8 7.4M8 50h47" />
        <path d="M15 42.8c-.8-5 1.2-8.7 6.2-11.2M15.7 40c-3.8-.7-6.3-2.5-7.4-5.6M18.2 36.6c2.6-2.2 5.5-2.7 8.7-1.6" />
      </>}
      {kind === 'rooms' && <>
        <path d="M13 13h38v38H13Z" />
        <path d="M33 13v23M13 31h20M42 13v18M33 41h18M42 31v20" />
        <path d="M20 21h5M19 39h6M37 21h3M45.5 37h3M36.5 46h3" />
        <path d="M33 36c2.6 0 4.8 2.2 4.8 4.8" />
      </>}
    </svg>
  )
}

function LifestyleGlyph({ kind }: { kind: LifestyleKind }) {
  return (
    <svg viewBox="0 0 42 42" fill="none" aria-hidden="true" focusable="false">
      {kind === 'daily' && <>
        <path d="M9 31c8.7-1.1 16.5-8.6 23.5-22.5C20 10 11.8 16.2 9 31Z" />
        <path d="M12 29c6.3-5.4 11.6-10 16-13.7M18.5 22.8l-.6-6.1M21.4 20.2l5.4.6" />
      </>}
      {kind === 'green' && <>
        <path d="M21 7 11.5 19h5L8 31h26l-8.5-12h5Z" />
        <path d="M21 31v5M14 36h14" />
      </>}
      {kind === 'layout' && <>
        <path d="M7 13.5 21 6l14 7.5L21 36 7 13.5Z" />
        <path d="M7 13.5h28M14 13.5 21 36M28 13.5 21 36M14 13.5 21 6l7 7.5" />
      </>}
    </svg>
  )
}

export function WhyHome() {
  return <section id="dom" className="why-home is-visible" aria-labelledby="why-home-title">
    <div className="shell why-home__grid">
      <div className="why-home__content">
        <div className="why-home__intro">
          <div className="section-kicker"><span />Architektura codzienności</div>
          <h2 id="why-home-title">Na jednym poziomie.<br /><em>Z ogrodem za drzwiami.</em></h2>
          <p className="why-home__lead">Strefa dzienna otwarta na ogród. Osobna część sypialna, dwie łazienki i gabinet. Układ, który możesz poznać jeszcze przed pierwszą wizytą.</p>
        </div>

        <div className="why-home__body">
          <div className="why-home__benefits">
            {benefits.map(({ kind, title, text }, index) => <article className="benefit" key={title}>
              <div className="benefit__icon-wrap"><BenefitGlyph kind={kind} /></div>
              <div className="benefit__copy">
                <div className="benefit__meta"><span>0{index + 1}</span><i aria-hidden="true" /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>)}
          </div>

          <div className="why-home__actions">
            <a className="why-home__cta" href="#uklad">Zobacz układ i pomieszczenia <ArrowRight size={19} /></a>
            <span className="why-home__signature"><i aria-hidden="true" />Poznaj swój przyszły dom</span>
          </div>
        </div>
      </div>

      <div className="why-home__visual-shell">
        <svg className="why-home__clip-defs" width="0" height="0" aria-hidden="true" focusable="false">
          <defs>
            <clipPath id="why-home-premium-clip" clipPathUnits="objectBoundingBox">
              <path d="M .16,.03 C .105,.034 .068,.061 .041,.128 C .016,.19 .005,.287 .039,.37 C .07,.445 .1,.5 .086,.6 C .074,.69 .098,.81 .157,.875 C .22,.943 .335,.925 .43,.94 L .88,.98 C .951,.987 .994,.94 1,.86 L 1,.17 C .999,.092 .952,.047 .89,.036 C .665,.006 .39,.014 .16,.03 Z" />
            </clipPath>
          </defs>
        </svg>

        <svg className="why-home__visual-outline why-home__visual-outline--outer" viewBox="0 0 1000 760" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path d="M160 23 C105 26 68 46 41 97 C16 144 5 218 39 281 C70 338 100 380 86 456 C74 524 98 616 157 665 C220 716 335 703 430 714 L880 745 C951 750 994 714 1000 654 L1000 129 C999 70 952 36 890 27 C665 5 390 11 160 23 Z" />
        </svg>
        <svg className="why-home__visual-outline why-home__visual-outline--inner" viewBox="0 0 1000 760" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path d="M160 23 C105 26 68 46 41 97 C16 144 5 218 39 281 C70 338 100 380 86 456 C74 524 98 616 157 665 C220 716 335 703 430 714 L880 745 C951 750 994 714 1000 654 L1000 129 C999 70 952 36 890 27 C665 5 390 11 160 23 Z" />
        </svg>

        <figure className="why-home__visual">
          <img src="/assets/images/decor/why-home-property.webp?v=cebc4c987ed2fc2d" alt="Wizualizacja frontu domu z wejściem, ogrodem i podjazdem" width="1672" height="821" loading="lazy" decoding="async" />
          <span className="why-home__visual-foliage why-home__visual-foliage--top" aria-hidden="true" />
          <span className="why-home__visual-foliage why-home__visual-foliage--bottom" aria-hidden="true" />
          <span className="why-home__visual-warmth" aria-hidden="true" />

          <figcaption className="why-home__visual-title">Dom, który wita<br />od progu<i aria-hidden="true" /></figcaption>

          <div className="why-home__visual-points" aria-label="Najważniejsze cechy domu">
            <div><LifestyleGlyph kind="daily" /><span>Przestrzeń<br />na co dzień</span></div>
            <div><LifestyleGlyph kind="green" /><span>Zieleń<br />za drzwiami</span></div>
            <div><LifestyleGlyph kind="layout" /><span>Przemyślany<br />układ</span></div>
          </div>
        </figure>
      </div>
    </div>
  </section>
}
