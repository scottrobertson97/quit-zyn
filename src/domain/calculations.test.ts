import { describe, expect, it } from 'vitest'
import {
  getEstimatedAvoidedPouches,
  getEstimatedMoneySaved,
  getPouchesForDate,
  getPouchesUsedToday,
  getRemainingDailyPouches,
  getSkippedCravingCount,
  getTimeSinceLastPouch,
  getUsedCravingCount,
} from './calculations'
import type { CravingLog, PouchLog, UserSettings } from './types'

const settings: UserSettings = {
  id: 'default',
  quitMode: 'delay',
  pouchStrengthMg: 6,
  baselinePouchesPerDay: 4,
  dailyLimit: 2,
  costPerCan: 10,
  pouchesPerCan: 20,
  onboardingCompleted: true,
  createdAt: new Date(2026, 5, 22, 9).toISOString(),
  updatedAt: new Date(2026, 5, 22, 9).toISOString(),
}

function pouch(id: string, date: Date): PouchLog {
  return {
    id,
    timestamp: date.toISOString(),
    strengthMg: 6,
    trigger: 'stress',
    planned: false,
  }
}

describe('calculations', () => {
  it('filters logs by local date and resets daily counts', () => {
    const logs = [
      pouch('one', new Date(2026, 5, 24, 8, 0)),
      pouch('two', new Date(2026, 5, 24, 19, 0)),
      pouch('old', new Date(2026, 5, 23, 23, 0)),
    ]

    expect(getPouchesForDate(logs, new Date(2026, 5, 24))).toHaveLength(2)
    expect(getPouchesUsedToday(logs, new Date(2026, 5, 24, 20))).toBe(2)
    expect(getPouchesUsedToday(logs, new Date(2026, 5, 25, 9))).toBe(0)
  })

  it('calculates remaining pouches, avoided pouches, and money saved', () => {
    const logs = [
      pouch('one', new Date(2026, 5, 23, 8)),
      pouch('two', new Date(2026, 5, 24, 8)),
    ]

    expect(getRemainingDailyPouches(settings, logs, new Date(2026, 5, 24))).toBe(
      1,
    )
    expect(
      getEstimatedAvoidedPouches(settings, logs, new Date(2026, 5, 24)),
    ).toBe(10)
    expect(
      getEstimatedMoneySaved(settings, logs, new Date(2026, 5, 24)),
    ).toBe(5)
  })

  it('formats time since the last pouch', () => {
    const logs = [pouch('one', new Date(2026, 5, 24, 7, 10))]

    expect(
      getTimeSinceLastPouch(logs, new Date(2026, 5, 24, 9, 25)).label,
    ).toBe('2h 15m')
  })

  it('counts skipped and used cravings', () => {
    const cravings: CravingLog[] = [
      {
        id: 'one',
        startedAt: new Date().toISOString(),
        intensity: 4,
        trigger: 'stress',
        outcome: 'skipped',
      },
      {
        id: 'two',
        startedAt: new Date().toISOString(),
        intensity: 7,
        trigger: 'focus',
        outcome: 'used',
      },
    ]

    expect(getSkippedCravingCount(cravings)).toBe(1)
    expect(getUsedCravingCount(cravings)).toBe(1)
  })
})
