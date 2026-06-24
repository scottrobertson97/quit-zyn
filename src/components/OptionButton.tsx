import type { ReactNode } from 'react'

type OptionButtonProps<T extends string> = {
  value: T
  selected: boolean
  children: ReactNode
  onSelect: (value: T) => void
}

export function OptionButton<T extends string>({
  value,
  selected,
  children,
  onSelect,
}: OptionButtonProps<T>) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={[
        'min-h-12 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700',
        selected
          ? 'border-teal-700 bg-teal-700 text-white shadow-sm'
          : 'border-teal-200 bg-white text-teal-950 hover:bg-teal-50',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
