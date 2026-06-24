import { useState } from 'react'
import { useNavigate } from 'react-router'
import { HeartPulse } from 'lucide-react'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Field, TextInput } from '../../components/FormField'
import { OptionButton } from '../../components/OptionButton'
import { usePouchlessStore } from '../../app/store'
import {
  medicalDisclaimer,
  quitModeDescriptions,
  quitModeLabels,
  triggerLabels,
  triggerOptions,
} from '../../domain/constants'
import { createId } from '../../domain/id'
import type { QuitMode, Trigger, UserSettings } from '../../domain/types'

const quitModeOptions: QuitMode[] = [
  'awareness',
  'delay',
  'taper',
  'cold_turkey',
]

export function OnboardingScreen() {
  const navigate = useNavigate()
  const saveSettings = usePouchlessStore((state) => state.saveSettings)
  const [baseline, setBaseline] = useState(8)
  const [strength, setStrength] = useState(6)
  const [dailyLimit, setDailyLimit] = useState(8)
  const [quitMode, setQuitMode] = useState<QuitMode>('delay')
  const [quitDate, setQuitDate] = useState('')
  const [costPerCan, setCostPerCan] = useState('')
  const [pouchesPerCan, setPouchesPerCan] = useState(15)
  const [mainTriggers, setMainTriggers] = useState<Trigger[]>([])
  const [saving, setSaving] = useState(false)

  const toggleTrigger = (trigger: Trigger) => {
    setMainTriggers((current) =>
      current.includes(trigger)
        ? current.filter((item) => item !== trigger)
        : [...current, trigger],
    )
  }

  const handleMode = (mode: QuitMode) => {
    setQuitMode(mode)
    if (mode === 'cold_turkey') {
      setDailyLimit(0)
    } else if (dailyLimit === 0) {
      setDailyLimit(Math.max(1, baseline))
    }
  }

  const handleBaseline = (nextBaseline: number) => {
    setBaseline(nextBaseline)
    if (quitMode !== 'cold_turkey') {
      setDailyLimit((current) => (current === baseline ? nextBaseline : current))
    }
  }

  const completeOnboarding = async () => {
    setSaving(true)
    const now = new Date().toISOString()
    const settings: UserSettings = {
      id: 'default',
      quitMode,
      pouchStrengthMg: strength,
      baselinePouchesPerDay: baseline,
      dailyLimit,
      quitDate: quitDate || undefined,
      costPerCan: costPerCan ? Number(costPerCan) : undefined,
      pouchesPerCan: pouchesPerCan || 15,
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now,
    }

    await saveSettings(settings)

    if (mainTriggers.length > 0) {
      const addJournalEntry = usePouchlessStore.getState().addJournalEntry
      await addJournalEntry({
        id: createId('journal'),
        timestamp: now,
        prompt: 'What pattern am I starting to notice?',
        body: `Starting triggers: ${mainTriggers
          .map((trigger) => triggerLabels[trigger])
          .join(', ')}.`,
      })
    }

    navigate('/today', { replace: true })
  }

  return (
    <main className="min-h-svh bg-slate-50 px-4 py-6 text-teal-950">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-teal-700 text-white">
            <HeartPulse className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-teal-700">Pouchless</p>
            <h1 className="text-3xl font-semibold">Set your starting point</h1>
          </div>
        </div>

        <Card>
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault()
              void completeOnboarding()
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Average pouches per day">
                <TextInput
                  min={0}
                  required
                  type="number"
                  value={baseline}
                  onChange={(event) =>
                    handleBaseline(Number(event.currentTarget.value))
                  }
                />
              </Field>
              <Field label="Usual strength in mg">
                <TextInput
                  min={0}
                  required
                  step="0.5"
                  type="number"
                  value={strength}
                  onChange={(event) =>
                    setStrength(Number(event.currentTarget.value))
                  }
                />
              </Field>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-teal-950">
                Quit mode
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {quitModeOptions.map((mode) => (
                  <OptionButton
                    key={mode}
                    value={mode}
                    selected={quitMode === mode}
                    onSelect={handleMode}
                  >
                    <span className="block">{quitModeLabels[mode]}</span>
                    <span className="mt-1 block text-xs font-normal opacity-80">
                      {quitModeDescriptions[mode]}
                    </span>
                  </OptionButton>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Daily limit">
                <TextInput
                  min={0}
                  required
                  type="number"
                  value={dailyLimit}
                  onChange={(event) =>
                    setDailyLimit(Number(event.currentTarget.value))
                  }
                />
              </Field>
              <Field label="Quit date" helper="Optional">
                <TextInput
                  type="date"
                  value={quitDate}
                  onChange={(event) => setQuitDate(event.currentTarget.value)}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cost per can" helper="Optional, for savings estimate">
                <TextInput
                  min={0}
                  step="0.01"
                  type="number"
                  value={costPerCan}
                  onChange={(event) => setCostPerCan(event.currentTarget.value)}
                />
              </Field>
              <Field label="Pouches per can">
                <TextInput
                  min={1}
                  type="number"
                  value={pouchesPerCan}
                  onChange={(event) =>
                    setPouchesPerCan(Number(event.currentTarget.value))
                  }
                />
              </Field>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-teal-950">
                Main triggers
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {triggerOptions.map((trigger) => (
                  <OptionButton
                    key={trigger}
                    value={trigger}
                    selected={mainTriggers.includes(trigger)}
                    onSelect={toggleTrigger}
                  >
                    {triggerLabels[trigger]}
                  </OptionButton>
                ))}
              </div>
            </div>

            <p className="rounded-lg bg-teal-50 p-3 text-sm leading-6 text-teal-900">
              {medicalDisclaimer}
            </p>

            <Button className="w-full" disabled={saving} size="lg" type="submit">
              Start with today
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}
