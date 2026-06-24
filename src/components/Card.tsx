import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <section
      className={[
        'rounded-lg border border-teal-100 bg-white p-4 shadow-sm',
        className,
      ].join(' ')}
    >
      {children}
    </section>
  )
}
