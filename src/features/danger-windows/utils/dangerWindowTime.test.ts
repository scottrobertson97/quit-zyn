import { describe, expect, it } from 'vitest'
import { makeDangerWindow } from '../../../test/testUtils'
import type { DangerWindowCheckIn, DayOfWeek } from '../types'
import {
  findOverlappingDangerWindow,
  getActiveDangerWindow,
  getDangerWindowStats,
  getNextDangerWindow,
  getPendingCheckIn,
  validateDangerWindowTime,
} from './dangerWindowTime'

describe('danger window time utilities', () => {
  it('finds an active same-day window', () => {
    const now = new Date(2026, 5, 24, 14, 30)
    const window = makeDangerWindow({
      daysOfWeek: [now.getDay() as DayOfWeek],
    })

    expect(getActiveDangerWindow([window], now)?.window.id).toBe(window.id)
  })

  it('chooses the active window with the earliest end time', () => {
    const now = new Date(2026, 5, 24, 14, 30)
    const early = makeDangerWindow({
      id: 'early',
      endTime: '15:00',
      daysOfWeek: [now.getDay() as DayOfWeek],
    })
    const late = makeDangerWindow({
      id: 'late',
      endTime: '16:00',
      daysOfWeek: [now.getDay() as DayOfWeek],
    })

    expect(getActiveDangerWindow([late, early], now)?.window.id).toBe('early')
  })

  it('finds the next recurring window', () => {
    const now = new Date(2026, 5, 24, 9, 0)
    const window = makeDangerWindow({
      daysOfWeek: [now.getDay() as DayOfWeek],
    })

    expect(getNextDangerWindow([window], now)?.windowStartAt).toBe(
      new Date(2026, 5, 24, 14, 0).toISOString(),
    )
  })

  it('detects pending check-ins within six hours', () => {
    const now = new Date(2026, 5, 24, 16, 30)
    const window = makeDangerWindow({
      daysOfWeek: [now.getDay() as DayOfWeek],
    })

    expect(getPendingCheckIn([window], [], now)?.window.id).toBe(window.id)
  })

  it('does not prompt after six hours or after a matching check-in', () => {
    const window = makeDangerWindow({ daysOfWeek: [3] })
    const lateNow = new Date(2026, 5, 24, 23, 0)
    expect(getPendingCheckIn([window], [], lateNow)).toBeNull()

    const checkedNow = new Date(2026, 5, 24, 16, 30)
    const checkIn: DangerWindowCheckIn = {
      id: 'checkin',
      dangerWindowId: window.id,
      windowStartAt: new Date(2026, 5, 24, 14).toISOString(),
      windowEndAt: new Date(2026, 5, 24, 16).toISOString(),
      checkedInAt: new Date(2026, 5, 24, 16, 5).toISOString(),
      outcome: 'protected',
    }

    expect(getPendingCheckIn([window], [checkIn], checkedNow)).toBeNull()
  })

  it('validates midnight crossings and overlaps', () => {
    expect(validateDangerWindowTime('22:00', '01:00')).toContain('same day')

    const existing = makeDangerWindow({ daysOfWeek: [1], startTime: '14:00' })
    const candidate = makeDangerWindow({
      id: 'candidate',
      daysOfWeek: [1],
      startTime: '15:00',
      endTime: '17:00',
    })

    expect(findOverlappingDangerWindow(candidate, [existing])?.id).toBe(
      existing.id,
    )
  })

  it('calculates stats', () => {
    const window = makeDangerWindow()
    const checkIns: DangerWindowCheckIn[] = [
      {
        id: 'protected',
        dangerWindowId: window.id,
        windowStartAt: new Date().toISOString(),
        windowEndAt: new Date().toISOString(),
        checkedInAt: new Date().toISOString(),
        outcome: 'protected',
      },
      {
        id: 'used',
        dangerWindowId: window.id,
        windowStartAt: new Date().toISOString(),
        windowEndAt: new Date().toISOString(),
        checkedInAt: new Date().toISOString(),
        outcome: 'used',
      },
    ]

    expect(getDangerWindowStats([window], checkIns)).toMatchObject({
      totalCheckIns: 2,
      protectedCount: 1,
      usedCount: 1,
      protectionRate: 0.5,
      bestWindowId: window.id,
      hardestWindowId: window.id,
      mostHelpfulDefense: 'walk',
    })
  })
})
