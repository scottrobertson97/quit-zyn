import { db } from '../db'
import type { PouchLog } from '../../domain/types'

export async function getAllPouchLogs() {
  return db.pouchLogs.orderBy('timestamp').reverse().toArray()
}

export async function addPouchLog(log: PouchLog) {
  await db.pouchLogs.add(log)
}
