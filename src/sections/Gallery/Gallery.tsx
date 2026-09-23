import { ArrowUpRight, ChevronRight, Image as ImageIcon, Move3d, Scan } from '../../components/common/Icons'
import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { HouseSelection } from '../../data/houses'
import { galleryCategories, galleryImages, type GalleryCategory } from '../../data/gallery'
import { GalleryLightbox } from './GalleryLightbox'
import { PanoramaModal } from './PanoramaModal'
import { TourChoiceModal } from './TourChoiceModal'
import { TourFrameModal } from './TourFrameModal'
import { track } from '../../lib/analytics'
import { tours, type TourMode } from '../../data/tours'
type GalleryProps = { selectedHouse: HouseSelection }


export function Gallery({ selectedHouse }: GalleryProps) {
  const [category, setCategory] = useState<GalleryCategory>('outside')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [tourPickerOpen, setTourPickerOpen] = useState(false)
  const [tourMode, setTourMode] = useState<TourMode | null>(null)
  const [panoramaOpen, setPanoramaOpen] = useState(false)
  const images = galleryImages[category]

  const openTour = (mode: TourMode) => {
    setTourPickerOpen(false)
    setTourMode(mode)
    track('tour_start', selectedHouse === 'unknown' ? undefined : selectedHouse, { tourMode: mode })
  }

  const onGalleryTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const lastIndex = galleryCategories.length - 1
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? lastIndex : (index + (event.key === 'ArrowRight' ? 1 : -1) + galleryCategories.length) % galleryCategories.length
    const next = galleryCategories[nextIndex]
    setCategory(next.id)
    document.getElementById(`gallery-tab-${next.id}`)?.focus()
  }

  return (
    <section id="galeria" className="gallery-section" aria-labelledby="gallery-title">
      <div className="shell">
        <div className="gallery-section__top">
          <div>
            <div className="section-kicker section-kicker--dark"><b>06 / 12</b><span />Galeria + spacer 360°</div>
            <h2 id="gallery-title">Zobacz Domy na Polnej</h2>
          </div>
          <div className="gallery-tabs" role="tablist" aria-label="Kategorie galerii">
            {galleryCategories.map((item, index) => (
              <button
                key={item.id}
                id={`gallery-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={category === item.id}
                aria-controls="gallery-panel"
                tabIndex={category === item.id ? 0 : -1}
                className={category === item.id ? 'is-active' : ''}
                onClick={() => setCategory(item.id)}
                onKeyDown={(event) => onGalleryTabKeyDown(event, index)}
              >{item.label}</button>
            ))}
          </div>
        </div>

        <div id="gallery-panel" role="tabpanel" aria-labelledby={`gallery-tab-${category}`} className={`editorial-gallery ${images.length === 4 ? 'editorial-gallery--four' : ''}`.trim()}>
          {images.map((image, index) => (
            <button className={`gallery-tile gallery-tile--${index + 1}`} key={image.src} type="button" onClick={() => { setLightboxIndex(index); track('gallery_open', selectedHouse) }} aria-label={`Otwórz zdjęcie: ${image.title}`}>
              <img src={image.src} alt={image.alt} loading="lazy" width="1672" height="941" decoding="async" />
              <span><ImageIcon /> Zobacz zdjęcie <ArrowUpRight /></span>
            </button>
          ))}
        </div>

        <p className="gallery__disclaimer">Wizualizacje pokazują przykładową aranżację. Wykończenie wnętrz, wyposażenie i zieleń nie określają zakresu ceny. Zdjęcia okolicy przedstawiają rzeczywisty teren.</p>
        <div id="spacer-360" className="immersive-heading" style={{ scrollMarginTop: '88px' }}>
          <div><span>Dwa sposoby oglądania</span><h3>Wejdź w Spacer 360 albo obejrzyj panoramę okolicy.</h3></div>
          <p>Zacznij od otwartego wejścia i poznaj wnętrze domu albo wybierz trasę wokół działki. Osobno możesz uruchomić prawdziwą panoramę 360° z drona.</p>
        </div>

        <div className="immersive-grid">
          <article className="immersive-card immersive-card--tour">
            <img src="/assets/images/spacer-360/exterior/webp/08_elewacja_ogrodowa.webp?v=a20526b4ebd0cc9b" alt="Elewacja ogrodowa domu i ogród w Spacerze 360" loading="lazy" decoding="async" />
            <div className="immersive-card__shade" aria-hidden="true" />
            <div className="immersive-card__badge">{tours.exterior.count} na zewnątrz · {tours.interior.count} we wnętrzu</div>
            <div className="immersive-card__content">
              <Move3d aria-hidden="true" />
              <div className="eyebrow eyebrow--light">Dom i działka</div>
              <h3>Spacer 360°</h3>
              <p>Wejdź do domu i poznaj salon, kuchnię, pokoje, łazienki oraz domowe zaplecze. Przez taras przejdź do spaceru po ogrodzie.</p>
              <button id="choose-tour" className="button button--olive" type="button" onClick={() => setTourPickerOpen(true)}>Wybierz spacer <ChevronRight size={17} /></button>
              <small>Interaktywny spacer · {selectedHouse === 'unknown' ? 'przykładowy układ domu' : `Dom ${selectedHouse}`}</small>
            </div>
          </article>

          <article className="immersive-card immersive-card--panorama">
            <img src="/assets/images/responsive/panorama-preview.webp?v=8807f8911f0a6449" alt="Panorama okolicy Grabika wykonana z drona" loading="lazy" decoding="async" />
            <div className="immersive-card__shade" aria-hidden="true" />
            <div className="immersive-card__orbit" aria-hidden="true"><span>360°</span></div>
            <div className="immersive-card__content">
              <Scan aria-hidden="true" />
              <div className="eyebrow eyebrow--light">Prawdziwe otoczenie</div>
              <h3>Panorama z drona</h3>
              <p>Obejrzyj Grabik, otwarte łąki i linię lasu w rzeczywistej fotografii sferycznej.</p>
              <button className="button button--outline" type="button" onClick={() => { setPanoramaOpen(true); track('gallery_open', selectedHouse) }}>Otwórz panoramę <ChevronRight size={17} /></button>
              <small>Fotografia sferyczna · 4096 × 2048 px</small>
            </div>
          </article>
        </div>
      </div>

      {lightboxIndex !== null && <GalleryLightbox images={images} index={lightboxIndex} onIndex={setLightboxIndex} onClose={() => setLightboxIndex(null)} />}
      {tourPickerOpen && <TourChoiceModal onClose={() => setTourPickerOpen(false)} onChooseExterior={() => openTour('exterior')} onChooseInterior={() => openTour('interior')} />}
      {tourMode && <TourFrameModal houseCode={selectedHouse} onClose={() => setTourMode(null)} onEngaged={() => track('tour_engaged', selectedHouse === 'unknown' ? undefined : selectedHouse, { tourMode })} src={tours[tourMode].src} title={tours[tourMode].title} />}
      {panoramaOpen && <PanoramaModal onClose={() => setPanoramaOpen(false)} />}
    </section>
  )
}
