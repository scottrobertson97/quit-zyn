import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Button } from '../../../components/Button'
import { Card } from '../../../components/Card'
import { EmptyState } from '../../../components/EmptyState'
import { Field, SelectInput, TextArea } from '../../../components/FormField'
import { usePouchlessStore } from '../../../app/store'
import { createId } from '../../../domain/id'
import { triggerLabels } from '../../../domain/constants'
import type { Trigger } from '../../../domain/types'
import {
  dangerWindowGoalLabels,
  dangerWindowOutcomeLabels,
  defenseActionLabels,
} from '../constants'
import type {
  DangerWindowOccurrence,
  DangerWindowOutcome,
} from '../types'
import {
  formatDangerWindowEnd,
  formatDangerWindowTimeRange,
  getActiveDangerWindow,
  getNextDangerWindow,
  getPendingCheckIn,
} from '../utils/dangerWindowTime'

const checkInTriggers: Trigger[] = [
  'stress',
  'boredom',
  'focus',
  'driving',
  'after_food',
  'habit_autopilot',
  'social',
  'other',
]

export function DangerWindowTodaySection() {
  const windows = usePouchlessStore((state) => state.dangerWindows)
  const checkIns = usePouchlessStore((state) => state.dangerWindowCheckIns)
  const now = new Date()
  const pending = getPendingCheckIn(windows, checkIns, now)
  const active = getActiveDangerWindow(windows, now)
  const next = getNextDangerWindow(windows, now)
  const [manualCheckIn, setManualCheckIn] =
    useState<DangerWindowOccurrence | null>(null)

  if (manualCheckIn) {
    return (
      <DangerWindowCheckInForm
        occurrence={manualCheckIn}
        onDone={() => setManualCheckIn(null)}
      />
    )
  }

  if (pending) {
    return <DangerWindowCheckInForm occurrence={pending} />
  }

  if (active) {
    return (
      <DangerWindowCard
        mode="active"
        occurrence={active}
        onCheckIn={() => setManualCheckIn(active)}
      />
    )
  }

  if (next) {
    return <DangerWindowCard mode="upcoming" occurrence={next} />
  }

  return (
    <Card>
      <EmptyState title="Danger Windows">
        Most slips are not random. They happen in repeatable moments. Create a
        danger window for the part of the day when you usually reach for a
        pouch.
      </EmptyState>
      <Button className="mt-4 w-full" to="/plan" variant="secondary">
        Create Danger Window
      </Button>
    </Card>
  )
}

function DangerWindowCard({
  mode,
  occurrence,
  onCheckIn,
}: {
  mode: 'active' | 'upcoming'
  occurrence: DangerWindowOccurrence
  onCheckIn?: () => void
}) {
  const window = occurrence.window
  const defensePath = `/danger-windows/${window.id}/defense?start=${encodeURIComponent(
    occurrence.windowStartAt,
  )}&end=${encodeURIComponent(occurrence.windowEndAt)}`

  return (
    <Card>
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-1 h-6 w-6 text-teal-700" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-teal-700">
            {mode === 'active' ? 'Active Danger Window' : 'Next Danger Window'}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{window.label}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {mode === 'active'
              ? `Ends at ${formatDangerWindowEnd(occurrence)}`
              : formatDangerWindowTimeRange(occurrence)}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-teal-50 p-3">
              <p className="text-xs font-semibold uppercase text-teal-700">
                Goal
              </p>
              <p className="mt-1 text-sm font-semibold text-teal-950">
                {dangerWindowGoalLabels[window.goal]}
              </p>
            </div>
            <div className="rounded-lg bg-teal-50 p-3">
              <p className="text-xs font-semibold uppercase text-teal-700">
                Defense
              </p>
              <p className="mt-1 text-sm font-semibold text-teal-950">
                {defenseActionLabels[window.defenseAction]}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {mode === 'active'
              ? 'This is the window. Your job is to create space before acting.'
              : 'Your next danger window is coming up. Protect this window.'}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Button to={defensePath}>Start Defense</Button>
            {mode === 'active' ? (
              <>
                <Button to="/log" variant="secondary">
                  Log Pouch
                </Button>
                <Button variant="secondary" onClick={onCheckIn}>
                  Complete Window
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  )
}

function DangerWindowCheckInForm({
  occurrence,
  onDone,
}: {
  occurrence: DangerWindowOccurrence
  onDone?: () => void
}) {
  const addDangerWindowCheckIn = usePouchlessStore(
    (state) => state.addDangerWindowCheckIn,
  )
  const [outcome, setOutcome] = useState<DangerWindowOutcome>('protected')
  const [trigger, setTrigger] = useState('')
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  const submit = async () => {
    await addDangerWindowCheckIn({
      id: createId('danger_checkin'),
      dangerWindowId: occurrence.window.id,
      windowStartAt: occurrence.windowStartAt,
      windowEndAt: occurrence.windowEndAt,
      checkedInAt: new Date().toISOString(),
      outcome,
      trigger: trigger ? (trigger as Trigger) : undefined,
      note: note.trim() || undefined,
    })
    setSaved(true)
    onDone?.()
  }

  if (saved) {
    return null
  }

  return (
    <Card>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <div>
          <p className="text-sm font-semibold text-teal-700">
            Danger Window Complete
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {occurrence.window.label} ended at{' '}
            {formatDangerWindowEnd(occurrence)}
          </h2>
          <p className="mt-2 text-sm text-slate-600">How did it go?</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(dangerWindowOutcomeLabels).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setOutcome(value as DangerWindowOutcome)}
              className={[
                'rounded-lg border px-3 py-3 text-left text-sm font-semibold',
                outcome === value
                  ? 'border-teal-700 bg-teal-700 text-white'
                  : 'border-teal-200 bg-white text-teal-950',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        <Field label="What happened?" helper="Optional">
          <SelectInput
            value={trigger}
            onChange={(event) => setTrigger(event.currentTarget.value)}
          >
            <option value="">No trigger selected</option>
            {checkInTriggers.map((option) => (
              <option key={option} value={option}>
                {triggerLabels[option]}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field label="Note for next time" helper="Optional">
          <TextArea
            value={note}
            onChange={(event) => setNote(event.currentTarget.value)}
          />
        </Field>

        <Button type="submit">Save check-in</Button>
      </form>
    </Card>
  )
}
