import { db } from '../db'

export async function resetAllData() {
  await db.transaction(
    'rw',
    [
      db.settings,
      db.pouchLogs,
      db.cravingLogs,
      db.journalEntries,
      db.dangerWindows,
      db.dangerWindowCheckIns,
    ],
    async () => {
      await db.settings.clear()
      await db.pouchLogs.clear()
      await db.cravingLogs.clear()
      await db.journalEntries.clear()
      await db.dangerWindows.clear()
      await db.dangerWindowCheckIns.clear()
    },
  )
}
