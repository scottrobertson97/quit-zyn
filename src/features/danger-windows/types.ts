import type { Trigger } from '../../domain/types'

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type DangerWindowGoal = 'no_pouch' | 'delay_first' | 'stay_under_limit'

export type DefenseAction =
  | 'water'
  | 'walk'
  | 'gum'
  | 'breathing'
  | 'snack'
  | 'brush_teeth'
  | 'journal'
  | 'leave_room'

export type DangerWindow = {
  id: string
  label: string
  startTime: string
  endTime: string
  daysOfWeek: DayOfWeek[]
  goal: DangerWindowGoal
  defenseAction: DefenseAction
  reason?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type DangerWindowOutcome =
  | 'protected'
  | 'delayed'
  | 'used'
  | 'skipped_checkin'

export type DangerWindowCheckIn = {
  id: string
  dangerWindowId: string
  windowStartAt: string
  windowEndAt: string
  checkedInAt: string
  outcome: DangerWindowOutcome
  trigger?: Trigger
  note?: string
}

export type DangerWindowOccurrence = {
  window: DangerWindow
  windowStartAt: string
  windowEndAt: string
}

export type ActiveDangerWindow = DangerWindowOccurrence

export type UpcomingDangerWindow = DangerWindowOccurrence

export type PendingDangerWindowCheckIn = DangerWindowOccurrence

export type DangerWindowStats = {
  totalCheckIns: number
  protectedCount: number
  delayedCount: number
  usedCount: number
  skippedCheckInCount: number
  protectionRate: number
  bestWindowId?: string
  hardestWindowId?: string
  mostHelpfulDefense?: DefenseAction
}
