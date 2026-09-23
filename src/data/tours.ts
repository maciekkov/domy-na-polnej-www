import summary from '../../public/assets/data/tour-summary.json'
export type TourMode = 'exterior' | 'interior'
// Full scene graphs are fetched by the player only when opened, not bundled into the homepage.
export const tours = {
  exterior: {...summary.exterior, src:'/tour/spacer-360-zewnatrz.html', title:'Spacer 360 po Domach na Polnej — dom i działka'},
  interior: {...summary.interior, src:'/tour/spacer-360-wewnatrz.html', title:'Spacer 360 po Domach na Polnej — wnętrze domu'},
} as const
