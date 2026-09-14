import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { GalleryImage } from '../../data/gallery'

type GalleryLightboxProps = {
  images: GalleryImage[]
  index: number
  onIndex: (index: number) => void
  onClose: () => void
}

export function GalleryLightbox({ images, index, onIndex, onClose }: GalleryLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const image = images[index]
  const previous = () => onIndex((index - 1 + images.length) % images.length)
  const next = () => onIndex((index + 1) % images.length)

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    document.body.classList.add('modal-open')
    const preload = new Image()
    preload.src = images[(index + 1) % images.length].src

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') previous()
      if (event.key === 'ArrowRight') next()
      if (event.key === 'Tab' && dialogRef.current) {
        const controls = [...dialogRef.current.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')].filter((element) => !element.hasAttribute('disabled'))
        if (!controls.length) return
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('modal-open')
      document.removeEventListener('keydown', onKeyDown)
      previousFocus?.focus()
    }
  }, [index, images, onClose])

  return (
    <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`Galeria: ${image.title}`} ref={dialogRef}>
      <button className="gallery-lightbox__backdrop" type="button" onClick={onClose} aria-label="Zamknij galerię" />
      <div className="gallery-lightbox__frame">
        <img src={image.src} alt={image.alt} />
        <div className="gallery-lightbox__caption"><span>{String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span><strong>{image.title}</strong></div>
      </div>
      <button className="gallery-lightbox__close" type="button" onClick={onClose} aria-label="Zamknij" autoFocus><X /></button>
      <button className="gallery-lightbox__arrow gallery-lightbox__arrow--previous" type="button" onClick={previous} aria-label="Poprzednie zdjęcie"><ChevronLeft /></button>
      <button className="gallery-lightbox__arrow gallery-lightbox__arrow--next" type="button" onClick={next} aria-label="Następne zdjęcie"><ChevronRight /></button>
    </div>
  )
}
