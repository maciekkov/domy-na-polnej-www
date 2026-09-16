import { ArrowRight, Bell, Images, Instagram } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { JournalEntry } from '../../data/journal'
import { GalleryLightbox } from '../Gallery/GalleryLightbox'

function photoLabel(count: number) {
  const last = count % 10
  const lastTwo = count % 100
  return `${count} ${last === 1 && lastTwo !== 11 ? 'zdjęcie' : last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14) ? 'zdjęcia' : 'zdjęć'}`
}

function JournalCard({ entry, onOpen }: { entry: JournalEntry; onOpen: (entry: JournalEntry) => void }) {
  return (
    <article id={`wpis-${entry.id}`} className="journal-card">
      <button className="journal-card__image" type="button" onClick={() => onOpen(entry)} aria-label={`Otwórz galerię: ${entry.title}`}>
        <img src={entry.cover} alt={entry.coverAlt} width="1200" height="720" loading="lazy" decoding="async" />
      </button>
      <div className="journal-card__body">
        <time>{entry.date}</time>
        <h3>{entry.title}</h3>
        <p>{entry.description}</p>
        <button className="journal-card__link" type="button" onClick={() => onOpen(entry)}>Zobacz zdjęcia <ArrowRight size={15} aria-hidden="true" /></button>
      </div>
    </article>
  )
}

export function Journal({ entries }: { entries: JournalEntry[] }) {
  const [galleryEntry, setGalleryEntry] = useState<JournalEntry | null>(null)
  const [galleryIndex, setGalleryIndex] = useState(0)

  useEffect(() => {
    const entryId = new URLSearchParams(window.location.search).get('wpis')
    if (!entryId) return
    const entry = entries.find((item) => item.id === entryId)
    if (entry) setGalleryEntry(entry)
  }, [entries])

  const openGallery = useCallback((entry: JournalEntry) => {
    setGalleryEntry(entry)
    setGalleryIndex(0)
    const params = new URLSearchParams(window.location.search)
    params.set('wpis', entry.id)
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}#dziennik`)
  }, [])

  const closeGallery = useCallback(() => {
    setGalleryEntry(null)
    const params = new URLSearchParams(window.location.search)
    params.delete('wpis')
    const query = params.toString()
    window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}#dziennik`)
  }, [])

  const featured = entries[0]
  const archive = entries.slice(1, 4)

  if (!featured) return (
    <section id="dziennik" className="journal-section journal-section--placeholder" aria-labelledby="journal-title">
      <div className="shell">
        <div className="journal-section__header">
          <div><div className="section-kicker"><b>10 / 12</b><span />Dziennik budowy</div><h2 id="journal-title">Zobacz, jak powstają Domy na Polnej</h2></div>
        </div>
        <div className="journal-placeholder">
          <figure className="journal-placeholder__visual">
            <img src={`${import.meta.env.BASE_URL}assets/images/neighborhood/plots-aerial.webp`} alt="Teren inwestycji Domy na Polnej z lotu ptaka" width="1600" height="960" loading="lazy" decoding="async" />
            <figcaption><Bell aria-hidden="true" /><span><strong>Pierwsze aktualności po rozpoczęciu budowy</strong><small>Tu pokażemy prawdziwy postęp prac — bez zdjęć zastępczych.</small></span></figcaption>
          </figure>
          <div className="journal-placeholder__content">
            <p className="journal-placeholder__eyebrow">BĄDŹ NA BIEŻĄCO</p>
            <h3>Budowa jeszcze przed nami.<br />Zostań z nami od pierwszego dnia.</h3>
            <p>Gdy ruszą prace, pojawią się tu regularne zdjęcia i krótkie raporty z placu budowy. Aktualności będziemy publikować również na Instagramie.</p>
            <a className="button button--olive" href="https://www.instagram.com/domynapolnej/" target="_blank" rel="noreferrer"><Instagram size={17} aria-hidden="true" /> Obserwuj nas na Instagramie</a>
          </div>
        </div>
      </div>
    </section>
  )

  return (
    <section id="dziennik" className="journal-section" aria-labelledby="journal-title">
      <div className="shell">
        <div className="journal-section__header">
          <div>
            <div className="section-kicker"><b>10 / 12</b><span />Dziennik budowy</div>
            <h2 id="journal-title">Zobacz, jak powstają Domy na Polnej</h2>
          </div>
          <a href="#archiwum-dziennika">Zobacz cały dziennik <ArrowRight size={17} aria-hidden="true" /></a>
        </div>

        <article className="journal-featured">
          <button className="journal-featured__image" type="button" onClick={() => openGallery(featured)} aria-label={`Otwórz galerię: ${featured.title}`}>
            <img src={featured.cover} alt={featured.coverAlt} width="1600" height="960" loading="lazy" decoding="async" />
            <span><Images aria-hidden="true" /> {photoLabel(featured.photoCount)}</span>
          </button>
          <div className="journal-featured__body">
            <time>{featured.date}</time>
            <h3>{featured.title}</h3>
            <p>{featured.description}</p>
            <div className="journal-featured__meta"><Images aria-hidden="true" /><span>{photoLabel(featured.photoCount)}</span></div>
            <button className="button button--olive" type="button" onClick={() => openGallery(featured)}>Zobacz galerię <ArrowRight size={17} aria-hidden="true" /></button>
          </div>
        </article>

        <div id="archiwum-dziennika" className="journal-archive">
          {archive.map((entry) => <JournalCard key={entry.id} entry={entry} onOpen={openGallery} />)}
        </div>
      </div>

      {galleryEntry && <GalleryLightbox images={galleryEntry.photos} index={galleryIndex} onIndex={setGalleryIndex} onClose={closeGallery} />}
    </section>
  )
}
