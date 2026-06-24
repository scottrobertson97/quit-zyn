import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../db'
import { resetTestData, makeSettings } from '../../test/testUtils'
import { getSettings, saveSettings } from './settingsRepository'
import { addPouchLog, getAllPouchLogs } from './pouchLogRepository'
import {
  addCravingLog,
  getAllCravingLogs,
  updateCravingLog,
} from './cravingLogRepository'
import { addJournalEntry, getAllJournalEntries } from './journalRepository'

describe('repositories', () => {
  beforeEach(async () => {
    await resetTestData()
  })

  it('persists settings, pouch logs, craving updates, and journal entries', async () => {
    const settings = makeSettings()
    await saveSettings(settings)

    await addPouchLog({
      id: 'pouch',
      timestamp: new Date(2026, 5, 24, 10).toISOString(),
      strengthMg: 6,
      trigger: 'stress',
      planned: false,
    })

    await addCravingLog({
      id: 'craving',
      startedAt: new Date(2026, 5, 24, 9).toISOString(),
      intensity: 7,
      trigger: 'stress',
      outcome: 'still_waiting',
    })

    await updateCravingLog({
      id: 'craving',
      startedAt: new Date(2026, 5, 24, 9).toISOString(),
      endedAt: new Date(2026, 5, 24, 9, 5).toISOString(),
      intensity: 7,
      trigger: 'stress',
      outcome: 'skipped',
    })

    await addJournalEntry({
      id: 'journal',
      timestamp: new Date(2026, 5, 24, 11).toISOString(),
      prompt: 'What pattern am I starting to notice?',
      body: 'Stress arrives before lunch.',
      relatedCravingId: 'craving',
    })

    expect(await getSettings()).toEqual(settings)
    expect(await getAllPouchLogs()).toHaveLength(1)
    expect((await getAllCravingLogs())[0].outcome).toBe('skipped')
    expect((await getAllJournalEntries())[0].relatedCravingId).toBe('craving')
  })

  it('surfaces IndexedDB failures to callers', async () => {
    const get = vi
      .spyOn(db.settings, 'get')
      .mockRejectedValueOnce(new Error('blocked'))

    await expect(getSettings()).rejects.toThrow('blocked')
    get.mockRestore()
  })
})
