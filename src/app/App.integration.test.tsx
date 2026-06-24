import { beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'
import { usePouchlessStore } from './store'
import { saveSettings } from '../data/repositories/settingsRepository'
import { makeSettings, renderWithRouter, resetTestData } from '../test/testUtils'

describe('Pouchless app flows', () => {
  beforeEach(async () => {
    await resetTestData()
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
