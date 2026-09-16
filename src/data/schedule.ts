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
 * Public, high-level schedule aligned with the current investor HRF baseline.
 * The detailed HRF/OMRP remains the source of truth for contractual stages.
 */
export const scheduleStages: ScheduleStage[] = [
  {
    id: 'I',
    title: 'Przygotowanie inwestycji',
    description: 'Dokumentacja, finansowanie, kontraktacja oraz przygotowanie terenu i infrastruktury do rozpoczęcia robót.',
    status: 'W trakcie',
    term: '2026 – I kw. 2027',
    state: 'current',
  },
  {
    id: 'II',
    title: 'Start budowy',
    description: 'Rozpoczęcie robót budowlanych i prac stanu zero.',
    status: 'Planowane',
    term: 'marzec 2027',
    state: 'planned',
  },
  {
    id: 'III',
    title: 'Stan surowy',
    description: 'Fundamenty, konstrukcja, ściany, dach i zamknięcie brył budynków.',
    status: 'Planowane',
    term: '2027',
    state: 'planned',
  },
  {
    id: 'IV',
    title: 'Instalacje i wykończenie',
    description: 'Instalacje, tynki, posadzki, elewacje oraz prace związane z zagospodarowaniem działek.',
    status: 'Planowane',
    term: '2027 – I kw. 2028',
    state: 'planned',
  },
  {
    id: 'V',
    title: 'Odbiory i przekazanie',
    description: 'Kontrole, dokumentacja powykonawcza, odbiory domów i przygotowanie do przeniesienia własności.',
    status: 'Planowane',
    term: 'I kw. 2028',
    state: 'planned',
  },
]
