import { ClipboardList, Handshake, Home, Landmark, ScrollText, ShieldCheck } from '../../components/common/Icons'
import { useEffect, useRef, useState } from 'react'
import { useSiteData } from '../../data/runtime/SiteDataProvider'
import { ArrowUpRight } from '../../components/common/Icons'
import { purchaseSteps, safetyPillars } from '../../data/purchaseProcess'

const pillarIcons = [ShieldCheck, ScrollText, Handshake]

type ProcessGlyphKind = 'choose' | 'documents' | 'contract' | 'payments' | 'keys'
const processGlyphs: ProcessGlyphKind[] = ['choose','documents','contract','payments','keys']

function ProcessGlyph({ kind }: { kind: ProcessGlyphKind }) {
  return <svg className="security-ref__process-glyph" viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'choose' && <>
      <path d="M13 49V28L32 14l19 14v21Z" fill="#d9c99b44" /><path d="m8 30 24-19 24 19M17 27v22h30V27M27 49V35h10v14M20 29h6v6h-6M39 29h5v6h-5M8 53h48" />
      <path d="M10 49V37m0 6-5-5m5 1 5-6M53 49V37m0 6 5-5" /><circle cx="32" cy="25" r="3" />
    </>}
    {kind === 'documents' && <>
      <path d="M15 15h30v39H15Z" fill="#d9c99b33" /><path d="M20 10h24l8 8v31H20ZM44 10v9h8M26 25h19M26 31h19M26 37h10M10 22v35h28" />
      <circle cx="44" cy="45" r="7" fill="#f6f1e2" /><path d="m40 45 3 3 5-6m-9 9-2 7 7-3 6 3-1-7" />
    </>}
    {kind === 'contract' && <>
      <path d="M12 9h32v44H12Z" fill="#d9c99b33" /><path d="M19 17h18M19 23h18M19 29h12M18 44c3-7 4 6 8 0s5 1 9-3" />
      <path d="m33 38 17-23 6 5-18 23-7 3Zm16-21 6 5M34 38l5 4M15 57h35" /><path d="m50 15 2-3 6 5-2 3" />
    </>}
    {kind === 'payments' && <>
      <path d="M8 47h14V35H8Zm17 0h14V26H25Zm17 0h14V17H42Z" fill="#d9c99b44" /><path d="M8 52h48M9 27l15-8 11 1L51 8m-8 0h8v8" />
      <circle cx="15" cy="40" r="2" /><path d="M31 32h3m-4 4h5m-4 4h3M47 25h4m-4 5h4m-4 5h4m-4 5h4" />
    </>}
    {kind === 'keys' && <>
      <path d="M18 35c-8 3-11 7-12 11l14 10 9-8 15-3c5-2 3-6-1-5l-12 2 5-5c3-3 0-6-3-4l-10 7" fill="#d9c99b33" />
      <circle cx="42" cy="16" r="9" fill="#d9c99b33" /><circle cx="43" cy="14" r="2" /><path d="m37 23-9 13 4 3 3-4 3 2 3-4-3-2 4-6M9 44l14 10" />
    </>}
  </svg>
}

export function SecurityProcess() {
  const { data } = useSiteData()
  const documents = data.documents.filter(d=>d.active && d.publicUrl && ['house_card','standard_pdf','prospectus'].includes(d.type))
  const downloads = [documents.find(d => d.type === 'house_card'), ...documents.filter(d => d.type !== 'house_card')].filter((d): d is NonNullable<typeof d> => Boolean(d))
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
    <>
    <section id="bezpieczenstwo" ref={sectionRef} className={`security-section ${visible ? 'is-visible' : ''}`} aria-labelledby="security-title">
      <div className="shell">
        <div className="section-kicker section-kicker--dark"><span />Bezpieczeństwo + proces zakupu</div>
        <div className="security-photo" aria-hidden="true" /><h2 id="security-title">Najpierw konkret.<br /><em>Potem decyzja.</em></h2>
        <p className="security-section__lead">Poznaj zakres domu, dokumenty i etapy zakupu. Warunki rezerwacji, wpłat oraz odbioru sprawdź przed podpisaniem umowy.</p>

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

        <div className="document-shelf" id="dokumenty">
          <div className="document-shelf__intro"><span>Do spokojnego sprawdzenia</span><h3>Materiały do pobrania</h3><p>Przykładowa karta domu i pełny standard wykonania — bez formularza. Karty poszczególnych działek znajdziesz przy wyborze domu.</p></div>
          <div className="document-shelf__files">{downloads.map(doc=><a key={doc.id} href={doc.publicUrl} target="_blank" rel="noreferrer" aria-label={`Otwórz ${doc.type === 'house_card' ? 'przykładową kartę domu' : doc.title}, PDF`}>{doc.type === 'house_card' ? <Home size={22} aria-hidden="true" /> : <ClipboardList size={22} aria-hidden="true" />}<span><strong>{doc.type === 'house_card' ? 'Przykładowa karta domu' : doc.title}</strong></span><ArrowUpRight size={18} aria-hidden="true" /></a>)}</div>
        </div>
        </div></section><section id="proces-zakupu" className="purchase-section" aria-labelledby="purchase-title"><div className="shell"><div className="section-kicker section-kicker--dark"><span />Proces zakupu</div><div className="security-ref__process">
          <div className="security-ref__process-heading">
            <h2 id="purchase-title">Prosty proces<br /><em>zakupu.</em></h2>
            <p>Od wyboru konkretnego domu do odbioru kluczy — krok po kroku.</p>
          </div>

          <ol className="security-ref__timeline">
            {purchaseSteps.map((step, index) => (
              <li className="security-ref__step" key={step.id}>
                <div className="security-ref__step-head" aria-hidden="true">
                  <span className="security-ref__medallion"><ProcessGlyph kind={processGlyphs[index]} /></span>
                  <b>{step.id}</b>
                </div>
                {index < purchaseSteps.length - 1 ? <span className="security-ref__connector" aria-hidden="true"><i /></span> : null}
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>

          <p className="security-section__note"><Landmark aria-hidden="true" /> Szczegółowe warunki rezerwacji, płatności i odbioru będą wynikały z dokumentów dotyczących konkretnego domu.</p>
        </div>
      </div>
    </section>
    </>
  )
}
