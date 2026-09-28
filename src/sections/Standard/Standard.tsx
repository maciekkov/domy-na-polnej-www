import type { ReactNode } from 'react'
import { ArrowRight, FileText, SunMedium, Leaf, ShieldCheck } from '../../components/common/Icons'
import { standardGroups, standardHighlights, type StandardIconId } from '../../data/standard'
import { assetUrl } from '../../lib/assetUrl'

// Separate, optimized crops from the supplied illustration board. Text remains real HTML.
const illustrations: Record<StandardIconId, string> = {
  'heat-pump': '/assets/images/standard/editorial/heat-pump.webp?v=f57f03bc34cd6cfd',
  ventilation: '/assets/images/standard/editorial/ventilation.webp?v=3f53c88925d3befb',
  'floor-heating': '/assets/images/standard/editorial/floor-heating.webp?v=493a5eacbab06ecb',
  blinds: '/assets/images/standard/editorial/blinds.webp?v=9169ebb5eb786f73',
  windows: '/assets/images/standard/editorial/windows.webp?v=afc1910f0e41c022',
  glazing: '/assets/images/standard/editorial/glazing.webp?v=5bad0d8ff93b75e0',
  pv: '/assets/images/standard/editorial/pv.webp?v=2c41af0bdbfc058a',
  fence: '/assets/images/standard/editorial/fence.webp?v=f70a2c3422499716',
}

type GroupId = (typeof standardGroups)[number]['id']
const summaries: Record<GroupId, string> = {
  construction: 'Ściany 24 cm, solidne ocieplenie i konstrukcja dachu C24. Parterowy układ zaprojektowany na lata.',
  windows: 'Okna trzyszybowe, szczelny montaż, duże przeszklenia i rolety elektryczne. Więcej światła i lepsza izolacja.',
  installations: 'Instalacje elektryczne, wodno-kanalizacyjne, rekuperacja i przygotowanie PV Ready.',
  heating: 'Pompa ciepła i ogrzewanie podłogowe — równomierny komfort bez tradycyjnych grzejników.',
  exterior: 'Jasna elewacja, czarny dach i starannie dobrane materiały. Spójna architektura całego osiedla.',
  plot: 'Ogrodzenie, brama i furtka, podjazd, dojście, opaska żwirowa oraz uporządkowany teren.',
}

// The six line icons are vector UI elements, matching the supplied board's pictograms.
function TopicIcon({ id }: { id: GroupId }) {
  const paths: Record<GroupId, ReactNode> = {
    construction: <><path d="m4 18 16-14 16 14M9 14v21h22V14M16 35V23h8v12M27 9V5h5v9" /></>,
    windows: <><rect x="9" y="5" width="23" height="31" /><path d="M13 9h15v23H13zM21 9v23M13 20h15" /></>,
    installations: <><path d="M5 10h9m8 0h13M5 21h20m8 0h2M5 32h9m8 0h13" /><circle cx="18" cy="10" r="4" /><circle cx="29" cy="21" r="4" /><circle cx="18" cy="32" r="4" /></>,
    heating: <><path d="M10 5c-10 12 10 18 0 30M20 5c-10 12 10 18 0 30M30 5c-10 12 10 18 0 30" /></>,
    exterior: <><path d="M9 32C-2 19 11 7 33 4c0 20-10 34-24 28ZM6 37l20-25" /></>,
    plot: <><path d="m13 4-8 14h5l-7 13h20l-7-13h5L13 4ZM13 31v7m15-28-5 10h4l-5 11h14l-5-11h3l-6-10ZM28 31v7" /></>,
  }
  return <svg viewBox="0 0 40 42" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[id]}</svg>
}

export function Standard({ pdfUrl }: { pdfUrl: string }) {
  return (
    <section id="standard" className="standard-section standard-editorial" aria-labelledby="standard-title">
      <div className="std-top std-shell">
        <div className="std-overview">
          <div className="std-kicker"><span />Standard</div>
          <h2 id="standard-title" className="std-title">To, co ważne,<br />jest już w <em>standardzie.</em></h2>
          <p className="std-lead">Nowoczesne technologie, energooszczędne rozwiązania i dopracowane detale. W naszych domach wysoki standard nie jest dodatkiem — jest fundamentem codziennego komfortu i lepszej przyszłości.</p>
          <div className="std-highlights" aria-label="Najważniejsze elementy standardu">
            {standardHighlights.map((item) => (
              <div className="std-highlight" key={item.id}>
                <img src={assetUrl(illustrations[item.id])} alt="" width="220" height="190" loading="lazy" decoding="async" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="std-visuals" aria-label="Światło, komfort i nowoczesne technologie">
          <figure className="std-photo std-photo--living">
            <img src={assetUrl('/assets/images/standard/editorial/living.webp?v=7b18ba4478193e4b')} alt="Wizualizacja jasnego salonu z dużym przeszkleniem otwierającym dom na ogród" width="322" height="376" loading="lazy" decoding="async" />
            <div className="std-photo__headline" aria-hidden="true">Więcej światła.<br />Większy komfort.<br />Naturalnie.<span /></div>
            <figcaption><SunMedium aria-hidden="true" /><span>Duże przeszklenia otwierają<br />Twój dom na naturę.</span></figcaption>
          </figure>
          <figure className="std-photo std-photo--window">
            <img src={assetUrl('/assets/images/standard/editorial/window-detail.webp?v=a73670698b7993a1')} alt="Poglądowy przekrój stolarki trzyszybowej" width="284" height="234" loading="lazy" decoding="async" />
            <figcaption><ShieldCheck aria-hidden="true" /><span>Stolarka trzyszybowa —<br />izolacja termiczna<br />i akustyczna.</span></figcaption>
          </figure>
          <figure className="std-photo std-photo--pump">
            <img src={assetUrl('/assets/images/standard/editorial/heat-pump-detail.webp?v=35018de566061c36')} alt="Poglądowa wizualizacja pompy ciepła przy elewacji domu" width="284" height="191" loading="lazy" decoding="async" />
            <figcaption><Leaf aria-hidden="true" /><span>Nowoczesne technologie<br />dla codziennego komfortu<br />i oszczędnego ogrzewania.</span></figcaption>
          </figure>
        </div>
      </div>

      <section className="std-details" aria-labelledby="standard-details-title">
        <div className="std-shell">
          <div className="std-details__heading">
            <div>
              <div className="std-kicker"><span />W szczegółach</div>
              <h2 id="standard-details-title">Przemyślane rozwiązania<br /><em>na lata.</em></h2>
            </div>
            <p>Wysoki standard to nie tylko nowoczesne technologie,<br className="std-desktop-break" /> ale także solidna konstrukcja, staranne wykończenie<br className="std-desktop-break" /> i kompleksowe przygotowanie domu oraz otoczenia.</p>
          </div>

          <div className="std-details__grid">
            <div className="std-topics" aria-label="Szczegółowy zakres standardu deweloperskiego">
              {standardGroups.map((item) => (
                <details className="std-topic" key={item.id} id={`standard-card-${item.id}`}>
                  <summary aria-label={`${item.title} — szczegóły standardu`}>
                    <span className="std-topic__icon"><TopicIcon id={item.id} /></span>
                    <span className="std-topic__title">{item.title}</span>
                    <ArrowRight className="std-topic__arrow" aria-hidden="true" />
                    <span className="std-topic__summary">{summaries[item.id]}</span>
                  </summary>
                  <div className="std-topic__detail">
                    <p className="std-topic__lead">{item.lead}</p>
                    <p>{item.detail}</p>
                  </div>
                </details>
              ))}
            </div>

            <aside className="std-pdf" aria-labelledby="standard-download-title">
              <div className="std-pdf__copy">
                <div className="std-kicker"><span />Pełny standard</div>
                <h3 id="standard-download-title">Wszystkie materiały,<br />instalacje i zakres prac<br />w jednym dokumencie.</h3>
                <p>Pobierz szczegółowy standard PDF i poznaj dokładny zakres materiałów, technologii i prac przed zakupem.</p>
                {pdfUrl ? (
                  <a className="std-pdf__button" href={pdfUrl} download>
                    <FileText aria-hidden="true" /><span>Pobierz pełny standard PDF</span><ArrowRight aria-hidden="true" />
                  </a>
                ) : (
                  <span className="std-pdf__pending">Dokument w przygotowaniu</span>
                )}
              </div>
              <img className="std-pdf__cover" src={assetUrl('/assets/images/standard/editorial/book-cover.webp?v=35b13d2c4613b7f9')} alt="" width="190" height="288" loading="lazy" decoding="async" />
            </aside>
          </div>
          <p className="std-scope-note">Ilustracje i aranżacje mają charakter poglądowy. Przygotowanie PV nie obejmuje paneli fotowoltaicznych. Wiążący zakres wykonania określają dokumenty umowne i standard techniczny.</p>
        </div>
      </section>
    </section>
  )
}
