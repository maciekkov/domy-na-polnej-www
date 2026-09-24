import { ArrowRight } from '../../components/common/Icons'

type BenefitKind = 'level' | 'plot' | 'garden' | 'rooms'

type Benefit = {
  kind: BenefitKind
  title: string
  text: string
}

const benefits: Benefit[] = [
  { kind:'level', title:'Jeden poziom', text:'Parterowy układ bez schodów między pokojami.' },
  { kind:'plot', title:'Własna działka', text:'806–1006 m² przestrzeni wokół domu.' },
  { kind:'garden', title:'Ogród od zachodu', text:'Wyjście ze strefy dziennej w stronę ogrodu.' },
  { kind:'rooms', title:'5 pokoi', text:'Salon, sypialnie i dodatkowy gabinet.' },
]

function BenefitGlyph({ kind }: { kind: BenefitKind }) {
  return (
    <svg className="benefit__glyph" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
      {kind === 'level' && <>
        <path d="M7 31.5h34M10 29V17.5L24 9l14 8.5V29" />
        <path d="M15 22h18M18 29v-7m12 7v-7" />
      </>}
      {kind === 'plot' && <>
        <path d="M9 12.5 33.5 8 40 31.5 15 40 8 25Z" />
        <path d="M14 16.5 30.5 13l4.5 15-16.5 6-4.5-17.5Z" strokeDasharray="2.6 3" />
        <path d="M8 19h4M34.5 11.5l1 4M12 34l3.5-1.2M36 29l4 1.3" />
      </>}
      {kind === 'garden' && <>
        <path d="M10 36V16h13v20M23 36h15" />
        <path d="M14 24h5M14 29h5" />
        <circle cx="35" cy="14" r="5.5" />
        <path d="M35 4v3M35 21v3M25 14h3M42 14h3M28 7l2 2M40 19l2 2M42 7l-2 2" />
        <path d="M27 36c2.5-5 5.5-7.5 9-7.5S41 31 42 36" />
      </>}
      {kind === 'rooms' && <>
        <path d="M9 9h30v30H9Z" />
        <path d="M24 9v18M9 23h15M31 9v14M24 31h15M31 23v16" />
        <path d="M15 15h3M14 29h4M28 15h2M34 27h2M27 35h2" />
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
        </div>
        <div className="why-home__body">
        <p className="why-home__lead">Strefa dzienna otwarta na ogród. Osobna część sypialna, dwie łazienki i gabinet. Układ, który możesz poznać jeszcze przed pierwszą wizytą.</p>
        <div className="why-home__benefits">
          {benefits.map(({kind,title,text},index)=><article className="benefit" key={title}>
            <div className="benefit__head"><BenefitGlyph kind={kind} /><span>0{index+1}</span></div>
            <h3>{title}</h3><p>{text}</p>
          </article>)}
        </div>
        <a className="text-link" href="#uklad">Zobacz układ i pomieszczenia <ArrowRight size={18} /></a>
        </div>
      </div>
      <figure className="why-home__visual"><img src="/assets/images/responsive/hero-3-1024.webp?v=214a6b124dcecc44" srcSet="/assets/images/responsive/hero-3-640.webp?v=814af869f09ff8ab 640w, /assets/images/responsive/hero-3-1024.webp?v=214a6b124dcecc44 1024w, /assets/images/responsive/hero-3-1672.webp?v=5e497d13a16b6931 1672w" sizes="(max-width: 760px) 100vw, 50vw" alt="Wizualizacja domu od strony zachodniego ogrodu" width="1672" height="941" loading="lazy" decoding="async" /><figcaption><span>Dom otwarty na ogród</span><small>Wizualizacja · przykładowa aranżacja</small></figcaption></figure>
    </div>
  </section>
}
