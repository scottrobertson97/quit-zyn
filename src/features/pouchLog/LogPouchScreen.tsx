import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Field, SelectInput, TextArea, TextInput } from '../../components/FormField'
import { OptionButton } from '../../components/OptionButton'
import { usePouchlessStore } from '../../app/store'
import { triggerLabels, triggerOptions } from '../../domain/constants'
import { createId } from '../../domain/id'
import type { Trigger } from '../../domain/types'

export function LogPouchScreen() {
  const [searchParams] = useSearchParams()
  const settings = usePouchlessStore((state) => state.settings)
  const addPouchLog = usePouchlessStore((state) => state.addPouchLog)
  const initialTrigger = useMemo(() => {
    const trigger = searchParams.get('trigger')
    return triggerOptions.includes(trigger as Trigger)
      ? (trigger as Trigger)
      : 'stress'
  }, [searchParams])
  const [strength, setStrength] = useState(settings?.pouchStrengthMg ?? 6)
  const [trigger, setTrigger] = useState<Trigger>(initialTrigger)
  const [planned, setPlanned] = useState(searchParams.get('planned') === 'true')
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  if (!settings) {
    return null
  }

  const submit = async () => {
    await addPouchLog({
      id: createId('pouch'),
      timestamp: new Date().toISOString(),
      strengthMg: strength,
      trigger,
      planned,
      note: note.trim() || undefined,
    })
    setSaved(true)
    setNote('')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <p className="text-sm font-semibold text-teal-700">Quick log</p>
        <h1 className="text-3xl font-semibold">Log a pouch</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Logged. That is information, not a reset.
        </p>
      </div>

      {saved ? (
        <div
          className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-900"
          role="status"
        >
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          Saved locally. The dashboard is updated.
        </div>
      ) : null}

      <Card>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
        >
          <Field label="Strength in mg">
            <TextInput
              min={0}
              required
              step="0.5"
              type="number"
              value={strength}
              onChange={(event) => setStrength(Number(event.currentTarget.value))}
            />
          </Field>

          <Field label="Trigger">
            <SelectInput
              value={trigger}
              onChange={(event) => setTrigger(event.currentTarget.value as Trigger)}
            >
              {triggerOptions.map((option) => (
                <option key={option} value={option}>
                  {triggerLabels[option]}
                </option>
              ))}
            </SelectInput>
          </Field>

          <div>
            <p className="mb-3 text-sm font-semibold text-teal-950">
              Was this planned?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <OptionButton
                value="planned"
                selected={planned}
                onSelect={() => setPlanned(true)}
              >
                Planned
              </OptionButton>
              <OptionButton
                value="impulsive"
                selected={!planned}
                onSelect={() => setPlanned(false)}
              >
                Impulsive
              </OptionButton>
            </div>
          </div>

          <Field label="Note" helper="Optional">
            <TextArea
              value={note}
              onChange={(event) => setNote(event.currentTarget.value)}
              placeholder="What was happening around the urge?"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button size="lg" type="submit">
              Save log
            </Button>
            <Button to="/today" size="lg" variant="secondary">
              Back to Today
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
