import { getInclusiveLocalDayCount, isSameLocalDate, toDate } from './date'
import type { CravingLog, PouchLog, UserSettings } from './types'

export const POUCHES_PER_CAN_FOR_SAVINGS = 15

export type DurationLike = {
  totalMs: number
  hours: number
  minutes: number
  label: string
  lastTimestamp?: string
}

export function getPouchesForDate(
  logs: PouchLog[],
  date: Date | string = new Date(),
) {
  return logs.filter((log) => isSameLocalDate(log.timestamp, date))
}

export function getCravingsForDate(
  logs: CravingLog[],
  date: Date | string = new Date(),
) {
  return logs.filter((log) => isSameLocalDate(log.startedAt, date))
}

export function getPouchesUsedToday(
  logs: PouchLog[],
  now: Date | string = new Date(),
) {
  return getPouchesForDate(logs, now).length
}

export function getNicotineMgToday(
  logs: PouchLog[],
  now: Date | string = new Date(),
) {
  return getPouchesForDate(logs, now).reduce(
    (total, log) => total + log.strengthMg,
    0,
  )
}

export function getRemainingDailyPouches(
  settings: UserSettings,
  logs: PouchLog[],
  now: Date | string = new Date(),
) {
  return Math.max(0, settings.dailyLimit - getPouchesUsedToday(logs, now))
}

export function getTimeSinceLastPouch(
  logs: PouchLog[],
  nowInput: Date | string = new Date(),
): DurationLike {
  const latest = [...logs].sort(
    (a, b) => toDate(b.timestamp).getTime() - toDate(a.timestamp).getTime(),
  )[0]

  if (!latest) {
    return {
      totalMs: 0,
      hours: 0,
      minutes: 0,
      label: 'No pouches logged yet',
    }
  }

  const now = toDate(nowInput).getTime()
  const totalMs = Math.max(0, now - toDate(latest.timestamp).getTime())
  const totalMinutes = Math.floor(totalMs / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return {
    totalMs,
    hours,
    minutes,
    label: formatDurationLabel(hours, minutes),
    lastTimestamp: latest.timestamp,
  }
}

export function getEstimatedAvoidedPouches(
  settings: UserSettings,
  logs: PouchLog[],
  now: Date | string = new Date(),
) {
  const days = getInclusiveLocalDayCount(settings.createdAt, now)
  const expected = settings.baselinePouchesPerDay * days
  return Math.max(0, Math.round((expected - logs.length) * 10) / 10)
}

export function getEstimatedMoneySaved(
  settings: UserSettings,
  cravingLogs: CravingLog[],
) {
  if (!settings.costPerCan || settings.costPerCan <= 0) {
    return 0
  }

  const costPerPouch = settings.costPerCan / POUCHES_PER_CAN_FOR_SAVINGS
  return getSkippedCravingCount(cravingLogs) * costPerPouch
}

export function getSkippedCravingCount(cravingLogs: CravingLog[]) {
  return cravingLogs.filter((log) => log.outcome === 'skipped').length
}

export function getUsedCravingCount(cravingLogs: CravingLog[]) {
  return cravingLogs.filter((log) => log.outcome === 'used').length
}

function formatDurationLabel(hours: number, minutes: number) {
  if (hours <= 0 && minutes <= 0) {
    return 'Just now'
  }

  if (hours <= 0) {
    return `${minutes}m`
  }

  if (minutes <= 0) {
    return `${hours}h`
  }

  return `${hours}h ${minutes}m`
}
