type ProgressBarProps = {
  value: number
  max: number
  label: string
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-teal-950">{label}</span>
        <span className="text-slate-500">
          {value}/{max}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-teal-50">
        <div
          className="h-full rounded-full bg-teal-600 transition-[width]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
