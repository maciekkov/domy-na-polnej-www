import { ArrowRight, Bell, Images, Instagram } from '../../components/common/Icons'
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
  const archive = entries.slice(1)

  if (!featured) return (
    <section id="dziennik" className="journal-section journal-section--placeholder" aria-labelledby="journal-title">
      <div className="shell">
        <div className="journal-section__header journal-section__header--launch">
          <div>
            <div className="section-kicker"><b>10 / 12</b><span />Dziennik budowy</div>
            <h2 id="journal-title">Zobacz, jak powstają Domy na Polnej</h2>
          </div>
          <p>Bez zdjęć zastępczych. Pierwszy wpis pojawi się po rozpoczęciu robót.</p>
        </div>

        <div className="journal-launch">
          <figure className="journal-launch__media">
            <img src={`${import.meta.env.BASE_URL}assets/images/neighborhood/plots-aerial.webp?v=1e1c177287ce686d`} alt="Rzeczywisty teren inwestycji Domy na Polnej z lotu ptaka" width="1600" height="960" loading="lazy" decoding="async" />
            <div className="journal-launch__status" aria-label="Status dziennika budowy"><span aria-hidden="true" /><small>TERAZ</small><strong>Przygotowanie inwestycji</strong></div>
            <figcaption>Rzeczywisty teren inwestycji · Grabik koło Żar</figcaption>
          </figure>

          <aside className="journal-launch__panel">
            <div className="journal-launch__index"><span>01</span><i aria-hidden="true" /></div>
            <p className="journal-launch__eyebrow">DZIENNIK STARTU</p>
            <h3>Jeden adres. Kolejne etapy. Prawdziwe zdjęcia.</h3>
            <p>Po rozpoczęciu prac będziemy publikować zdjęcia z placu budowy i krótkie raporty z postępu. Dzięki temu będzie można śledzić realizację od pierwszych robót do odbiorów.</p>
            <div className="journal-launch__signals" aria-label="Co będzie publikowane">
              <span><Bell aria-hidden="true" /> zdjęcia z placu</span>
              <span><Images aria-hidden="true" /> krótkie raporty</span>
            </div>
            <a className="button button--olive" href="https://www.instagram.com/domynapolnej/" target="_blank" rel="noreferrer"><Instagram size={17} aria-hidden="true" /> Obserwuj nas na Instagramie</a>
          </aside>

          <div className="journal-launch__track" aria-label="Jak będzie rozwijany dziennik budowy">
            <div><b>01</b><span>TERAZ</span><strong>Teren inwestycji</strong></div>
            <div><b>02</b><span>PO STARCIE ROBÓT</span><strong>Pierwsze zdjęcia</strong></div>
            <div><b>03</b><span>DALEJ</span><strong>Regularne aktualizacje</strong></div>
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
