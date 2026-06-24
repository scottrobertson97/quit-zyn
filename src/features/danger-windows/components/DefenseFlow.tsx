import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { CheckCircle2, TimerReset } from 'lucide-react'
import { Button } from '../../../components/Button'
import { Card } from '../../../components/Card'
import { Field, TextArea } from '../../../components/FormField'
import { usePouchlessStore } from '../../../app/store'
import { defenseActionCopy } from '../constants'

export function DefenseFlow() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const dangerWindow = usePouchlessStore((state) =>
    state.dangerWindows.find((item) => item.id === id),
  )
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [journalText, setJournalText] = useState('')

  const copy = dangerWindow
    ? defenseActionCopy[dangerWindow.defenseAction]
    : undefined

  useEffect(() => {
    if (!running || remaining <= 0) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [remaining, running])

  if (!dangerWindow || !copy) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <h1 className="text-xl font-semibold">Defense not found</h1>
          <p className="mt-2 text-sm text-slate-600">
            This danger window may have been disabled or removed.
          </p>
          <Button className="mt-4" to="/today">
            Back to Today
          </Button>
        </Card>
      </div>
    )
  }

  const start = searchParams.get('start')
  const end = searchParams.get('end')
  const startTimer = () => {
    setRemaining(copy.durationSeconds ?? 0)
    setRunning(Boolean(copy.durationSeconds))
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card>
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-teal-700">
              {dangerWindow.label}
            </p>
            <h1 className="text-3xl font-semibold">{copy.title}</h1>
            {start && end ? (
              <p className="mt-2 text-sm text-slate-500">
                This defense is linked to the current danger window occurrence.
              </p>
            ) : null}
          </div>

          <p className="text-sm leading-6 text-slate-600">{copy.body}</p>

          {copy.durationSeconds ? (
            <div className="rounded-lg bg-teal-50 p-5 text-center">
              <TimerReset className="mx-auto h-8 w-8 text-teal-700" />
              <p className="mt-3 text-5xl font-semibold tabular-nums text-teal-950">
                {formatTimer(running ? remaining : copy.durationSeconds)}
              </p>
            </div>
          ) : null}

          {dangerWindow.defenseAction === 'journal' ? (
            <Field label="Journal">
              <TextArea
                value={journalText}
                onChange={(event) => setJournalText(event.currentTarget.value)}
                placeholder="What are you actually asking the pouch to do for you right now?"
              />
            </Field>
          ) : null}

          {done ? (
            <p className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              Defense marked done. This does not complete the window check-in.
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {copy.durationSeconds ? (
              <Button onClick={startTimer}>{copy.actionLabel}</Button>
            ) : null}
            <Button
              variant={copy.durationSeconds ? 'secondary' : 'primary'}
              onClick={() => setDone(true)}
            >
              {copy.durationSeconds ? 'Mark Done' : copy.actionLabel}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/today')}>
              Back to Today
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${`${remainder}`.padStart(2, '0')}`
}
