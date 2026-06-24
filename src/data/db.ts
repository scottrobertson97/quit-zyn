import Dexie, { type Table } from 'dexie'
import type {
  CravingLog,
  JournalEntry,
  PouchLog,
  UserSettings,
} from '../domain/types'
import type {
  DangerWindow,
  DangerWindowCheckIn,
} from '../features/danger-windows/types'

export class PouchlessDb extends Dexie {
  settings!: Table<UserSettings, string>
  pouchLogs!: Table<PouchLog, string>
  cravingLogs!: Table<CravingLog, string>
  journalEntries!: Table<JournalEntry, string>
  dangerWindows!: Table<DangerWindow, string>
  dangerWindowCheckIns!: Table<DangerWindowCheckIn, string>

  constructor() {
    super('pouchless_db')

    this.version(1).stores({
      settings: 'id, quitMode, onboardingCompleted, updatedAt',
      pouchLogs: 'id, timestamp, trigger, planned',
      cravingLogs: 'id, startedAt, trigger, outcome, intensity',
      journalEntries: 'id, timestamp, relatedCravingId',
    })

    this.version(2).stores({
      settings: 'id, quitMode, onboardingCompleted, updatedAt',
      pouchLogs: 'id, timestamp, trigger, planned',
      cravingLogs: 'id, startedAt, trigger, outcome, intensity',
      journalEntries: 'id, timestamp, relatedCravingId',
      dangerWindows: 'id, isActive, createdAt',
      dangerWindowCheckIns: 'id, dangerWindowId, windowStartAt, outcome',
    })
  }
}

export const db = new PouchlessDb()
