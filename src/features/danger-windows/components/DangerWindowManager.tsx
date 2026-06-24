import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../../components/Button'
import { Card } from '../../../components/Card'
import { EmptyState } from '../../../components/EmptyState'
import { usePouchlessStore } from '../../../app/store'
import {
  dangerWindowGoalLabels,
  dayLabels,
  defenseActionLabels,
} from '../constants'
import type { DangerWindow } from '../types'
import {
  findOverlappingDangerWindow,
  formatDangerWindowTimeRange,
} from '../utils/dangerWindowTime'
import { DangerWindowForm } from './DangerWindowForm'

export function DangerWindowManager() {
  const windows = usePouchlessStore((state) => state.dangerWindows)
  const saveDangerWindow = usePouchlessStore((state) => state.saveDangerWindow)
  const [editingId, setEditingId] = useState<string>()
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState('')

  const editingWindow = windows.find((window) => window.id === editingId)

  const toggleActive = async (window: DangerWindow) => {
    setMessage('')
    const nextWindow = {
      ...window,
      isActive: !window.isActive,
      updatedAt: new Date().toISOString(),
    }

    if (nextWindow.isActive) {
      const overlap = findOverlappingDangerWindow(nextWindow, windows)
      if (overlap) {
        setMessage(`Cannot enable because it overlaps with ${overlap.label}.`)
        return
      }
    }

    await saveDangerWindow(nextWindow)
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Danger Windows</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Protect specific fragile parts of the day instead of trying to solve
            the whole day at once.
          </p>
        </div>
        {!creating && !editingWindow ? (
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-5 w-5" aria-hidden="true" />
            Create
          </Button>
        ) : null}
      </div>

      {message ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
          {message}
        </p>
      ) : null}

      {creating || editingWindow ? (
        <div className="mt-5 rounded-lg bg-slate-50 p-4">
          <DangerWindowForm
            existingWindow={editingWindow}
            onDone={() => {
              setCreating(false)
              setEditingId(undefined)
              setMessage('')
            }}
          />
        </div>
      ) : null}

      {windows.length === 0 && !creating ? (
        <div className="mt-5">
          <EmptyState title="No danger windows yet">
            Create one for the part of the day when you usually reach for a
            pouch.
          </EmptyState>
        </div>
      ) : null}

      {windows.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {windows.map((window) => (
            <li
              key={window.id}
              className="rounded-lg border border-teal-100 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-teal-950">
                      {window.label}
                    </h3>
                    <span
                      className={[
                        'rounded-full px-2 py-1 text-xs font-semibold',
                        window.isActive
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-slate-100 text-slate-500',
                      ].join(' ')}
                    >
                      {window.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {formatDangerWindowTimeRange(window)} on{' '}
                    {window.daysOfWeek.map((day) => dayLabels[day]).join(', ')}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Goal: {dangerWindowGoalLabels[window.goal]} | Defense:{' '}
                    {defenseActionLabels[window.defenseAction]}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setCreating(false)
                      setEditingId(window.id)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={window.isActive ? 'danger' : 'secondary'}
                    onClick={() => void toggleActive(window)}
                  >
                    {window.isActive ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  )
}
