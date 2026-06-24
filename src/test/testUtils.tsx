import { MemoryRouter } from 'react-router'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { db } from '../data/db'
import { usePouchlessStore } from '../app/store'
import type { UserSettings } from '../domain/types'

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
  })
}

export function renderWithRouter(ui: ReactElement, initialEntry = '/') {
  return render(<MemoryRouter initialEntries={[initialEntry]}>{ui}</MemoryRouter>)
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
