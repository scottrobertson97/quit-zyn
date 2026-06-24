import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Save, Trash2 } from 'lucide-react'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Field, TextInput } from '../../components/FormField'
import { usePouchlessStore } from '../../app/store'
import { medicalDisclaimer } from '../../domain/constants'
import { POUCHES_PER_CAN_FOR_SAVINGS } from '../../domain/calculations'

export function SettingsScreen() {
  const navigate = useNavigate()
  const settings = usePouchlessStore((state) => state.settings)
  const saveSettings = usePouchlessStore((state) => state.saveSettings)
  const resetAll = usePouchlessStore((state) => state.resetAll)
  const [costPerCan, setCostPerCan] = useState(
    settings?.costPerCan?.toString() ?? '',
  )
  const [saved, setSaved] = useState(false)

  if (!settings) {
    return null
  }

  const saveSavings = async () => {
    await saveSettings({
      ...settings,
      costPerCan: costPerCan ? Number(costPerCan) : undefined,
      updatedAt: new Date().toISOString(),
    })
    setSaved(true)
  }

  const reset = async () => {
    const confirmed = window.confirm(
      'Reset all local Pouchless data in this browser?',
    )

    if (!confirmed) {
      return
    }

    await resetAll()
    navigate('/onboarding', { replace: true })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <p className="text-sm font-semibold text-teal-700">Settings</p>
        <h1 className="text-3xl font-semibold">Local app settings</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Pouchless stores logs in this browser using IndexedDB.
        </p>
      </div>

      <Card>
        <h2 className="text-xl font-semibold">Privacy</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          No account is created. No server sync is included in this MVP. Clearing
          browser storage or resetting below removes your local data.
        </p>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Savings estimate</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Each skipped pouch counts as 1/{POUCHES_PER_CAN_FOR_SAVINGS} of a can.
        </p>
        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            void saveSavings()
          }}
        >
          <Field label="Estimated cost per can">
            <TextInput
              min={0}
              step="0.01"
              type="number"
              value={costPerCan}
              onChange={(event) => {
                setCostPerCan(event.currentTarget.value)
                setSaved(false)
              }}
            />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit">
              <Save className="h-5 w-5" aria-hidden="true" />
              Save cost
            </Button>
            {saved ? (
              <p className="text-sm font-medium text-emerald-700">
                Savings estimate updated.
              </p>
            ) : null}
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Behavioral support</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {medicalDisclaimer}
        </p>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold">Reset local data</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This clears onboarding, pouch logs, craving logs, and journal entries
          from this browser.
        </p>
        <Button className="mt-4" variant="danger" onClick={() => void reset()}>
          <Trash2 className="h-5 w-5" aria-hidden="true" />
          Reset data
        </Button>
      </Card>
    </div>
  )
}
