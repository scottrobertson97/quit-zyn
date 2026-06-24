import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

type FieldProps = {
  label: string
  helper?: ReactNode
  children: ReactNode
}

export function Field({ label, helper, children }: FieldProps) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-teal-950">{label}</span>
      <span className="mt-2 block">{children}</span>
      {helper ? <span className="mt-2 block text-sm text-slate-500">{helper}</span> : null}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        'min-h-12 w-full rounded-lg border border-teal-200 bg-white px-3 text-teal-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100',
        props.className ?? '',
      ].join(' ')}
    />
  )
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        'min-h-12 w-full rounded-lg border border-teal-200 bg-white px-3 text-teal-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100',
        props.className ?? '',
      ].join(' ')}
    />
  )
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={[
        'min-h-28 w-full resize-y rounded-lg border border-teal-200 bg-white px-3 py-3 text-teal-950 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100',
        props.className ?? '',
      ].join(' ')}
    />
  )
}
