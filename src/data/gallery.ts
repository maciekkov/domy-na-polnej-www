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
    {
      src: '/assets/images/spacer-360/exterior/webp/02_front_domu_i_podjazd.webp?v=eac5c68a6f9190ac',
      title: 'Front domu i podjazd',
      alt: 'Front domu z podjazdem, wejściem i ogrodem frontowym',
    },
    {
      src: '/assets/images/spacer-360/exterior/webp/05_podjazd_i_wiata.webp?v=3e8df6a9456f3f09',
      title: 'Podjazd i wiata',
      alt: 'Bryła domu od strony podjazdu i wiaty',
    },
    {
      src: '/assets/images/spacer-360/exterior/webp/08_elewacja_ogrodowa.webp?v=a20526b4ebd0cc9b',
      title: 'Elewacja ogrodowa',
      alt: 'Tylna elewacja domu z ogrodem i tarasem',
    },
    {
      src: '/assets/images/spacer-360/exterior/webp/10_dom_od_strony_ogrodu.webp?v=3d050a9fe333ba1a',
      title: 'Dom od strony ogrodu',
      alt: 'Szeroki widok domu od strony ogrodu i tarasu',
    },
  ],
  inside: [
    { src: '/assets/images/spacer-360/interior/webp/int18-salon-wysoki-sufit.webp?v=89ef48e750b4a615', title: 'Salon i jadalnia', alt: 'Otwarta strefa dzienna z wysokim sufitem i widokiem na ogród' },
    { src: '/assets/images/spacer-360/interior/webp/int05-kuchnia-barek.webp?v=d06346667d18e94d', title: 'Kuchnia', alt: 'Jasna kuchnia z barkiem i zabudową w Domu na Polnej' },
    { src: '/assets/images/spacer-360/interior/webp/int11b-sypialnia-ogrod.webp?v=0647d63f199d58eb', title: 'Sypialnia rodziców', alt: 'Sypialnia rodziców z widokiem na ogród' },
    { src: '/assets/images/spacer-360/interior/webp/int10b-pokoj-mlodziezowy-druga-strona.webp?v=5b44d221420480ea', title: 'Pokój młodzieżowy', alt: 'Pokój młodzieżowy z biurkiem, łóżkiem i zabudową' },
    { src: '/assets/images/spacer-360/interior/webp/int13-lazienka-ogolna-wejscie.webp?v=ffc2569492b752d4', title: 'Łazienka', alt: 'Łazienka ogólna w ciepłej, naturalnej kolorystyce' },
  ],
  neighborhood: [
    { src: '/assets/images/neighborhood/plots-front.webp?v=0039f4e4dda29388', title: 'Działki od strony lasu', alt: 'Teren inwestycji Domy na Polnej od strony lasu' },
    { src: '/assets/images/neighborhood/plots-aerial.webp?v=1e1c177287ce686d', title: 'Działki z lotu ptaka', alt: 'Widok z drona na działki inwestycji w Grabiku' },
    { src: '/assets/images/neighborhood/fields.webp?v=24b8be2341f1952f', title: 'Widok od strony pól', alt: 'Otwarta przestrzeń i pola otaczające inwestycję' },
    { src: '/assets/images/neighborhood/forest-panorama.webp?v=66a5cc20b925ff3b', title: 'Panorama okolicy', alt: 'Panoramiczny widok zielonej okolicy i lasu' },
    { src: '/assets/images/neighborhood/panorama-360-grabik.webp?v=c7a1986872c74640', title: 'Panorama 360° z drona', alt: 'Sferyczna panorama 360 stopni okolicy Grabika wykonana z drona' },
  ],
}
