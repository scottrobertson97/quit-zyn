import { Link } from 'react-router'
import { Clock, Plus, TimerReset } from 'lucide-react'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { MetricCard } from '../../components/MetricCard'
import { ProgressBar } from '../../components/ProgressBar'
import { usePouchlessStore } from '../../app/store'
import {
  getEstimatedAvoidedPouches,
  getEstimatedMoneySaved,
  getCravingsForDate,
  getNicotineMgToday,
  getPouchesUsedToday,
  getRemainingDailyPouches,
  getTimeSinceLastPouch,
} from '../../domain/calculations'
import { formatTimeOfDay } from '../../domain/date'
import { supportiveMessages } from '../../domain/copy'
import { triggerLabels } from '../../domain/constants'
import { DangerWindowTodaySection } from '../danger-windows/components/DangerWindowTodaySection'

export function TodayScreen() {
  const settings = usePouchlessStore((state) => state.settings)
  const pouchLogs = usePouchlessStore((state) => state.pouchLogs)
  const cravingLogs = usePouchlessStore((state) => state.cravingLogs)

  if (!settings) {
    return null
  }

  const pouchesToday = getPouchesUsedToday(pouchLogs)
  const nicotineToday = getNicotineMgToday(pouchLogs)
  const remaining = getRemainingDailyPouches(settings, pouchLogs)
  const sinceLast = getTimeSinceLastPouch(pouchLogs)
  const avoided = getEstimatedAvoidedPouches(settings, pouchLogs)
  const moneySaved = getEstimatedMoneySaved(settings, cravingLogs)
  const completedCravingsToday = getCravingsForDate(cravingLogs).length
  const recentLogs = pouchLogs.slice(0, 3)

  return (
    <div className="space-y-5">
      <section className="rounded-xl bg-teal-800 p-5 text-white shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-teal-100">
              Time since last pouch
            </p>
            <h1 className="mt-2 text-4xl font-semibold">{sinceLast.label}</h1>
            {sinceLast.lastTimestamp ? (
              <p className="mt-2 text-sm text-teal-100">
                Last logged at {formatTimeOfDay(sinceLast.lastTimestamp)}
              </p>
            ) : (
              <p className="mt-2 text-sm text-teal-100">
                Your first log will start the clock.
              </p>
            )}
          </div>
          <Clock className="h-9 w-9 text-teal-100" aria-hidden="true" />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Pouches today" value={pouchesToday} />
        <MetricCard label="Daily limit" value={settings.dailyLimit} />
        <MetricCard label="Remaining" value={remaining} />
        <MetricCard label="Nicotine today" value={`${nicotineToday} mg`} />
      </div>

      <Card>
        <div className="space-y-4">
          <ProgressBar
            label="Daily limit"
            value={pouchesToday}
            max={Math.max(settings.dailyLimit, pouchesToday)}
          />
          <p className="text-sm leading-6 text-slate-600">
            {supportiveMessages[0]}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button to="/craving" size="lg">
              <TimerReset className="h-5 w-5" aria-hidden="true" />
              I want one
            </Button>
            <Button to="/log" size="lg" variant="secondary">
              <Plus className="h-5 w-5" aria-hidden="true" />
              Log pouch
            </Button>
          </div>
        </div>
      </Card>

      <DangerWindowTodaySection />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Pouches avoided" value={avoided} />
        <MetricCard label="Estimated saved" value={formatCurrency(moneySaved)} />
        <MetricCard label="Cravings logged" value={completedCravingsToday} />
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Recent pouch logs</h2>
          <Link className="text-sm font-semibold text-teal-700" to="/log">
            Add
          </Link>
        </div>
        {recentLogs.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Nothing logged yet today. That is simply the current data.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recentLogs.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm"
              >
                <span>
                  <span className="font-semibold text-teal-950">
                    {formatTimeOfDay(log.timestamp)}
                  </span>
                  <span className="ml-2 text-slate-500">
                    {log.trigger ? triggerLabels[log.trigger] : 'No trigger'}
                  </span>
                </span>
                <span className="text-slate-500">{log.strengthMg} mg</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}
