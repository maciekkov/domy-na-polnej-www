import { ClipboardList, Handshake, Home, Landmark, ScrollText, ShieldCheck } from '../../components/common/Icons'
import { useEffect, useRef, useState } from 'react'
import { useSiteData } from '../../data/runtime/SiteDataProvider'
import { ArrowUpRight } from '../../components/common/Icons'
import { purchaseSteps, safetyPillars } from '../../data/purchaseProcess'

const pillarIcons = [ShieldCheck, ScrollText, Handshake]

type ProcessGlyphKind = 'choose' | 'documents' | 'contract' | 'payments' | 'keys'
const processGlyphs: ProcessGlyphKind[] = ['choose','documents','contract','payments','keys']

function ProcessGlyph({ kind }: { kind: ProcessGlyphKind }) {
  return <svg className="security-ref__process-glyph" viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">
    {kind === 'choose' && <>
      <path d="M7 30V17l13-8 13 8v13" />
      <path d="M11 30h18M15 20h10M17 30v-6h6v6" />
      <path d="M8 34h24" />
    </>}
    {kind === 'documents' && <>
      <path d="M11 6h13l6 6v22H11Z" />
      <path d="M24 6v7h6M15 18h11M15 23h11M15 28h8" />
      <path d="M8 10H6v24h18" />
    </>}
    {kind === 'contract' && <>
      <path d="M9 7h22v26H9Z" />
      <path d="M14 13h12M14 18h12M14 23h7" />
      <path d="m20 29 3 3 7-8" />
    </>}
    {kind === 'payments' && <>
      <path d="M8 11h24M8 20h24M8 29h24" />
      <circle cx="13" cy="11" r="3" /><circle cx="21" cy="20" r="3" /><circle cx="28" cy="29" r="3" />
      <path d="M5 7v26" />
    </>}
    {kind === 'keys' && <>
      <circle cx="14" cy="16" r="6" />
      <path d="m18.5 20.5 13 13M25 27l3-3M29 31l3-3" />
      <path d="M8 31v-7M5 31h6" />
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
    <section id="bezpieczenstwo" ref={sectionRef} className={`security-section ${visible ? 'is-visible' : ''}`} aria-labelledby="security-title">
      <div className="shell">
        <div className="section-kicker section-kicker--dark"><span />Bezpieczeństwo + proces zakupu</div>
        <h2 id="security-title">Najpierw konkret. Potem decyzja.</h2>
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
          <div className="document-shelf__files">{downloads.map(doc=><a key={doc.id} href={doc.publicUrl} target="_blank" rel="noreferrer" aria-label={`Otwórz ${doc.type === 'house_card' ? 'przykładową kartę domu' : doc.title}, PDF`}>{doc.type === 'house_card' ? <Home size={22} aria-hidden="true" /> : <ClipboardList size={22} aria-hidden="true" />}<span><strong>{doc.type === 'house_card' ? 'Przykładowa karta domu' : doc.title}</strong><small>PDF{doc.version && doc.version !== '—' ? ` · wersja ${doc.version}` : ''}</small></span><ArrowUpRight size={18} aria-hidden="true" /></a>)}</div>
        </div>
        <div className="security-ref__process">
          <div className="security-ref__process-heading">
            <h3>Prosty proces zakupu</h3>
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
  )
}
