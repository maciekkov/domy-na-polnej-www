export type PlanMode = 'layout' | 'zones' | 'furniture'
export type ZoneId = 'day' | 'private' | 'entry' | 'utility' | 'flex'

export type LayoutRoom = {
  id: string
  title: string
  shortTitle: string
  area: string
  zone: ZoneId
  image: string
  description: string
  benefits: Array<{ title: string; text: string }>
  paths: string[]
}

// Exact geometry of the user-supplied rzut2D.svg. Do not change these values
// independently from the base SVG asset or the interactive paths will drift.
export const PLAN_VIEWBOX = '0 0 316.17709 237.06667'
export const PLAN_WIDTH = 1195
export const PLAN_HEIGHT = 896

export const zoneLabels: Record<ZoneId, string> = {
  day: 'Strefa dzienna',
  private: 'Strefa prywatna',
  entry: 'Wejście i komunikacja',
  utility: 'Zaplecze techniczne',
  flex: 'Gabinet / elastyczna',
}

export const zoneOrder: ZoneId[] = ['day', 'private', 'entry', 'utility', 'flex']

export const layoutRooms: LayoutRoom[] = [
  {
    id: 'living', title: 'Salon + jadalnia', shortTitle: 'Salon + jadalnia', area: '29 m²', zone: 'day',
    image: '/assets/images/layout/room-living.webp',
    description: 'Otwarta strefa dzienna z wysokim sufitem i dużymi przeszkleniami prowadzącymi wprost na zachodni ogród.',
    benefits: [
      { title: 'Naturalne światło', text: 'Duże okna tarasowe od strony ogrodu' },
      { title: 'Przestrzeń dla rodziny', text: 'Wypoczynek i jadalnia w jednym centrum domu' },
      { title: 'Wyjście na taras', text: 'Płynne połączenie salonu z ogrodem' },
    ],
    paths: ['m 193.252,29.647436 0.86449,85.920604 H 111.0295 V 28.696756 Z'],
  },
  {
    id: 'kitchen', title: 'Kuchnia', shortTitle: 'Kuchnia', area: '11 m²', zone: 'day',
    image: '/assets/images/layout/room-kitchen.webp',
    description: 'Funkcjonalna kuchnia pozostaje blisko stołu i rozmów, a spiżarnia przejmuje zapasy i małe AGD.',
    benefits: [
      { title: 'Blisko jadalni', text: 'Krótka droga od blatu do stołu' },
      { title: 'Widok na salon', text: 'Kontakt z rodziną podczas gotowania' },
      { title: 'Spiżarnia obok', text: 'Zaplecze bez zabierania powierzchni blatów' },
    ],
    paths: ['m 107.95576,115.81804 h 53.79042 v 60.70633 0.72041 l -53.31017,0.072 z'],
  },
  {
    id: 'pantry', title: 'Spiżarnia', shortTitle: 'Spiżarnia', area: '', zone: 'day',
    image: '/assets/images/layout/room-kitchen.webp',
    description: 'Osobna spiżarnia porządkuje zapasy i małe AGD, pozostając bezpośrednio przy kuchni.',
    benefits: [
      { title: 'Zapasy pod ręką', text: 'Codzienne produkty w jednym miejscu' },
      { title: 'Blisko kuchni', text: 'Krótka droga między spiżarnią i blatem' },
      { title: 'Więcej porządku', text: 'Mniej rzeczy na widoku w strefie dziennej' },
    ],
    paths: ['m 72.261694,146.36331 v 31.02555 l 36.174316,-0.072 -0.23759,-30.42495 z'],
  },
  {
    id: 'bedroom', title: 'Sypialnia rodziców', shortTitle: 'Sypialnia', area: '11 m²', zone: 'private',
    image: '/assets/images/layout/room-bedroom.webp',
    description: 'Spokojna część rodziców z widokiem na ogród i własną łazienką bez przecinania strefy dziennej.',
    benefits: [
      { title: 'Prywatna strefa', text: 'Oddzielenie od pokoi dzieci i salonu' },
      { title: 'Widok na zieleń', text: 'Okno skierowane w stronę ogrodu' },
      { title: 'Łazienka master', text: 'Codzienna wygoda tuż obok sypialni' },
    ],
    paths: ['m 196.18165,90.435676 51.84587,-0.31217 v -60.22607 h -51.56407 z'],
  },
  {
    id: 'child-one', title: 'Pokój dziecięcy 1', shortTitle: 'Pokój 1', area: '12 m²', zone: 'private',
    image: '/assets/images/layout/room-child.webp',
    description: 'Ustawny pokój z miejscem na łóżko, biurko i pełnowymiarową zabudowę.',
    benefits: [
      { title: 'Dobre proporcje', text: 'Czytelne miejsce do snu, nauki i zabawy' },
      { title: 'Światło dzienne', text: 'Okno od spokojniejszej strony domu' },
      { title: 'Blisko łazienki', text: 'Wygodny codzienny układ komunikacji' },
    ],
    paths: ['m 27.239114,100.30602 h 22.61759 v -5.094054 h 20.30827 v -66.15474 h -42.24665 z'],
  },
  {
    id: 'child-two', title: 'Pokój dziecięcy 2', shortTitle: 'Pokój 2', area: '11 m²', zone: 'private',
    image: '/assets/images/layout/room-child-two.webp',
    description: 'Drugi ustawny pokój może być sypialnią dziecka, pokojem gościnnym albo spokojnym gabinetem.',
    benefits: [
      { title: 'Elastyczne przeznaczenie', text: 'Pokój dziecka, gościnny lub pracownia' },
      { title: 'Pełne umeblowanie', text: 'Miejsce na łóżko, szafę i biurko' },
      { title: 'Cicha część domu', text: 'Oddalenie od wejścia i zaplecza technicznego' },
    ],
    paths: ['M 71.964864,94.940276 H 109.08352 L 108.9163,28.807226 H 71.743274 Z'],
  },
  {
    id: 'master-bath', title: 'Łazienka przy sypialni', shortTitle: 'Łazienka master', area: '6 m²', zone: 'private',
    image: '/assets/images/layout/room-bath.webp',
    description: 'Prywatna łazienka rodziców z miejscem na wannę, umywalkę i wygodną zabudowę.',
    benefits: [
      { title: 'Bez porannej kolejki', text: 'Druga łazienka porządkuje rytm rodziny' },
      { title: 'Pełny program', text: 'Wanna, umywalka i przechowywanie' },
      { title: 'Tuż przy sypialni', text: 'Prywatność bez przechodzenia przez dom' },
    ],
    paths: ['M 247.77752,121.80291 V 93.004536 h -51.54784 v 28.662524 z'],
  },
  {
    id: 'main-bath', title: 'Łazienka główna', shortTitle: 'Łazienka', area: '4 m²', zone: 'private',
    image: '/assets/images/layout/room-bath-main.webp',
    description: 'Kompaktowa łazienka w centrum prywatnej części domu, dostępna dla dzieci i gości.',
    benefits: [
      { title: 'Centralna lokalizacja', text: 'Blisko pokoi i strefy dziennej' },
      { title: 'Druga łazienka', text: 'Większy komfort całej rodziny' },
      { title: 'Czytelny układ', text: 'Wszystko ma swoje stałe miejsce' },
    ],
    paths: ['M 106.32283,144.05801 V 118.28334 H 72.511704 v 25.58256 z'],
  },
  {
    id: 'office', title: 'Gabinet', shortTitle: 'Gabinet', area: 'ok. 10 m²', zone: 'flex',
    image: '/assets/images/layout/room-office.webp',
    description: 'Dodatkowe pomieszczenie może pełnić funkcję gabinetu, miejsca nauki, hobby albo pokoju gościnnego.',
    benefits: [
      { title: 'Dom dopasowany do Ciebie', text: 'Praca, nauka albo hobby' },
      { title: 'Osobne pomieszczenie', text: 'Możliwość zamknięcia i pracy w ciszy' },
      { title: 'Elastyczność na lata', text: 'Funkcja może zmieniać się razem z rodziną' },
    ],
    paths: ['m 27.646624,180.79201 h 42.65419 l 0.40751,-62.25867 h -42.79 z'],
  },
  {
    id: 'utility', title: 'Pomieszczenie techniczne', shortTitle: 'Techniczne', area: '6 m²', zone: 'utility',
    image: '/assets/images/layout/room-utility.webp',
    description: 'Technika, pranie i domowe zaplecze pozostają poza reprezentacyjną częścią domu.',
    benefits: [
      { title: 'Technika w jednym miejscu', text: 'Pompa ciepła i instalacje poza salonem' },
      { title: 'Strefa prania', text: 'Miejsce na pralkę, suszarkę i chemię' },
      { title: 'Porządek', text: 'Codzienne zaplecze ma własną przestrzeń' },
    ],
    paths: ['m 196.29365,157.27534 h 51.51721 v -33.6769 h -51.67723 z'],
  },
  {
    id: 'entry', title: 'Wiatrołap i komunikacja', shortTitle: 'Wejście', area: '7 m²', zone: 'entry',
    image: '/assets/images/layout/room-entry.webp',
    description: 'Wiatrołap i krótka komunikacja prowadzą do najważniejszych części domu bez marnowania powierzchni.',
    benefits: [
      { title: 'Czytelne wejście', text: 'Miejsce na kurtki, buty i zakupy' },
      { title: 'Krótkie przejścia', text: 'Więcej metrów służy pokojom, nie korytarzom' },
      { title: 'Blisko zaplecza', text: 'Wygodne wejście także od strony podjazdu' },
    ],
    paths: [
      'm 164.09951,157.02534 h 29.82487 v -38.492 h -29.63277 z',
      'M 51.962224,115.85985 V 97.317506 H 111.0295 v 18.250534 z',
    ],
  },
]
