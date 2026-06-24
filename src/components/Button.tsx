import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  to?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-teal-700 text-white shadow-sm hover:bg-teal-800',
  secondary:
    'border border-teal-200 bg-white text-teal-900 shadow-sm hover:bg-teal-50',
  ghost: 'text-teal-800 hover:bg-teal-50',
  danger:
    'border border-rose-200 bg-white text-rose-800 shadow-sm hover:bg-rose-50',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3 text-sm',
  md: 'min-h-12 px-4 text-base',
  lg: 'min-h-14 px-5 text-lg',
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  to,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ')

  if (to) {
    return (
      <Link className={classes} to={to}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  )
}
