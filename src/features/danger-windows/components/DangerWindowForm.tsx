import { useState } from 'react'
import { Button } from '../../../components/Button'
import { Field, SelectInput, TextArea, TextInput } from '../../../components/FormField'
import { OptionButton } from '../../../components/OptionButton'
import { usePouchlessStore } from '../../../app/store'
import { createId } from '../../../domain/id'
import {
  dangerWindowGoalLabels,
  dayLabels,
  dayOptions,
  defenseActionLabels,
} from '../constants'
import type {
  DangerWindow,
  DangerWindowGoal,
  DayOfWeek,
  DefenseAction,
} from '../types'
import {
  findOverlappingDangerWindow,
  validateDangerWindowTime,
} from '../utils/dangerWindowTime'

const goalOptions: DangerWindowGoal[] = [
  'no_pouch',
  'delay_first',
  'stay_under_limit',
]

const defenseOptions: DefenseAction[] = [
  'water',
  'walk',
  'gum',
  'breathing',
  'snack',
  'brush_teeth',
  'journal',
  'leave_room',
]

type DangerWindowFormProps = {
  existingWindow?: DangerWindow
  onDone: () => void
}

export function DangerWindowForm({
  existingWindow,
  onDone,
}: DangerWindowFormProps) {
  const windows = usePouchlessStore((state) => state.dangerWindows)
  const saveDangerWindow = usePouchlessStore((state) => state.saveDangerWindow)
  const [label, setLabel] = useState(existingWindow?.label ?? '')
  const [startTime, setStartTime] = useState(existingWindow?.startTime ?? '14:00')
  const [endTime, setEndTime] = useState(existingWindow?.endTime ?? '16:00')
  const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>(
    existingWindow?.daysOfWeek ?? [1, 2, 3, 4, 5],
  )
  const [goal, setGoal] = useState<DangerWindowGoal>(
    existingWindow?.goal ?? 'delay_first',
  )
  const [defenseAction, setDefenseAction] = useState<DefenseAction>(
    existingWindow?.defenseAction ?? 'walk',
  )
  const [reason, setReason] = useState(existingWindow?.reason ?? '')
  const [error, setError] = useState('')

  const toggleDay = (day: DayOfWeek) => {
    setDaysOfWeek((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day],
    )
  }

  const submit = async () => {
    const trimmedLabel = label.trim()
    if (!trimmedLabel) {
      setError('Label is required.')
      return
    }

    if (daysOfWeek.length === 0) {
      setError('Choose at least one repeat day.')
      return
    }

    const timeError = validateDangerWindowTime(startTime, endTime)
    if (timeError) {
      setError(timeError)
      return
    }

    const now = new Date().toISOString()
    const candidate: DangerWindow = {
      id: existingWindow?.id ?? createId('danger_window'),
      label: trimmedLabel,
      startTime,
      endTime,
      daysOfWeek: [...daysOfWeek].sort((first, second) => first - second),
      goal,
      defenseAction,
      reason: reason.trim() || undefined,
      isActive: existingWindow?.isActive ?? true,
      createdAt: existingWindow?.createdAt ?? now,
      updatedAt: now,
    }

    const overlap = findOverlappingDangerWindow(candidate, windows)
    if (overlap) {
      setError(`This overlaps with ${overlap.label}. Adjust the time or days.`)
      return
    }

    await saveDangerWindow(candidate)
    onDone()
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800">
          {error}
        </p>
      ) : null}

      <Field label="Label">
        <TextInput
          required
          value={label}
          onChange={(event) => setLabel(event.currentTarget.value)}
          placeholder="Work Crash"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start time">
          <TextInput
            required
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.currentTarget.value)}
          />
        </Field>
        <Field label="End time">
          <TextInput
            required
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.currentTarget.value)}
          />
        </Field>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-teal-950">Repeats on</p>
        <div className="grid grid-cols-7 gap-2">
          {dayOptions.map((day) => (
            <OptionButton
              key={day}
              value={`${day}`}
              selected={daysOfWeek.includes(day)}
              onSelect={() => toggleDay(day)}
            >
              <span className="block text-center">{dayLabels[day]}</span>
            </OptionButton>
          ))}
        </div>
      </div>

      <Field label="Goal">
        <SelectInput
          value={goal}
          onChange={(event) =>
            setGoal(event.currentTarget.value as DangerWindowGoal)
          }
        >
          {goalOptions.map((option) => (
            <option key={option} value={option}>
              {dangerWindowGoalLabels[option]}
            </option>
          ))}
        </SelectInput>
      </Field>

      <Field label="Defense action">
        <SelectInput
          value={defenseAction}
          onChange={(event) =>
            setDefenseAction(event.currentTarget.value as DefenseAction)
          }
        >
          {defenseOptions.map((option) => (
            <option key={option} value={option}>
              {defenseActionLabels[option]}
            </option>
          ))}
        </SelectInput>
      </Field>

      <Field label="Why is this window dangerous?" helper="Optional">
        <TextArea
          value={reason}
          onChange={(event) => setReason(event.currentTarget.value)}
          placeholder="I usually crash after lunch and want one before getting back to work."
        />
      </Field>

      <div className="flex flex-wrap gap-3">
        <Button type="submit">
          {existingWindow ? 'Save danger window' : 'Create danger window'}
        </Button>
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
