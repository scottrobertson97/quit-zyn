import { create } from 'zustand'
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
import { getSettings, saveSettings } from '../data/repositories/settingsRepository'
import {
  addPouchLog,
  getAllPouchLogs,
} from '../data/repositories/pouchLogRepository'
import {
  addCravingLog,
  getAllCravingLogs,
  updateCravingLog,
} from '../data/repositories/cravingLogRepository'
import {
  addJournalEntry,
  getAllJournalEntries,
} from '../data/repositories/journalRepository'
import {
  addDangerWindowCheckIn,
  getAllDangerWindowCheckIns,
  getAllDangerWindows,
  saveDangerWindow,
} from '../data/repositories/dangerWindowRepository'
import { resetAllData } from '../data/repositories/resetRepository'

type PouchlessState = {
  initialized: boolean
  storageError?: string
  settings?: UserSettings
  pouchLogs: PouchLog[]
  cravingLogs: CravingLog[]
  journalEntries: JournalEntry[]
  dangerWindows: DangerWindow[]
  dangerWindowCheckIns: DangerWindowCheckIn[]
  initialize: () => Promise<void>
  refresh: () => Promise<void>
  saveSettings: (settings: UserSettings) => Promise<void>
  addPouchLog: (log: PouchLog) => Promise<void>
  addCravingLog: (log: CravingLog) => Promise<void>
  updateCravingLog: (log: CravingLog) => Promise<void>
  addJournalEntry: (entry: JournalEntry) => Promise<void>
  saveDangerWindow: (window: DangerWindow) => Promise<void>
  addDangerWindowCheckIn: (checkIn: DangerWindowCheckIn) => Promise<void>
  resetAll: () => Promise<void>
}

export const usePouchlessStore = create<PouchlessState>()((set, get) => ({
  initialized: false,
  settings: undefined,
  pouchLogs: [],
  cravingLogs: [],
  journalEntries: [],
  dangerWindows: [],
  dangerWindowCheckIns: [],

  initialize: async () => {
    try {
      await get().refresh()
      set({ initialized: true, storageError: undefined })
    } catch (error) {
      set({
        initialized: true,
        storageError:
          error instanceof Error ? error.message : 'Unable to open local data.',
      })
    }
  },

  refresh: async () => {
    const [
      settings,
      pouchLogs,
      cravingLogs,
      journalEntries,
      dangerWindows,
      dangerWindowCheckIns,
    ] =
      await Promise.all([
        getSettings(),
        getAllPouchLogs(),
        getAllCravingLogs(),
        getAllJournalEntries(),
        getAllDangerWindows(),
        getAllDangerWindowCheckIns(),
      ])

    set({
      settings,
      pouchLogs,
      cravingLogs,
      journalEntries,
      dangerWindows,
      dangerWindowCheckIns,
      storageError: undefined,
    })
  },

  saveSettings: async (settings) => {
    await saveSettings(settings)
    set({ settings })
  },

  addPouchLog: async (log) => {
    await addPouchLog(log)
    set((state) => ({ pouchLogs: [log, ...state.pouchLogs] }))
  },

  addCravingLog: async (log) => {
    await addCravingLog(log)
    set((state) => ({ cravingLogs: [log, ...state.cravingLogs] }))
  },

  updateCravingLog: async (log) => {
    await updateCravingLog(log)
    set((state) => ({
      cravingLogs: state.cravingLogs.map((item) =>
        item.id === log.id ? log : item,
      ),
    }))
  },

  addJournalEntry: async (entry) => {
    await addJournalEntry(entry)
    set((state) => ({ journalEntries: [entry, ...state.journalEntries] }))
  },

  saveDangerWindow: async (window) => {
    await saveDangerWindow(window)
    set((state) => {
      const exists = state.dangerWindows.some((item) => item.id === window.id)
      return {
        dangerWindows: exists
          ? state.dangerWindows.map((item) =>
              item.id === window.id ? window : item,
            )
          : [...state.dangerWindows, window],
      }
    })
  },

  addDangerWindowCheckIn: async (checkIn) => {
    await addDangerWindowCheckIn(checkIn)
    set((state) => ({
      dangerWindowCheckIns: [checkIn, ...state.dangerWindowCheckIns],
    }))
  },

  resetAll: async () => {
    await resetAllData()
    set({
      settings: undefined,
      pouchLogs: [],
      cravingLogs: [],
      journalEntries: [],
      dangerWindows: [],
      dangerWindowCheckIns: [],
    })
  },
}))
