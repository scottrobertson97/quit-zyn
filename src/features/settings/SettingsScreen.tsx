import { useNavigate } from 'react-router'
import { Trash2 } from 'lucide-react'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { usePouchlessStore } from '../../app/store'
import { medicalDisclaimer } from '../../domain/constants'

export function SettingsScreen() {
  const navigate = useNavigate()
  const resetAll = usePouchlessStore((state) => state.resetAll)

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
