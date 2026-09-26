import { Download, FileText, Leaf, Minus, Plus } from '../../components/common/Icons'
import { useState } from 'react'
import { standardGroups, standardHighlights } from '../../data/standard'

export function Standard({ pdfUrl }: { pdfUrl: string }) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section id="standard" className="standard-section" aria-labelledby="standard-title">
      <div className="shell standard-section__grid">
        <div className="standard-section__content">
          <div className="standard-section__intro">
          <div className="section-kicker"><span />Standard</div>
          <h2 id="standard-title">To, co ważne,<br />jest już w standardzie.</h2>
          <p className="standard-section__lead">Pompa ciepła, ogrzewanie podłogowe, wentylacja z odzyskiem ciepła i okna trzyszybowe. Poniżej najważniejsze elementy, a w dokumencie PDF — szczegółowy zakres materiałów i prac.</p>

          </div>
          <div className="standard-section__body">
          <div className="standard-highlights" aria-label="Najważniejsze elementy standardu">
            {standardHighlights.map((item) => {
              return <div className="standard-highlight" key={item.id}><span className={`standard-highlight__icon standard-highlight__icon--${item.id}`} aria-hidden="true" /><span>{item.label}</span></div>
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
        </div>

        <div className="standard-section__visuals">
          <figure className="standard-lifestyle">
            <div className="standard-lifestyle__media">
              <img src="/assets/images/standard/standard-lifestyle.webp?v=9b64a08031e958bb" alt="Zestawienie standardu domu: duże przeszklenia, trzyszybowe okna i pompa ciepła" width="1448" height="1086" loading="lazy" decoding="async" />
            </div>
            <figcaption><Leaf aria-hidden="true" /><span><strong>Materiały i instalacje.</strong><small>Zestawienie ilustracyjne. Zakres określa dokument standardu.</small></span></figcaption>
          </figure>

          <article className="standard-pdf-card">
            <div className="standard-pdf-card__copy">
              <FileText aria-hidden="true" />
              <h3>Pełny standard w jednym dokumencie</h3>
              <p>Sprawdź opis materiałów, instalacji i zakresu prac przed decyzją o zakupie.</p>
              <a className="button button--olive" href={pdfUrl || undefined} aria-disabled={!pdfUrl} download>Pobierz pełny standard PDF <Download size={17} aria-hidden="true" /></a>
            </div>
            <a className="standard-pdf-card__cover" href={pdfUrl || undefined} aria-disabled={!pdfUrl} target="_blank" rel="noreferrer" aria-label="Otwórz standard techniczny w nowej karcie">
              <img src="/assets/images/standard/standard-cover.webp?v=485bb001f613806e" alt="Okładka dokumentu Standard naszych domów" width="760" height="1075" loading="lazy" decoding="async" />
            </a>
          </article>
        </div>
          <div className="scope-note"><strong>Standard deweloperski, nie dom pod klucz.</strong><p>Wykończenie wnętrz, kuchnia, wyposażenie łazienek, umeblowanie i nasadzenia nie są w cenie podstawowej. PV Ready oznacza przygotowanie pod fotowoltaikę, nie komplet paneli. Taras i wiata wymagają odrębnego uzgodnienia.</p></div>
      </div>
    </section>
  )
}
