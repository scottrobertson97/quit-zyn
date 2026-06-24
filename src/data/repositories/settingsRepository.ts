import { db } from '../db'
import type { UserSettings } from '../../domain/types'

export async function getSettings() {
  return db.settings.get('default')
}

export async function saveSettings(settings: UserSettings) {
  await db.settings.put(settings)
}
