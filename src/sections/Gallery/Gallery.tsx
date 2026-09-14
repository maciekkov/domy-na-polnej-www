import { ArrowUpRight, ChevronRight, Image as ImageIcon, Move3d, Scan } from 'lucide-react'
import { useState } from 'react'
import type { HouseId } from '../../data/houses'
import { galleryCategories, galleryImages, type GalleryCategory } from '../../data/gallery'
import { GalleryLightbox } from './GalleryLightbox'
import { PanoramaModal } from './PanoramaModal'
import { TourFrameModal } from './TourFrameModal'
import { track } from '../../lib/analytics'

type GalleryProps = { selectedHouse: HouseId }

export function Gallery({ selectedHouse }: GalleryProps) {
  const [category, setCategory] = useState<GalleryCategory>('outside')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [tourOpen, setTourOpen] = useState(false)
  const [panoramaOpen, setPanoramaOpen] = useState(false)
  const images = galleryImages[category]

  return (
    <section id="galeria" className="gallery-section" aria-labelledby="gallery-title">
      <div className="shell">
        <div className="gallery-section__top">
          <div>
            <div className="section-kicker section-kicker--dark"><b>06 / 12</b><span />Galeria + spacer 360°</div>
            <h2 id="gallery-title">Zobacz Domy na Polnej</h2>
          </div>
          <div className="gallery-tabs" role="tablist" aria-label="Kategorie galerii">
            {galleryCategories.map((item) => (
              <button key={item.id} type="button" role="tab" aria-selected={category === item.id} className={category === item.id ? 'is-active' : ''} onClick={() => setCategory(item.id)}>{item.label}</button>
            ))}
          </div>
        </div>

        <div className="editorial-gallery">
          {images.map((image, index) => (
            <button className={`gallery-tile gallery-tile--${index + 1}`} key={image.src} type="button" onClick={() => { setLightboxIndex(index); track('gallery_open', selectedHouse) }} aria-label={`Otwórz zdjęcie: ${image.title}`}>
              <img src={image.src} alt={image.alt} loading={index < 3 ? 'eager' : 'lazy'} decoding="async" />
              <span><ImageIcon /> Zobacz zdjęcie <ArrowUpRight /></span>
            </button>
          ))}
        </div>

        <div className="immersive-heading">
          <div><span>Dwa sposoby oglądania</span><h3>Wejdź do domu. Rozejrzyj się po okolicy.</h3></div>
          <p>Spacer prowadzi przez dom i działkę, a osobna fotografia sferyczna pokazuje rzeczywiste otoczenie inwestycji z perspektywy drona.</p>
        </div>

        <div className="immersive-grid">
          <article className="immersive-card immersive-card--tour">
            <img src="/assets/images/tour/living.webp" alt="Jasny salon z wyjściem na taras i ogród" loading="lazy" decoding="async" />
            <div className="immersive-card__shade" aria-hidden="true" />
            <div className="immersive-card__badge">12 kadrów</div>
            <div className="immersive-card__content">
              <Move3d aria-hidden="true" />
              <div className="eyebrow eyebrow--light">Dom i działka</div>
              <h3>Spacer 360°</h3>
              <p>Przejdź od podjazdu przez wejście i wnętrza aż do tarasu oraz ogrodu.</p>
              <button className="button button--olive" type="button" onClick={() => { setTourOpen(true); track('tour_start', selectedHouse) }}>Rozpocznij spacer <ChevronRight size={17} /></button>
              <small>Interaktywny spacer · Dom {selectedHouse}</small>
            </div>
          </article>

          <article className="immersive-card immersive-card--panorama">
            <img src="/assets/images/neighborhood/panorama-360-grabik.webp" alt="Panorama okolicy Grabika wykonana z drona" loading="lazy" decoding="async" />
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
      {tourOpen && <TourFrameModal onClose={() => setTourOpen(false)} />}
      {panoramaOpen && <PanoramaModal onClose={() => setPanoramaOpen(false)} />}
    </section>
  )
}
