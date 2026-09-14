export type GalleryCategory = 'outside' | 'inside' | 'neighborhood'

export type GalleryImage = {
  src: string
  title: string
  alt: string
}

export const galleryCategories: Array<{ id: GalleryCategory; label: string }> = [
  { id: 'outside', label: 'Elewacja' },
  { id: 'inside', label: 'Wnętrza' },
  { id: 'neighborhood', label: 'Okolica' },
]

export const galleryImages: Record<GalleryCategory, GalleryImage[]> = {
  outside: [
    { src: '/assets/images/gallery/front.webp', title: 'Front domu', alt: 'Frontowa elewacja Domu na Polnej z wejściem i podjazdem' },
    { src: '/assets/images/gallery/front-angle.webp', title: 'Bryła od strony podjazdu', alt: 'Dom na Polnej widziany pod kątem od strony podjazdu' },
    { src: '/assets/images/gallery/rear.webp', title: 'Elewacja ogrodowa', alt: 'Tylna elewacja domu z dużymi przeszkleniami' },
    { src: '/assets/images/gallery/panorama.webp', title: 'Dom w otoczeniu', alt: 'Dom na Polnej na tle zielonego otoczenia' },
    { src: '/assets/images/gallery/garden-house.webp', title: 'Dom od strony ogrodu', alt: 'Widok domu i tarasu od strony ogrodu' },
  ],
  inside: [
    { src: '/assets/images/gallery/living.webp', title: 'Strefa dzienna', alt: 'Jasny salon i jadalnia w Domu na Polnej' },
    { src: '/assets/images/gallery/living-wide.webp', title: 'Salon z jadalnią', alt: 'Otwarta strefa dzienna z widokiem na ogród' },
    { src: '/assets/images/gallery/kitchen.webp', title: 'Kuchnia', alt: 'Funkcjonalna, jasna kuchnia' },
    { src: '/assets/images/gallery/bedroom.webp', title: 'Sypialnia rodziców', alt: 'Spokojna sypialnia rodziców' },
    { src: '/assets/images/gallery/bathroom.webp', title: 'Łazienka', alt: 'Łazienka w naturalnej, ciepłej kolorystyce' },
  ],
  neighborhood: [
    { src: '/assets/images/neighborhood/plots-front.webp', title: 'Działki od strony lasu', alt: 'Teren inwestycji Domy na Polnej od strony lasu' },
    { src: '/assets/images/neighborhood/plots-aerial.webp', title: 'Działki z lotu ptaka', alt: 'Widok z drona na działki inwestycji w Grabiku' },
    { src: '/assets/images/neighborhood/fields.webp', title: 'Widok od strony pól', alt: 'Otwarta przestrzeń i pola otaczające inwestycję' },
    { src: '/assets/images/neighborhood/forest-panorama.webp', title: 'Panorama okolicy', alt: 'Panoramiczny widok zielonej okolicy i lasu' },
    { src: '/assets/images/neighborhood/panorama-360-grabik.webp', title: 'Panorama 360° z drona', alt: 'Sferyczna panorama 360 stopni okolicy Grabika wykonana z drona' },
  ],
}
