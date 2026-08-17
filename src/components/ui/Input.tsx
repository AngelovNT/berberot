'use client'

import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-charcoal">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full rounded-xl border px-4 py-3.5 text-sm text-charcoal placeholder-charcoal-200
          focus:outline-none focus:ring-2 focus:ring-charcoal/10 focus:border-charcoal
          hover:border-charcoal-200 transition-colors
          ${error ? 'border-soft-red bg-soft-red-light' : 'border-border-warm bg-white'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-soft-red mt-0.5">{error}</p>}
    </div>
  )
}
