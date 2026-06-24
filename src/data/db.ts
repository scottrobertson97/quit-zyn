import Dexie, { type Table } from 'dexie'
import type {
  CravingLog,
  JournalEntry,
  PouchLog,
  UserSettings,
} from '../domain/types'

export class PouchlessDb extends Dexie {
  settings!: Table<UserSettings, string>
  pouchLogs!: Table<PouchLog, string>
  cravingLogs!: Table<CravingLog, string>
  journalEntries!: Table<JournalEntry, string>

  constructor() {
    super('pouchless_db')

    this.version(1).stores({
      settings: 'id, quitMode, onboardingCompleted, updatedAt',
      pouchLogs: 'id, timestamp, trigger, planned',
      cravingLogs: 'id, startedAt, trigger, outcome, intensity',
      journalEntries: 'id, timestamp, relatedCravingId',
    })
  }
}

export const db = new PouchlessDb()
