import { db } from '../db'
import type { JournalEntry } from '../../domain/types'

export async function getAllJournalEntries() {
  return db.journalEntries.orderBy('timestamp').reverse().toArray()
}

export async function addJournalEntry(entry: JournalEntry) {
  await db.journalEntries.add(entry)
}
