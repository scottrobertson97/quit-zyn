import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'
import { usePouchlessStore } from './store'
import { addCravingLog } from '../data/repositories/cravingLogRepository'
import {
  addDangerWindowCheckIn,
  saveDangerWindow,
} from '../data/repositories/dangerWindowRepository'
import { saveSettings } from '../data/repositories/settingsRepository'
import {
  makeDangerWindow,
  makeSettings,
  renderWithRouter,
  resetTestData,
} from '../test/testUtils'

describe('Pouchless app flows', () => {
  beforeEach(async () => {
    await resetTestData()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('completes onboarding and routes to Today', async () => {
    const user = userEvent.setup()
    renderWithRouter(<App />, '/onboarding')

    expect(await screen.findByText('Set your starting point')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /start with today/i }))

    expect(await screen.findByText('Time since last pouch')).toBeInTheDocument()
    expect(usePouchlessStore.getState().settings?.onboardingCompleted).toBe(true)
  })

  it('logs a pouch and refreshes Today stats', async () => {
    const user = userEvent.setup()
    await saveSettings(makeSettings())

    renderWithRouter(<App />, '/log')

    expect(await screen.findByText('Log a pouch')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /save log/i }))

    expect(await screen.findByText(/dashboard is updated/i)).toBeInTheDocument()
    expect(usePouchlessStore.getState().pouchLogs).toHaveLength(1)

    await user.click(screen.getByRole('link', { name: /back to today/i }))

    expect(await screen.findByText('Time since last pouch')).toBeInTheDocument()
    expect(screen.getAllByText('1').length).toBeGreaterThan(0)
  })

  it('runs the craving flow and saves a skipped outcome', async () => {
    const user = userEvent.setup()
    await saveSettings(makeSettings())

    renderWithRouter(<App />, '/craving')

    expect(await screen.findByText('Craving mode')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByRole('button', { name: /start five minutes/i }))

    expect(await screen.findByText('5:00')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /i skipped it/i }))

    expect(await screen.findByText('You created space.')).toBeInTheDocument()
    expect(usePouchlessStore.getState().cravingLogs[0].outcome).toBe('skipped')
  })

  it('shows savings from skipped cravings on Today', async () => {
    await saveSettings(makeSettings({ costPerCan: 15 }))
    await addCravingLog({
      id: 'skip-one',
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      intensity: 5,
      trigger: 'stress',
      outcome: 'skipped',
    })

    renderWithRouter(<App />, '/today')

    expect(await screen.findByText('Estimated saved')).toBeInTheDocument()
    expect(await screen.findByText('$1.00')).toBeInTheDocument()
  })

  it('saves estimated can cost from Settings', async () => {
    const user = userEvent.setup()
    await saveSettings(makeSettings({ costPerCan: undefined }))

    renderWithRouter(<App />, '/settings')

    expect(await screen.findByText('Savings estimate')).toBeInTheDocument()
    const costInput = screen.getByLabelText(/estimated cost per can/i)
    await user.clear(costInput)
    await user.type(costInput, '18.75')
    await user.click(screen.getByRole('button', { name: /save cost/i }))

    expect(
      await screen.findByText('Savings estimate updated.'),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(usePouchlessStore.getState().settings?.costPerCan).toBe(18.75),
    )
  })

  it('saves plan edits', async () => {
    const user = userEvent.setup()
    await saveSettings(makeSettings())

    renderWithRouter(<App />, '/plan')

    expect(await screen.findByText('Quit plan')).toBeInTheDocument()
    const limit = screen.getByLabelText(/current daily limit/i)
    await user.clear(limit)
    await user.type(limit, '3')
    await user.click(screen.getByRole('button', { name: /save plan/i }))

    expect(await screen.findByText('Plan saved locally.')).toBeInTheDocument()
    await waitFor(() =>
      expect(usePouchlessStore.getState().settings?.dailyLimit).toBe(3),
    )
  })

  it('creates a danger window from the plan screen', async () => {
    const user = userEvent.setup()
    await saveSettings(makeSettings())

    renderWithRouter(<App />, '/plan')

    expect(await screen.findByText('Danger Windows')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^create$/i }))
    await user.type(screen.getByLabelText(/^label$/i), 'Afternoon Crash')
    await user.click(
      screen.getByRole('button', { name: /create danger window/i }),
    )

    expect(await screen.findByText('Afternoon Crash')).toBeInTheDocument()
    expect(usePouchlessStore.getState().dangerWindows[0]).toMatchObject({
      label: 'Afternoon Crash',
      goal: 'delay_first',
      defenseAction: 'walk',
      isActive: true,
    })
  })

  it('shows a pending danger window check-in and saves the outcome', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date(2026, 5, 24, 16, 30))
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    await saveSettings(makeSettings())
    await saveDangerWindow(
      makeDangerWindow({
        daysOfWeek: [3],
        startTime: '14:00',
        endTime: '16:00',
      }),
    )

    renderWithRouter(<App />, '/today')

    expect(await screen.findByText('Danger Window Complete')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: /i delayed but used later/i }),
    )
    await user.click(screen.getByRole('button', { name: /save check-in/i }))

    await waitFor(() =>
      expect(usePouchlessStore.getState().dangerWindowCheckIns[0]).toMatchObject({
        dangerWindowId: 'danger-window',
        outcome: 'delayed',
      }),
    )
  })

  it('starts a danger window defense flow from Today', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date(2026, 5, 24, 14, 30))
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    await saveSettings(makeSettings())
    await saveDangerWindow(
      makeDangerWindow({
        daysOfWeek: [3],
        startTime: '14:00',
        endTime: '16:00',
      }),
    )

    renderWithRouter(<App />, '/today')

    expect(await screen.findByText('Active Danger Window')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: /start defense/i }))

    expect(await screen.findByText('Defense: Walk')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /start 5-minute timer/i }))
    await vi.advanceTimersByTimeAsync(1000)

    expect(await screen.findByText('4:59')).toBeInTheDocument()
  })

  it('shows danger window stats in Insights', async () => {
    await saveSettings(makeSettings())
    await saveDangerWindow(makeDangerWindow())
    await addDangerWindowCheckIn({
      id: 'protected-checkin',
      dangerWindowId: 'danger-window',
      windowStartAt: new Date(2026, 5, 23, 14).toISOString(),
      windowEndAt: new Date(2026, 5, 23, 16).toISOString(),
      checkedInAt: new Date(2026, 5, 23, 16, 5).toISOString(),
      outcome: 'protected',
    })
    await addDangerWindowCheckIn({
      id: 'used-checkin',
      dangerWindowId: 'danger-window',
      windowStartAt: new Date(2026, 5, 24, 14).toISOString(),
      windowEndAt: new Date(2026, 5, 24, 16).toISOString(),
      checkedInAt: new Date(2026, 5, 24, 16, 5).toISOString(),
      outcome: 'used',
    })

    renderWithRouter(<App />, '/insights')

    expect(await screen.findByText('Protection rate')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getAllByText('Work Crash')).toHaveLength(2)
    expect(screen.getByText('Take a walk')).toBeInTheDocument()
  })

  it('shows useful insight empty states', async () => {
    await saveSettings(makeSettings())

    renderWithRouter(<App />, '/insights')

    expect(
      await screen.findByText('Patterns need a little more data'),
    ).toBeInTheDocument()
  })

  it('creates a journal entry', async () => {
    const user = userEvent.setup()
    await saveSettings(makeSettings())

    renderWithRouter(<App />, '/journal')

    expect(await screen.findByText('Notice the pattern')).toBeInTheDocument()
    await user.type(screen.getByLabelText(/entry/i), 'Stress rises after lunch.')
    await user.click(screen.getByRole('button', { name: /save entry/i }))

    expect(await screen.findByText('Stress rises after lunch.')).toBeInTheDocument()
    expect(usePouchlessStore.getState().journalEntries).toHaveLength(1)
  })
})
