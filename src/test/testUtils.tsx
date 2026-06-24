import { MemoryRouter } from 'react-router'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { db } from '../data/db'
import { usePouchlessStore } from '../app/store'
import type { UserSettings } from '../domain/types'
import type { DangerWindow } from '../features/danger-windows/types'

export async function resetTestData() {
  db.close()
  await db.delete()
  await db.open()
  usePouchlessStore.setState({
    initialized: false,
    storageError: undefined,
    settings: undefined,
    pouchLogs: [],
    cravingLogs: [],
    journalEntries: [],
    dangerWindows: [],
    dangerWindowCheckIns: [],
  })
}

export function renderWithRouter(ui: ReactElement, initialEntry = '/') {
  return render(<MemoryRouter initialEntries={[initialEntry]}>{ui}</MemoryRouter>)
}

export function makeDangerWindow(
  overrides: Partial<DangerWindow> = {},
): DangerWindow {
  const now = new Date(2026, 5, 24, 9, 0).toISOString()

  return {
    id: 'danger-window',
    label: 'Work Crash',
    startTime: '14:00',
    endTime: '16:00',
    daysOfWeek: [1, 2, 3, 4, 5],
    goal: 'delay_first',
    defenseAction: 'walk',
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

export function makeSettings(overrides: Partial<UserSettings> = {}): UserSettings {
  const now = new Date(2026, 5, 24, 9, 0).toISOString()

  return {
    id: 'default',
    quitMode: 'delay',
    pouchStrengthMg: 6,
    baselinePouchesPerDay: 8,
    dailyLimit: 6,
    pouchesPerCan: 15,
    onboardingCompleted: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}
