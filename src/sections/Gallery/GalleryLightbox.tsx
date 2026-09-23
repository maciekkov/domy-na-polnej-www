import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from '../../components/common/Icons'
import { useEffect, useRef } from 'react'
import { useDialog } from '../../hooks/useDialog'
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

  useDialog(dialogRef, onClose)
  useEffect(() => {
    const preload = new Image()
    preload.src = images[(index + 1) % images.length].src
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); previous() }
      if (event.key === 'ArrowRight') { event.preventDefault(); next() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [index, images])

  return createPortal(
    <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`Galeria: ${image.title}`} ref={dialogRef}>
      <button className="gallery-lightbox__backdrop" tabIndex={-1} aria-hidden="true" type="button" onClick={onClose} aria-label="Zamknij galerię" />
      <div className="gallery-lightbox__frame">
        <img src={image.src} alt={image.alt} />
        <div className="gallery-lightbox__caption" aria-live="polite"><span>{String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span><strong>{image.title}</strong></div>
      </div>
      <button data-dialog-close className="gallery-lightbox__close" type="button" onClick={onClose} aria-label="Zamknij"><X /></button>
      <button className="gallery-lightbox__arrow gallery-lightbox__arrow--previous" type="button" onClick={previous} aria-label="Poprzednie zdjęcie"><ChevronLeft /></button>
      <button className="gallery-lightbox__arrow gallery-lightbox__arrow--next" type="button" onClick={next} aria-label="Następne zdjęcie"><ChevronRight /></button>
    </div>
  , document.body)
}
