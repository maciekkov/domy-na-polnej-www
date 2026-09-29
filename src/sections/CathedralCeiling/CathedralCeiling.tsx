const livingRoomImage = '/assets/images/spacer-360/interior/webp/int11c-idz-do-jadalni.webp?v=ebd95fd4d4eaacba'

type GardenPointKind = 'nature' | 'light' | 'privacy'

function GardenPointIcon({ kind }: { kind: GardenPointKind }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
      {kind === 'nature' && <>
        <path d="M12 34.5C22.8 33 31.8 23.6 38 9.5 24.4 10.6 14.6 18.4 12 34.5Z" />
        <path d="M14.5 32.5c7-5.6 13-10.4 18-14.8M22 25.8l-.8-7.2M25.4 23l6.1.7" />
      </>}
      {kind === 'light' && <>
        <circle cx="24" cy="24" r="8.2" />
        <path d="M24 6v7M24 35v7M6 24h7M35 24h7M11.3 11.3l5 5M31.7 31.7l5 5M36.7 11.3l-5 5M16.3 31.7l-5 5" />
      </>}
      {kind === 'privacy' && <>
        <path d="M24 6.5 14 20h5.5l-8.5 12h26l-8.5-12H34L24 6.5Z" />
        <path d="M24 32v8M17.5 40h13" />
      </>}
    </svg>
  )
}

// RC36: one quiet silhouette for the photograph, shared by the clip and both hairlines.
const photoContour = 'M.185,.035 C.073,.045 .010,.13 .018,.32 C.023,.47 .051,.65 .078,.78 C.106,.921 .155,.956 .282,.962 C.495,.977 .738,.964 .894,.93 C.945,.917 .98,.89 1,.865 V.036 C.74,.008 .445,.01 .185,.035 Z'
// Ribbon coordinates use a 1648 × 200 design space. The left tip is intentionally thin;
// the four text groups sit in the wide, right-hand part. Neither line is a CSS border.
const ribbonTop = 'M0 82 C210 104 392 66 592 43 C800 19 1090 75 1430 39 C1530 31 1595 18 1648 0'
const ribbonBottom = 'M0 91 C319 101 555 176 819 187 C1020 197 1300 188 1648 169'
const ribbonSurface = `${ribbonTop} L1648 169 C1300 188 1020 197 819 187 C555 176 319 101 0 91 Z`

export function CathedralCeiling() {
  return (
    <section className="cathedral-ceiling cathedral-ceiling--premium" id="wysoki-sufit" aria-labelledby="cathedral-ceiling-title">
      <svg className="cathedral-premium__clip-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="cathedral-green-clip" clipPathUnits="objectBoundingBox">
            <path d="M0,0 C.15,.06 .295,.055 .446,.027 C.414,.151 .394,.292 .398,.435 C.405,.598 .405,.726 .371,.893 C.358,.96 .345,.981 .327,.99 C.19,1.036 .079,1.015 0,.973 Z" />
          </clipPath>
          <clipPath id="cathedral-mobile-intro-clip" clipPathUnits="objectBoundingBox"><path d="M0,0 C.28,.027 .68,.027 1,.002 V1 H0 Z" /></clipPath>
          <clipPath id="cathedral-photo-clip" clipPathUnits="objectBoundingBox"><path d={photoContour} /></clipPath>
        </defs>
      </svg>

      <div className="cathedral-premium__canvas">
        <div className="cathedral-premium__green" aria-hidden="true"><span className="cathedral-premium__green-texture" /></div>
        <div className="cathedral-premium__intro">
          <div className="cathedral-premium__eyebrow"><span />Architektura przestrzeni</div>
          <h2 id="cathedral-ceiling-title"><span>Wysokość,</span><span>która nadaje <em>charakter.</em></span></h2>
          <p>Sufit katedralny o wysokości do 5,82 m nadaje otwartej strefie dziennej wyjątkową przestronność. Salon, jadalnia i kuchnia tworzą jedną, spójną całość.</p>
          <div className="cathedral-premium__metric" aria-label="Sufit katedralny o wysokości do 5,82 metra">
            <div className="cathedral-premium__value"><span>Do</span><strong>5,82<small> m</small></strong></div>
            <span className="cathedral-premium__metric-label">Sufit katedralny</span>
          </div>
        </div>
        <div className="cathedral-premium__visual-shell">
          <svg className="cathedral-premium__outline cathedral-premium__outline--outer" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d={photoContour} /></svg>
          <svg className="cathedral-premium__outline cathedral-premium__outline--inner" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d={photoContour} /></svg>
          <figure className="cathedral-premium__photo">
            <img src={livingRoomImage} width="1672" height="941" loading="lazy" decoding="async" alt="Wizualizacja otwartej strefy dziennej z salonem, jadalnią i kuchnią" />
            <span className="cathedral-premium__photo-foliage" aria-hidden="true" />
            <span className="cathedral-premium__photo-title">Przestrzeń<br />w której dobrze<br />się żyje<i aria-hidden="true" /></span>
            <figcaption>Wizualizacja przykładowej aranżacji wnętrza</figcaption>
          </figure>
        </div>
      </div>

      <div className="cathedral-premium__garden" aria-labelledby="cathedral-garden-title">
        <svg className="cathedral-premium__ribbon" viewBox="0 0 1648 200" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="cathedral-ribbon-paper" x1="0" y1="0" x2="1" y2=".6">
              <stop stopColor="#f2ebdc" /><stop offset=".48" stopColor="#faf8f2" /><stop offset="1" stopColor="#f6f3eb" />
            </linearGradient>
            <clipPath id="cathedral-ribbon-clip"><path d={ribbonSurface} /></clipPath>
          </defs>
          <path d={ribbonSurface} fill="url(#cathedral-ribbon-paper)" />
          <image href="/assets/images/decor/ivory-wallpaper.webp?v=afc1af4a26210ba2" width="1648" height="200" preserveAspectRatio="xMidYMid slice" clipPath="url(#cathedral-ribbon-clip)" opacity=".09" />
          <path className="cathedral-premium__ribbon-line cathedral-premium__ribbon-line--top" d={ribbonTop} />
          <path className="cathedral-premium__ribbon-line cathedral-premium__ribbon-line--bottom" d={ribbonBottom} />
        </svg>
        <div className="cathedral-premium__garden-inner">
          <div className="cathedral-premium__garden-copy">
            <h3 id="cathedral-garden-title">Własna działka.<br />Ogród za tarasem.</h3>
            <p className="cathedral-premium__garden-description">Każdy z pięciu domów ma własną działkę; ogród jest naturalnym przedłużeniem strefy dziennej.</p>
          </div>
          <div className="cathedral-premium__garden-points" aria-label="Najważniejsze cechy prywatnej przestrzeni">
            <div><span className="cathedral-premium__point-icon"><GardenPointIcon kind="nature" /></span><span>Naturalne<br />przedłużenie domu</span></div>
            <div><span className="cathedral-premium__point-icon"><GardenPointIcon kind="light" /></span><span>Więcej światła<br />i przestrzeni</span></div>
            <div><span className="cathedral-premium__point-icon"><GardenPointIcon kind="privacy" /></span><span>Prywatność<br />na co dzień</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}
