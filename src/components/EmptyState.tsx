import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  children: ReactNode
}

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-teal-200 bg-teal-50/60 p-5 text-center">
      <h2 className="text-lg font-semibold text-teal-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-teal-800">{children}</p>
    </div>
  )
}
