import { isWithinLastDays, toDate } from './date'
import type { CravingLog, PouchLog, Trigger } from './types'

export type RiskWindow = 'morning' | 'afternoon' | 'evening' | 'night'

export type TriggerInsight = {
  trigger: Trigger
  count: number
}

export function getMostCommonTrigger(
  cravingLogs: CravingLog[],
  pouchLogs: PouchLog[],
): TriggerInsight | undefined {
  const counts = new Map<Trigger, number>()

  for (const log of cravingLogs) {
    counts.set(log.trigger, (counts.get(log.trigger) ?? 0) + 1)
  }

  for (const log of pouchLogs) {
    if (log.trigger) {
      counts.set(log.trigger, (counts.get(log.trigger) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)[0]
}

export function getHighestRiskTimeWindow(
  cravingLogs: CravingLog[],
  pouchLogs: PouchLog[],
): { window: RiskWindow; count: number } | undefined {
  const counts = new Map<RiskWindow, number>()
  const add = (timestamp: string) => {
    const window = getRiskWindow(timestamp)
    counts.set(window, (counts.get(window) ?? 0) + 1)
  }

  cravingLogs.forEach((log) => add(log.startedAt))
  pouchLogs.forEach((log) => add(log.timestamp))

  return [...counts.entries()]
    .map(([window, count]) => ({ window, count }))
    .sort((a, b) => b.count - a.count)[0]
}

export function getCravingOutcomeRate(cravingLogs: CravingLog[]) {
  const skipped = cravingLogs.filter((log) => log.outcome === 'skipped').length
  const used = cravingLogs.filter((log) => log.outcome === 'used').length
  const stillWaiting = cravingLogs.filter(
    (log) => log.outcome === 'still_waiting',
  ).length
  const completed = skipped + used

  return {
    skipped,
    used,
    stillWaiting,
    total: cravingLogs.length,
    skippedRate: completed > 0 ? skipped / completed : 0,
  }
}

export function getAverageCravingIntensity(cravingLogs: CravingLog[]) {
  if (cravingLogs.length === 0) {
    return 0
  }

  const total = cravingLogs.reduce((sum, log) => sum + log.intensity, 0)
  return Math.round((total / cravingLogs.length) * 10) / 10
}

export function getPlannedVsImpulsiveRatio(pouchLogs: PouchLog[]) {
  const planned = pouchLogs.filter((log) => log.planned).length
  const impulsive = pouchLogs.length - planned

  return {
    planned,
    impulsive,
    total: pouchLogs.length,
    plannedRate: pouchLogs.length > 0 ? planned / pouchLogs.length : 0,
  }
}

export function getPouchesUsedThisWeek(
  pouchLogs: PouchLog[],
  now: Date | string = new Date(),
) {
  return pouchLogs.filter((log) => isWithinLastDays(log.timestamp, 7, now))
    .length
}

export function getRiskWindow(dateInput: Date | string): RiskWindow {
  const hour = toDate(dateInput).getHours()

  if (hour >= 5 && hour < 11) {
    return 'morning'
  }

  if (hour >= 11 && hour < 17) {
    return 'afternoon'
  }

  if (hour >= 17 && hour < 22) {
    return 'evening'
  }

  return 'night'
}
