import { Card } from '../../../components/Card'
import { MetricCard } from '../../../components/MetricCard'
import { defenseActionLabels } from '../constants'
import type { DangerWindow, DangerWindowCheckIn } from '../types'
import { getDangerWindowStats } from '../utils/dangerWindowTime'

type DangerWindowStatsProps = {
  windows: DangerWindow[]
  checkIns: DangerWindowCheckIn[]
}

export function DangerWindowStats({
  windows,
  checkIns,
}: DangerWindowStatsProps) {
  const stats = getDangerWindowStats(windows, checkIns)
  const windowById = new Map(windows.map((window) => [window.id, window]))
  const bestWindow = stats.bestWindowId
    ? windowById.get(stats.bestWindowId)
    : undefined
  const hardestWindow = stats.hardestWindowId
    ? windowById.get(stats.hardestWindowId)
    : undefined

  return (
    <Card>
      <h2 className="text-xl font-semibold">Danger Windows</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Delayed counts as control in the story, but protection rate only counts
        protected windows.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Checked in" value={stats.totalCheckIns} />
        <MetricCard label="Protected" value={stats.protectedCount} />
        <MetricCard label="Delayed" value={stats.delayedCount} />
        <MetricCard label="Used" value={stats.usedCount} />
        <MetricCard
          label="Protection rate"
          value={`${Math.round(stats.protectionRate * 100)}%`}
        />
        <MetricCard
          label="Most helpful defense"
          value={
            stats.mostHelpfulDefense
              ? defenseActionLabels[stats.mostHelpfulDefense]
              : 'No data'
          }
        />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MetricCard
          label="Best window"
          value={bestWindow?.label ?? 'No data'}
        />
        <MetricCard
          label="Hardest window"
          value={hardestWindow?.label ?? 'No data'}
        />
      </div>
    </Card>
  )
}
