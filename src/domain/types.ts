export type QuitMode = 'cold_turkey' | 'taper' | 'delay' | 'awareness'

export type Trigger =
  | 'stress'
  | 'boredom'
  | 'focus'
  | 'driving'
  | 'after_food'
  | 'habit_autopilot'
  | 'social'
  | 'morning'
  | 'night'
  | 'other'

export type Intervention =
  | 'water'
  | 'walk'
  | 'breathing'
  | 'gum'
  | 'brush_teeth'
  | 'journal'
  | 'delay_timer'
  | 'message_someone'

export type CravingOutcome = 'skipped' | 'used' | 'still_waiting'

export type UserSettings = {
  id: 'default'
  quitMode: QuitMode
  pouchStrengthMg: number
  baselinePouchesPerDay: number
  dailyLimit: number
  quitDate?: string
  costPerCan?: number
  pouchesPerCan?: number
  onboardingCompleted: boolean
  createdAt: string
  updatedAt: string
}

export type PouchLog = {
  id: string
  timestamp: string
  strengthMg: number
  trigger?: Trigger
  planned: boolean
  note?: string
}

export type CravingLog = {
  id: string
  startedAt: string
  endedAt?: string
  intensity: number
  trigger: Trigger
  outcome: CravingOutcome
  intervention?: Intervention
  note?: string
}

export type JournalEntry = {
  id: string
  timestamp: string
  prompt: string
  body: string
  relatedCravingId?: string
}
