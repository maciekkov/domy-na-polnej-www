export type StandardIconId = 'heat-pump' | 'ventilation' | 'floor-heating' | 'blinds' | 'windows' | 'glazing' | 'pv' | 'fence'

export const standardHighlights: Array<{ id: StandardIconId; label: string }> = [
  { id: 'heat-pump', label: 'Pompa ciepła' },
  { id: 'ventilation', label: 'Rekuperacja' },
  { id: 'floor-heating', label: 'Ogrzewanie podłogowe' },
  { id: 'blinds', label: 'Rolety elektryczne' },
  { id: 'windows', label: 'Stolarka trzyszybowa' },
  { id: 'glazing', label: 'Duże przeszklenia' },
  { id: 'pv', label: 'Przygotowanie PV' },
  { id: 'fence', label: 'Ogrodzenie' },
]

export const standardGroups = [
  {
    id: 'construction',
    title: 'Konstrukcja',
    lead: 'Dom parterowy o powierzchni użytkowej 110,82 m².',
    detail: 'Ściany nośne 24 cm, ocieplenie ścian 20 cm i stropu 30–35 cm oraz prefabrykowana konstrukcja dachu z drewna C24. Wysokość pomieszczeń wynosi 2,70 m, a salon otrzymuje podwyższoną przestrzeń katedralną.',
  },
  {
    id: 'windows',
    title: 'Stolarka',
    lead: 'Stolarka trzyszybowa — system Aluplast Energeto Neo, ramy w jasnym dębie.',
    detail: 'Szczelny montaż, duże przeszklenia od poziomu podłogi, system Smart Slide oraz elektryczne rolety zewnętrzne. Drzwi wejściowe stalowe, czarne, o szerokości 100 cm.',
  },
  {
    id: 'installations',
    title: 'Instalacje',
    lead: 'Instalacje elektryczne, sanitarne i wentylacja mechaniczna.',
    detail: 'Instalacja elektryczna, wodno-kanalizacyjna, wentylacja mechaniczna z odzyskiem ciepła oraz przygotowanie PV Ready. Na ogród wyprowadzona zostaje woda i energia elektryczna.',
  },
  {
    id: 'heating',
    title: 'Ogrzewanie',
    lead: 'Pompa ciepła i ogrzewanie podłogowe w standardzie.',
    detail: 'Niskotemperaturowe ogrzewanie podłogowe współpracuje z pompą ciepła i zasobnikiem ciepłej wody. Układ zapewnia równomierny komfort bez tradycyjnych grzejników na ścianach.',
  },
  {
    id: 'exterior',
    title: 'Wykończenie zewnętrzne',
    lead: 'Jasna elewacja, czarny dach i akcenty w strefie wejścia.',
    detail: 'Płaska czarna dachówka, czarne stalowe rynny i parapety, jasna elewacja oraz drewniane lamele w strefie wejściowej. Bryła i podstawowa kolorystyka odpowiadają koncepcji prezentowanej na wizualizacjach.',
  },
  {
    id: 'plot',
    title: 'Działka',
    lead: 'Własna działka przygotowana do urządzenia prywatnego ogrodu.',
    detail: 'Ogrodzenie panelowe 3D z podmurówką, bramą i furtką, utwardzony podjazd i dojście, opaska żwirowa wokół domu oraz uporządkowanie i niwelacja terenu.',
  },
] as const

import snapshot from '../../public/data/site-data.json'
export const standardPdf = snapshot.standardPdf
