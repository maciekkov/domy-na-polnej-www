export type GalleryCategory = 'outside' | 'inside' | 'neighborhood'
export type GalleryImage = { src: string; title: string; alt: string }
export const galleryCategories: Array<{ id: GalleryCategory; label: string }> = [{ id: 'outside', label: 'Elewacja' },{ id: 'inside', label: 'Wnętrza' },{ id: 'neighborhood', label: 'Okolica' }]
export const galleryImages: Record<GalleryCategory, GalleryImage[]> = {
  outside: [
    { src:'/assets/images/spacer-360/exterior/webp/02_front_domu_i_podjazd.webp', title:'Front domu i podjazd', alt:'Front domu z podjazdem, wejściem i ogrodem frontowym' },
    { src:'/assets/images/spacer-360/exterior/webp/05_podjazd_i_wiata.webp', title:'Podjazd i wiata', alt:'Bryła domu od strony podjazdu i wiaty' },
    { src:'/assets/images/spacer-360/exterior/webp/08_elewacja_ogrodowa.webp', title:'Elewacja ogrodowa', alt:'Tylna elewacja domu z ogrodem i tarasem' },
    { src:'/assets/images/spacer-360/exterior/webp/10_dom_od_strony_ogrodu.webp', title:'Dom od strony ogrodu', alt:'Szeroki widok domu od strony ogrodu i tarasu' },
  ],
  inside: [
    { src:'/assets/images/gallery/living.webp', title:'Strefa dzienna', alt:'Jasny salon i jadalnia w Domu na Polnej' },
    { src:'/assets/images/gallery/living-wide.webp', title:'Salon z jadalnią', alt:'Otwarta strefa dzienna z widokiem na ogród' },
    { src:'/assets/images/gallery/kitchen.webp', title:'Kuchnia', alt:'Funkcjonalna, jasna kuchnia' },
    { src:'/assets/images/gallery/bedroom.webp', title:'Sypialnia rodziców', alt:'Spokojna sypialnia rodziców' },
    { src:'/assets/images/gallery/bathroom.webp', title:'Łazienka', alt:'Łazienka w naturalnej, ciepłej kolorystyce' },
  ],
  neighborhood: [
    { src:'/assets/images/neighborhood/plots-front.webp', title:'Działki od strony lasu', alt:'Teren inwestycji Domy na Polnej od strony lasu' },
    { src:'/assets/images/neighborhood/plots-aerial.webp', title:'Działki z lotu ptaka', alt:'Widok z drona na działki inwestycji w Grabiku' },
    { src:'/assets/images/neighborhood/fields.webp', title:'Widok od strony pól', alt:'Otwarta przestrzeń i pola otaczające inwestycję' },
    { src:'/assets/images/neighborhood/forest-panorama.webp', title:'Panorama okolicy', alt:'Panoramiczny widok zielonej okolicy i lasu' },
    { src:'/assets/images/neighborhood/panorama-360-grabik.webp', title:'Panorama 360° z drona', alt:'Sferyczna panorama 360 stopni okolicy Grabika wykonana z drona' },
  ],
}
