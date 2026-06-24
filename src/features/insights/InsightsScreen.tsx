import { BarChart3 } from 'lucide-react'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { MetricCard } from '../../components/MetricCard'
import { usePouchlessStore } from '../../app/store'
import { getPouchesUsedToday } from '../../domain/calculations'
import {
  getAverageCravingIntensity,
  getCravingOutcomeRate,
  getHighestRiskTimeWindow,
  getMostCommonTrigger,
  getPlannedVsImpulsiveRatio,
  getPouchesUsedThisWeek,
} from '../../domain/insightEngine'
import { triggerLabels } from '../../domain/constants'
import { DangerWindowStats } from '../danger-windows/components/DangerWindowStats'

const riskWindowLabels = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
}

export function InsightsScreen() {
  const pouchLogs = usePouchlessStore((state) => state.pouchLogs)
  const cravingLogs = usePouchlessStore((state) => state.cravingLogs)
  const dangerWindows = usePouchlessStore((state) => state.dangerWindows)
  const dangerWindowCheckIns = usePouchlessStore(
    (state) => state.dangerWindowCheckIns,
  )
  const totalEvents = pouchLogs.length + cravingLogs.length
  const mostCommonTrigger = getMostCommonTrigger(cravingLogs, pouchLogs)
  const riskWindow = getHighestRiskTimeWindow(cravingLogs, pouchLogs)
  const outcomes = getCravingOutcomeRate(cravingLogs)
  const averageIntensity = getAverageCravingIntensity(cravingLogs)
  const plannedRatio = getPlannedVsImpulsiveRatio(pouchLogs)

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <p className="text-sm font-semibold text-teal-700">Insights</p>
        <h1 className="text-3xl font-semibold">Patterns, not verdicts</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Pouchless keeps these local and avoids big claims from small samples.
        </p>
      </div>

      {totalEvents < 3 ? (
        <EmptyState title="Patterns need a little more data">
          Log a few cravings and pouches. Patterns usually appear after 3-5
          days.
        </EmptyState>
      ) : (
        <p className="rounded-lg bg-teal-50 p-3 text-sm text-teal-900">
          Emerging pattern. This is useful signal, not medical certainty.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Pouches today" value={getPouchesUsedToday(pouchLogs)} />
        <MetricCard label="Pouches this week" value={getPouchesUsedThisWeek(pouchLogs)} />
        <MetricCard label="Average intensity" value={averageIntensity || 'No data'} />
        <MetricCard
          label="Most common trigger"
          value={
            mostCommonTrigger
              ? triggerLabels[mostCommonTrigger.trigger]
              : 'No data'
          }
          helper={mostCommonTrigger ? `${mostCommonTrigger.count} events` : undefined}
        />
        <MetricCard
          label="Highest-risk window"
          value={riskWindow ? riskWindowLabels[riskWindow.window] : 'No data'}
          helper={riskWindow ? `${riskWindow.count} events` : undefined}
        />
        <MetricCard
          label="Cravings skipped"
          value={`${outcomes.skipped}/${outcomes.skipped + outcomes.used}`}
          helper={
            outcomes.skipped + outcomes.used > 0
              ? `${Math.round(outcomes.skippedRate * 100)}% of completed cravings`
              : 'No completed cravings yet'
          }
        />
      </div>

      <Card>
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-teal-700" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Planned vs impulsive use</h2>
        </div>
        {plannedRatio.total === 0 ? (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Pouch logs will show whether use is mostly planned or automatic.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MetricCard label="Planned" value={plannedRatio.planned} />
            <MetricCard label="Impulsive" value={plannedRatio.impulsive} />
          </div>
        )}
      </Card>

      <DangerWindowStats
        windows={dangerWindows}
        checkIns={dangerWindowCheckIns}
      />
    </div>
  )
}
