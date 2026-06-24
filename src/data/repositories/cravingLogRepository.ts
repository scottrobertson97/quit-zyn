import { db } from '../db'
import type { CravingLog } from '../../domain/types'

export async function getAllCravingLogs() {
  return db.cravingLogs.orderBy('startedAt').reverse().toArray()
}

export async function addCravingLog(log: CravingLog) {
  await db.cravingLogs.add(log)
}

export async function updateCravingLog(log: CravingLog) {
  await db.cravingLogs.put(log)
}
