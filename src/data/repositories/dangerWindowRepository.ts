import { db } from '../db'
import type {
  DangerWindow,
  DangerWindowCheckIn,
} from '../../features/danger-windows/types'

export async function getAllDangerWindows() {
  return db.dangerWindows.orderBy('createdAt').toArray()
}

export async function saveDangerWindow(window: DangerWindow) {
  await db.dangerWindows.put(window)
}

export async function getAllDangerWindowCheckIns() {
  return db.dangerWindowCheckIns.orderBy('windowStartAt').reverse().toArray()
}

export async function addDangerWindowCheckIn(checkIn: DangerWindowCheckIn) {
  await db.dangerWindowCheckIns.add(checkIn)
}
