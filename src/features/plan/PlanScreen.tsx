import { useState } from 'react'
import { Save } from 'lucide-react'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Field, SelectInput, TextInput } from '../../components/FormField'
import { MetricCard } from '../../components/MetricCard'
import { usePouchlessStore } from '../../app/store'
import {
  medicalDisclaimer,
  quitModeDescriptions,
  quitModeLabels,
} from '../../domain/constants'
import { getPlanCopy } from '../../domain/copy'
import type { QuitMode } from '../../domain/types'
import { DangerWindowManager } from '../danger-windows/components/DangerWindowManager'

const quitModes: QuitMode[] = ['awareness', 'delay', 'taper', 'cold_turkey']

export function PlanScreen() {
  const settings = usePouchlessStore((state) => state.settings)
  const saveSettings = usePouchlessStore((state) => state.saveSettings)
  const [saved, setSaved] = useState(false)

  const [quitMode, setQuitMode] = useState<QuitMode>(
    settings?.quitMode ?? 'delay',
  )
  const [dailyLimit, setDailyLimit] = useState(settings?.dailyLimit ?? 0)
  const [baseline, setBaseline] = useState(settings?.baselinePouchesPerDay ?? 0)
  const [strength, setStrength] = useState(settings?.pouchStrengthMg ?? 0)
  const [costPerCan, setCostPerCan] = useState(
    settings?.costPerCan?.toString() ?? '',
  )
  const [pouchesPerCan, setPouchesPerCan] = useState(
    settings?.pouchesPerCan ?? 15,
  )
  const [quitDate, setQuitDate] = useState(settings?.quitDate ?? '')

  if (!settings) {
    return null
  }

  const submit = async () => {
    await saveSettings({
      ...settings,
      quitMode,
      dailyLimit,
      baselinePouchesPerDay: baseline,
      pouchStrengthMg: strength,
      costPerCan: costPerCan ? Number(costPerCan) : undefined,
      pouchesPerCan,
      quitDate: quitDate || undefined,
      updatedAt: new Date().toISOString(),
    })
    setSaved(true)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-sm font-semibold text-teal-700">Quit plan</p>
        <h1 className="text-3xl font-semibold">{quitModeLabels[quitMode]}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {getPlanCopy(quitMode)}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Daily limit" value={dailyLimit} />
        <MetricCard label="Baseline" value={`${baseline}/day`} />
        <MetricCard label="Strength" value={`${strength} mg`} />
      </div>

      {saved ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-900">
          Plan saved locally.
        </p>
      ) : null}

      <Card>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
        >
          <Field label="Quit mode">
            <SelectInput
              value={quitMode}
              onChange={(event) => setQuitMode(event.currentTarget.value as QuitMode)}
            >
              {quitModes.map((mode) => (
                <option key={mode} value={mode}>
                  {quitModeLabels[mode]} - {quitModeDescriptions[mode]}
                </option>
              ))}
            </SelectInput>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Current daily limit">
              <TextInput
                min={0}
                required
                type="number"
                value={dailyLimit}
                onChange={(event) => setDailyLimit(Number(event.currentTarget.value))}
              />
            </Field>
            <Field label="Baseline pouches per day">
              <TextInput
                min={0}
                required
                type="number"
                value={baseline}
                onChange={(event) => setBaseline(Number(event.currentTarget.value))}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Usual strength in mg">
              <TextInput
                min={0}
                required
                step="0.5"
                type="number"
                value={strength}
                onChange={(event) => setStrength(Number(event.currentTarget.value))}
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
            <Field label="Cost per can" helper="Optional">
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

          <Button type="submit">
            <Save className="h-5 w-5" aria-hidden="true" />
            Save plan
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">What this mode means</h2>
        <ModeDetails mode={quitMode} baseline={baseline} />
      </Card>

      <DangerWindowManager />

      <p className="rounded-lg bg-teal-50 p-4 text-sm leading-6 text-teal-900">
        {medicalDisclaimer}
      </p>
    </div>
  )
}

function ModeDetails({ mode, baseline }: { mode: QuitMode; baseline: number }) {
  if (mode === 'awareness') {
    return (
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Learn when and why you use. No limit enforcement, just clear logging.
      </p>
    )
  }

  if (mode === 'delay') {
    return (
      <ol className="mt-3 space-y-2 text-sm text-slate-600">
        {[
          'Delay by 2 minutes',
          'Delay by 5 minutes',
          'Delay by 10 minutes',
          'Skip one pouch',
          'Move first pouch later',
          'Stay under daily limit',
          'Create one nicotine-free block',
        ].map((item, index) => (
          <li key={item} className="rounded-lg bg-slate-50 p-3">
            Day {index + 1}: {item}
          </li>
        ))}
      </ol>
    )
  }

  if (mode === 'taper') {
    const limits = [
      Math.max(0, Math.ceil(baseline * 0.75)),
      Math.max(0, Math.ceil(baseline * 0.5)),
      Math.max(0, Math.ceil(baseline * 0.25)),
      0,
    ]

    return (
      <ol className="mt-3 space-y-2 text-sm text-slate-600">
        {limits.map((limit, index) => (
          <li key={`${limit}-${index}`} className="rounded-lg bg-slate-50 p-3">
            Week {index + 1}: {limit}/day
          </li>
        ))}
      </ol>
    )
  }

  return (
    <p className="mt-3 text-sm leading-6 text-slate-600">
      Track nicotine-free time and cravings survived. A logged pouch is data for
      the next decision.
    </p>
  )
}
