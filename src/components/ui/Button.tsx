'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import Spinner from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'brass' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  children: ReactNode
}

const variantClasses = {
  primary:   'bg-charcoal text-white hover:bg-charcoal-800 shadow-sm hover:shadow-md disabled:opacity-50',
  secondary: 'bg-white text-charcoal border border-border-warm hover:bg-ivory disabled:opacity-50',
  brass:     'bg-brass text-white hover:bg-brass-dark shadow-sm hover:shadow-md disabled:opacity-50',
  danger:    'bg-soft-red text-white hover:opacity-90 disabled:opacity-50',
  ghost:     'bg-transparent text-charcoal hover:bg-charcoal-50 disabled:opacity-50',
}

const sizeClasses = {
  sm: 'px-3.5 py-1.5 text-sm  rounded-xl',
  md: 'px-4   py-2.5 text-sm  rounded-xl',
  lg: 'px-6   py-3.5 text-base rounded-2xl',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-charcoal/20 focus:ring-offset-2
        active:scale-[0.98]
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {loading && <Spinner className="w-4 h-4" />}
      {children}
    </button>
  )
}
