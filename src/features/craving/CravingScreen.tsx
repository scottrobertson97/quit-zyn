import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { CheckCircle2, Hourglass, RotateCcw, TimerReset } from 'lucide-react'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { OptionButton } from '../../components/OptionButton'
import { Field, TextArea } from '../../components/FormField'
import { usePouchlessStore } from '../../app/store'
import {
  interventionLabels,
  triggerLabels,
  triggerOptions,
} from '../../domain/constants'
import { supportiveMessages, suggestIntervention } from '../../domain/copy'
import { createId } from '../../domain/id'
import type { CravingLog, CravingOutcome, Trigger } from '../../domain/types'

type Stage = 'intensity' | 'trigger' | 'timer' | 'result'

const delaySeconds = Number(import.meta.env.VITE_CRAVING_DELAY_SECONDS ?? 300)

export function CravingScreen() {
  const navigate = useNavigate()
  const addCravingLog = usePouchlessStore((state) => state.addCravingLog)
  const updateCravingLog = usePouchlessStore((state) => state.updateCravingLog)
  const settings = usePouchlessStore((state) => state.settings)
  const [stage, setStage] = useState<Stage>('intensity')
  const [intensity, setIntensity] = useState(5)
  const [trigger, setTrigger] = useState<Trigger>('stress')
  const [note, setNote] = useState('')
  const [remaining, setRemaining] = useState(delaySeconds)
  const [activeLog, setActiveLog] = useState<CravingLog>()
  const [outcome, setOutcome] = useState<CravingOutcome>()

  const intervention = useMemo(
    () => suggestIntervention(trigger, intensity),
    [trigger, intensity],
  )

  useEffect(() => {
    if (stage !== 'timer' || remaining <= 0) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [remaining, stage])

  if (!settings) {
    return null
  }

  const startTimer = async () => {
    const log: CravingLog = {
      id: createId('craving'),
      startedAt: new Date().toISOString(),
      intensity,
      trigger,
      outcome: 'still_waiting',
      intervention,
      note: note.trim() || undefined,
    }
    await addCravingLog(log)
    setActiveLog(log)
    setRemaining(delaySeconds)
    setStage('timer')
  }

  const finish = async (nextOutcome: CravingOutcome) => {
    if (!activeLog) {
      return
    }

    const updated: CravingLog = {
      ...activeLog,
      endedAt: new Date().toISOString(),
      outcome: nextOutcome,
    }
    await updateCravingLog(updated)
    setActiveLog(updated)
    setOutcome(nextOutcome)
    setStage('result')
  }

  const keepWaiting = () => {
    setRemaining(delaySeconds)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <p className="text-sm font-semibold text-teal-700">Craving mode</p>
        <h1 className="text-3xl font-semibold">Create a little space</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          You are not saying never. You are saying not automatically.
        </p>
      </div>

      {stage === 'intensity' ? (
        <Card>
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold">
                How strong is the urge?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Pick the number that fits right now.
              </p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }, (_, index) => index + 1).map(
                (value) => (
                  <OptionButton
                    key={value}
                    value={`${value}`}
                    selected={intensity === value}
                    onSelect={() => setIntensity(value)}
                  >
                    <span className="block text-center text-base">{value}</span>
                  </OptionButton>
                ),
              )}
            </div>
            <Button className="w-full" size="lg" onClick={() => setStage('trigger')}>
              Continue
            </Button>
          </div>
        </Card>
      ) : null}

      {stage === 'trigger' ? (
        <Card>
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold">What is around it?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This helps turn the urge into useful data.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {triggerOptions.map((option) => (
                <OptionButton
                  key={option}
                  value={option}
                  selected={trigger === option}
                  onSelect={setTrigger}
                >
                  {triggerLabels[option]}
                </OptionButton>
              ))}
            </div>
            <Field label="One sentence" helper="Optional">
              <TextArea
                value={note}
                onChange={(event) => setNote(event.currentTarget.value)}
                placeholder="What does this craving want?"
              />
            </Field>
            <div className="rounded-lg bg-teal-50 p-4">
              <p className="text-sm font-semibold text-teal-950">
                Try this first
              </p>
              <p className="mt-1 text-lg font-semibold text-teal-800">
                {interventionLabels[intervention]}
              </p>
            </div>
            <Button className="w-full" size="lg" onClick={() => void startTimer()}>
              <TimerReset className="h-5 w-5" aria-hidden="true" />
              Start five minutes
            </Button>
          </div>
        </Card>
      ) : null}

      {stage === 'timer' ? (
        <Card className="text-center">
          <div className="space-y-5">
            <Hourglass className="mx-auto h-10 w-10 text-teal-700" />
            <div>
              <p className="text-sm font-semibold text-teal-700">
                {interventionLabels[intervention]}
              </p>
              <p className="mt-2 text-6xl font-semibold tabular-nums text-teal-950">
                {formatTimer(remaining)}
              </p>
            </div>
            <p className="mx-auto max-w-sm text-sm leading-6 text-slate-600">
              {supportiveMessages[1]}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => void finish('skipped')}
              >
                I skipped it
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => void finish('used')}
              >
                I used one
              </Button>
              <Button size="lg" variant="ghost" onClick={keepWaiting}>
                <RotateCcw className="h-5 w-5" aria-hidden="true" />
                Keep waiting
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {stage === 'result' ? (
        <Card>
          <div className="space-y-5">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            <div>
              <h2 className="text-xl font-semibold">
                {outcome === 'skipped' ? 'You created space.' : 'Logged as data.'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {outcome === 'skipped'
                  ? 'That urge passed through without getting the final word.'
                  : 'One pouch does not erase the pattern you are building.'}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {outcome === 'used' ? (
                <Button
                  size="lg"
                  to={`/log?trigger=${trigger}&planned=false`}
                >
                  Log pouch now
                </Button>
              ) : null}
              <Button
                size="lg"
                variant={outcome === 'used' ? 'secondary' : 'primary'}
                onClick={() => navigate('/today')}
              >
                Back to Today
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {stage !== 'result' ? (
        <Button className="w-full" variant="ghost" onClick={() => navigate('/today')}>
          Exit craving mode
        </Button>
      ) : null}
    </div>
  )
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${`${remainder}`.padStart(2, '0')}`
}
