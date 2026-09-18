export type ScheduleState = 'completed' | 'current' | 'planned'

export type ScheduleStage = {
  id: 'I' | 'II' | 'III' | 'IV' | 'V'
  title: string
  description: string
  status: string
  term: string
  state: ScheduleState
}

import snapshot from '../../public/data/site-data.json'
import { parseSiteData } from './runtime/siteSchema.mjs'

export const scheduleStages: ScheduleStage[] = parseSiteData(snapshot).schedule
