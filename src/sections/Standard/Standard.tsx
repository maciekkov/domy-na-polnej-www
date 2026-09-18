import { assetUrl } from '../../lib/assetUrl'
import { Download, FileText, Leaf, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { standardGroups, standardHighlights } from '../../data/standard'
const asset = (path: string) => assetUrl(`${import.meta.env.BASE_URL}${path}`)

export function Standard({ pdfUrl }: { pdfUrl: string }) {
  const [openId, setOpenId] = useState<string | null>('windows')

  return (
    <section id="standard" className="standard-section" aria-labelledby="standard-title">
      <div className="shell standard-section__grid">
        <div className="standard-section__content">
          <div className="section-kicker"><b>07 / 12</b><span />Standard</div>
          <h2 id="standard-title">To, co ważne, już jest w standardzie</h2>
          <p className="standard-section__lead">Nowoczesne rozwiązania, sprawdzone materiały i wysoka jakość wykonania. Otrzymujesz wszystko, czego potrzebujesz do komfortowego życia — bez dopisywania podstawowych elementów do ceny.</p>

          <div className="standard-highlights" aria-label="Najważniejsze elementy standardu">
            {standardHighlights.map((item) => {
              return <div className="standard-highlight" key={item.id}><span className="standard-highlight__icon"><img src={asset(`assets/images/standard/icons/${item.id}.webp`)} alt="" loading="lazy" /></span><span>{item.label}</span></div>
            })}
          </div>

          <div className="standard-accordion">
            {standardGroups.map((item) => {
              const isOpen = item.id === openId
              return (
                <article className={`standard-accordion__item ${isOpen ? 'is-open' : ''}`} key={item.id}>
                  <h3>
                    <button type="button" aria-expanded={isOpen} aria-controls={`standard-panel-${item.id}`} onClick={() => setOpenId(isOpen ? null : item.id)}>
                      <span>{item.title}</span>{isOpen ? <Minus aria-hidden="true" /> : <Plus aria-hidden="true" />}
                    </button>
                  </h3>
                  <div id={`standard-panel-${item.id}`} className="standard-accordion__panel" hidden={!isOpen}>
                    <strong>{item.lead}</strong>
                    <p>{item.detail}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <div className="standard-section__visuals">
          <figure className="standard-lifestyle">
            <div className="standard-lifestyle__media">
              <img src="/assets/images/standard/standard-lifestyle.webp?v=9b64a08031e958bb" alt="Zestawienie standardu domu: duże przeszklenia, trzyszybowe okna i pompa ciepła" width="1448" height="1086" loading="lazy" decoding="async" />
            </div>
            <figcaption><Leaf aria-hidden="true" /><span><strong>Wyższy standard lepszego życia.</strong><small>Rozwiązania, które realnie wpływają na codzienny komfort.</small></span></figcaption>
          </figure>

          <article className="standard-pdf-card">
            <div className="standard-pdf-card__copy">
              <FileText aria-hidden="true" />
              <h3>Pełny standard w jednym dokumencie</h3>
              <p>Pobierz 13-stronicowy opis standardu technicznego, materiałów i instalacji.</p>
              <a className="button button--olive" href={pdfUrl || undefined} aria-disabled={!pdfUrl} download>Pobierz pełny standard PDF <Download size={17} aria-hidden="true" /></a>
            </div>
            <a className="standard-pdf-card__cover" href={pdfUrl || undefined} aria-disabled={!pdfUrl} target="_blank" rel="noreferrer" aria-label="Otwórz standard techniczny w nowej karcie">
              <img src="/assets/images/standard/standard-cover.webp?v=ad2bd4e03804787a" alt="Okładka dokumentu Standard naszych domów" width="760" height="1075" loading="lazy" decoding="async" />
            </a>
          </article>
        </div>
      </div>
    </section>
  )
}
