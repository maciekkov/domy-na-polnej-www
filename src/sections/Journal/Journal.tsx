import { ArrowRight, Instagram } from '../../components/common/Icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { JournalEntry } from '../../data/journal'
import { useSiteData } from '../../data/runtime/SiteDataProvider'
import { GalleryLightbox } from '../Gallery/GalleryLightbox'

const previews = [
  { id: 'miejsce', title: 'Tutaj zaczyna się historia domu', text: 'Zajrzyj na teren inwestycji w Grabiku. To tutaj będziemy pokazywać, jak Domy na Polnej nabierają kształtu.', image: '/assets/images/neighborhood/plots-aerial.webp?v=1e1c177287ce686d', alt: 'Teren inwestycji w Grabiku z lotu ptaka', label: 'Poznaj miejsce', caption: 'Rzeczywisty teren inwestycji', href: '#lokalizacja', cta: 'Poznaj lokalizację' },
  { id: 'pierwsze-zdjecia', title: 'Pierwsze zdjęcia z budowy — już wkrótce', text: 'Po rozpoczęciu robót pojawią się tu zdjęcia z placu budowy. Będziesz mógł śledzić zmiany, krok po kroku.', image: '/assets/images/neighborhood/plots-front.webp?v=0039f4e4dda29388', alt: 'Widok działek przed rozpoczęciem robót', label: 'Zapowiedź', caption: 'Teren przed rozpoczęciem robót', href: '#harmonogram', cta: 'Zobacz planowane etapy' },
  { id: 'przedsprzedaz', title: 'Bądź z nami od pierwszego etapu', text: 'Przygotowujemy przedsprzedaż przed rozpoczęciem budowy. Zapisz się, aby dostać wiadomość o starcie i ofercie promocyjnej.', image: '/assets/images/responsive/hero-3-640.webp?v=814af869f09ff8ab', alt: 'Wizualizacja domu od strony ogrodu', label: 'Przed nami', caption: 'Wizualizacja', href: '#przedsprzedaz', cta: 'Powiadom mnie o starcie' },
  { id: 'kolejne-etapy', title: 'Od pierwszych prac do własnego ogrodu', text: 'Fundamenty, ściany, dach i wykończenie. W dzienniku będziemy publikować relacje z kolejnych etapów realizacji.', image: '/assets/images/neighborhood/fields.webp?v=24b8be2341f1952f', alt: 'Otoczenie inwestycji w Grabiku', label: 'Zapowiedź relacji', caption: 'Rzeczywiste otoczenie inwestycji', href: '#harmonogram', cta: 'Poznaj harmonogram' },
]

export function Journal({ entries }: { entries: JournalEntry[] }) {
  const { data } = useSiteData()
  const [galleryEntry, setGalleryEntry] = useState<JournalEntry | null>(null)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const rail = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ first: 0, end: false })
  const visiblePreviews = previews.filter(item => item.id !== 'przedsprzedaz' || data.salesStage === 'prelaunch')
  const count = entries.length || visiblePreviews.length
  const updatePosition = useCallback(() => {
    const el = rail.current
    if (!el) return
    const stride = (el.firstElementChild as HTMLElement | null)?.getBoundingClientRect().width ?? 1
    setPosition({ first: Math.round(el.scrollLeft / (stride + 24)), end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 3 })
  }, [])
  useEffect(() => {
    updatePosition()
    const observer = new ResizeObserver(updatePosition)
    if (rail.current) observer.observe(rail.current)
    return () => observer.disconnect()
  }, [count, updatePosition])
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('wpis')
    if (id) setGalleryEntry(entries.find(item => item.id === id) ?? null)
  }, [entries])
  const openGallery = (entry: JournalEntry) => {
    setGalleryEntry(entry); setGalleryIndex(0)
    const params = new URLSearchParams(window.location.search); params.set('wpis', entry.id)
    window.history.replaceState({}, '', `${window.location.pathname}?${params}#dziennik`)
  }
  const closeGallery = () => {
    setGalleryEntry(null)
    const params = new URLSearchParams(window.location.search); params.delete('wpis')
    window.history.replaceState({}, '', `${window.location.pathname}${params.size ? `?${params}` : ''}#dziennik`)
  }
  const move = (direction: number) => {
    const el = rail.current
    if (!el) return
    const card = el.firstElementChild as HTMLElement | null
    el.scrollBy({ left: direction * ((card?.getBoundingClientRect().width ?? 320) + 24), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  return <section id="dziennik" className="journal-section journal-section--carousel" aria-labelledby="journal-title">
    <div className="shell">
      <header className="journal-carousel__header">
        <div><div className="section-kicker"><span />Dziennik budowy</div><h2 id="journal-title">Dobre miejsce.<br /><em>Historia, która się zaczyna.</em></h2>
          <p>{entries.length ? 'Aktualności, zdjęcia i kolejne etapy. Sprawdź, co dzieje się na Polnej.' : 'Tutaj będziemy dzielić się aktualnościami z Polnej. Zobacz, co przed nami.'}</p></div>
        <div className="journal-carousel__controls" aria-label="Przewijanie aktualności">
          <button type="button" aria-label="Poprzednie aktualności" aria-controls="aktualnosci-karuzela" disabled={position.first === 0} onClick={() => move(-1)}><ArrowRight style={{ transform: 'rotate(180deg)' }} aria-hidden="true" /></button>
          <button type="button" aria-label="Następne aktualności" aria-controls="aktualnosci-karuzela" disabled={position.end} onClick={() => move(1)}><ArrowRight aria-hidden="true" /></button>
        </div>
      </header>
      {!entries.length && <p className="journal-carousel__notice">Zapowiedzi publikacji — pierwsze relacje z budowy pojawią się po rozpoczęciu robót.</p>}
      <div id="aktualnosci-karuzela" className="journal-carousel__rail" ref={rail} onScroll={updatePosition} role="region" aria-roledescription="karuzela" aria-label="Aktualności z Polnej" tabIndex={0} onKeyDown={event => {
        if (event.target === event.currentTarget && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1) }
      }}>
        {entries.length ? entries.map(entry => <article className="news-card" id={`wpis-${entry.id}`} key={entry.id}>
          <button className="news-card__image" type="button" onClick={() => openGallery(entry)} aria-label={`Otwórz galerię: ${entry.title}`}><img src={entry.cover} alt={entry.coverAlt} width="1200" height="720" loading="lazy" /></button>
          <div className="news-card__body"><time>{entry.date}</time><h3>{entry.title}</h3><p>{entry.description}</p><button type="button" className="text-link" onClick={() => openGallery(entry)}>Zobacz zdjęcia <ArrowRight size={17} /></button></div>
        </article>) : visiblePreviews.map(item => <article className="news-card" key={item.id}>
          <div className="news-card__image"><img src={item.image} alt={item.alt} width="1200" height="720" loading="lazy" /><span>{item.caption}</span></div>
          <div className="news-card__body"><span className="news-card__label">{item.label}</span><h3>{item.title}</h3><p>{item.text}</p><a className="text-link" href={item.href}>{item.cta} <ArrowRight size={17} /></a></div>
        </article>)}
      </div>
      <div className="journal-carousel__progress"><span>Przesuń, aby zobaczyć więcej</span><span aria-live="polite">{Math.min(position.first + 1, count)} / {count}</span></div>
      {data.contact.instagramHref && <aside className="journal-instagram">
        <span className="journal-instagram__icon"><Instagram aria-hidden="true" /></span>
        <div><h3>Polna na co dzień. Także na Instagramie.</h3><p>Krótkie relacje, zdjęcia i kulisy inwestycji. Obserwuj nas i bądź bliżej tego, co powstaje.</p></div>
        <a className="button button--outline" href={data.contact.instagramHref} target="_blank" rel="noreferrer">Obserwuj na Instagramie <ArrowRight size={17} /></a>
      </aside>}
    </div>
    {galleryEntry && <GalleryLightbox images={galleryEntry.photos} index={galleryIndex} onIndex={setGalleryIndex} onClose={closeGallery} />}
  </section>
}
