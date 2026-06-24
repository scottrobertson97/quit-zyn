import { db } from '../db'

export async function resetAllData() {
  await db.transaction(
    'rw',
    db.settings,
    db.pouchLogs,
    db.cravingLogs,
    db.journalEntries,
    async () => {
      await db.settings.clear()
      await db.pouchLogs.clear()
      await db.cravingLogs.clear()
      await db.journalEntries.clear()
    },
  )
}
