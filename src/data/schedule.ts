export type ScheduleState = 'completed' | 'current' | 'planned'

export type ScheduleStage = {
  id: 'I' | 'II' | 'III' | 'IV' | 'V'
  title: string
  description: string
  status: string
  term: string
  state: ScheduleState
}

/**
 * Copy and dates currently mirror the accepted section 09 reference board.
 * Before production publication, confirm the schedule against the current investor HRF.
 */
export const scheduleStages: ScheduleStage[] = [
  {
    id: 'I',
    title: 'Przygotowanie inwestycji',
    description: 'Zakup działki, projekt, uzgodnienia, pozwolenia.',
    status: 'Zakończone',
    term: 'IV kw. 2024',
    state: 'completed',
  },
  {
    id: 'II',
    title: 'Start budowy',
    description: 'Rozpoczęcie prac na działce.',
    status: 'Zakończone',
    term: 'I kw. 2025',
    state: 'completed',
  },
  {
    id: 'III',
    title: 'Stan surowy',
    description: 'Fundamenty, ściany, stropy, dach.',
    status: 'W trakcie',
    term: 'II–III kw. 2025',
    state: 'current',
  },
  {
    id: 'IV',
    title: 'Instalacje i wykończenie',
    description: 'Instalacje wewnętrzne, tynki, elewacja, wykończenia.',
    status: 'Planowane',
    term: 'III–IV kw. 2025',
    state: 'planned',
  },
  {
    id: 'V',
    title: 'Odbiory i przekazanie',
    description: 'Kontrole, odbiory techniczne, przekazanie kluczy.',
    status: 'Planowane',
    term: 'I kw. 2026',
    state: 'planned',
  },
]
