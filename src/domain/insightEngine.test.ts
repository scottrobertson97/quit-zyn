import { describe, expect, it } from 'vitest'
import {
  getAverageCravingIntensity,
  getCravingOutcomeRate,
  getHighestRiskTimeWindow,
  getMostCommonTrigger,
  getPlannedVsImpulsiveRatio,
} from './insightEngine'
import type { CravingLog, PouchLog } from './types'

const cravings: CravingLog[] = [
  {
    id: 'one',
    startedAt: new Date(2026, 5, 24, 14).toISOString(),
    intensity: 4,
    trigger: 'stress',
    outcome: 'skipped',
  },
  {
    id: 'two',
    startedAt: new Date(2026, 5, 24, 15).toISOString(),
    intensity: 8,
    trigger: 'stress',
    outcome: 'used',
  },
]

const pouches: PouchLog[] = [
  {
    id: 'pouch',
    timestamp: new Date(2026, 5, 24, 15, 30).toISOString(),
    strengthMg: 6,
    trigger: 'focus',
    planned: false,
  },
]

describe('insight engine', () => {
  it('finds common triggers and risk windows', () => {
    expect(getMostCommonTrigger(cravings, pouches)).toEqual({
      trigger: 'stress',
      count: 2,
    })
    expect(getHighestRiskTimeWindow(cravings, pouches)).toEqual({
      window: 'afternoon',
      count: 3,
    })
  })

  it('calculates craving outcomes and intensity', () => {
    expect(getCravingOutcomeRate(cravings)).toMatchObject({
      skipped: 1,
      used: 1,
      skippedRate: 0.5,
    })
    expect(getAverageCravingIntensity(cravings)).toBe(6)
  })

  it('calculates planned and impulsive use', () => {
    expect(getPlannedVsImpulsiveRatio(pouches)).toMatchObject({
      planned: 0,
      impulsive: 1,
      plannedRate: 0,
    })
  })
})
