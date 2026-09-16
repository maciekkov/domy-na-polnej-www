export type TeamMember = {
  id: 'maciej-kowalski' | 'mateusz-kempinski' | 'malgorzata-rusiniak'
  name: string
  role: string
  statement: string
  image?: string
  imageAlt?: string
  imagePosition?: string
  brandGraphic?: string
  brandGraphicAlt?: string
  brandLogo?: string
  website?: string
}

export const teamMembers: TeamMember[] = [
  {
    id: 'maciej-kowalski',
    name: 'Maciej Kowalski',
    role: 'Inwestor i koordynator',
    statement: 'Koordynuje proces inwestycyjny, pilnuje kolejności decyzji, terminów i odpowiedzialności.',
    image: '/assets/images/team/maciej-kowalski.webp',
    imageAlt: 'Maciej Kowalski — inwestor i koordynator procesu inwestycyjnego Domy na Polnej',
    imagePosition: '50% 32%',
  },
  {
    id: 'mateusz-kempinski',
    name: 'Mateusz Kempiński',
    role: 'Kierownik budowy',
    statement: 'Odpowiada za prowadzenie robót, koordynację ekip oraz zgodność wykonania z dokumentacją.',
    image: '/assets/images/team/mateusz-kempinski-site-manager-v108.webp',
    imageAlt: 'Mateusz Kempiński — kierownik budowy Domy na Polnej',
    imagePosition: '50% 19%',
  },
  {
    id: 'malgorzata-rusiniak',
    name: 'Małgorzata Rusiniak',
    role: 'Architekt · MR Atelier',
    statement: 'Odpowiada za projekt budynków i koordynację dokumentacji branżowej inwestycji.',
    brandGraphic: '/assets/images/team/mr-atelier-portfolio-panel.webp',
    brandGraphicAlt: 'Panel pracowni architektonicznej MR Atelier',
    brandLogo: '/assets/images/team/mr-atelier-logo.png',
    website: 'https://mratelier.pl/',
  },
]
