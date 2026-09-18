import interiorTour from '../../public/assets/data/spacer-360-wewnetrzny.json'
import exteriorTour from '../../public/assets/data/spacer-360-zewnetrzny.json'

export type TourMode = 'exterior' | 'interior'

export const tours = {
  exterior: {
    src: '/tour/spacer-360-zewnatrz.html',
    count: exteriorTour.scenes.length,
    title: 'Spacer 360 po Domach na Polnej — dom i działka',
  },
  interior: {
    src: '/tour/spacer-360-wewnatrz.html',
    count: interiorTour.scenes.length,
    title: 'Spacer 360 po Domach na Polnej — wnętrze domu',
  },
} as const
