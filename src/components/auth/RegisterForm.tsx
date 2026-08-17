'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'customer' | 'barber'>('customer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, phone }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.message ?? 'Registration failed')
        return
      }

      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-14 h-14 bg-forest/10 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-forest" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-charcoal">Check your inbox</h2>
          <p className="text-sm text-warm-gray mt-1.5">
            We sent a verification link to <span className="font-semibold text-charcoal">{email}</span>.
            Click it to activate your account.
          </p>
        </div>
        <p className="text-xs text-warm-gray">
          Didn&apos;t get it?{' '}
          <button
            className="text-charcoal font-semibold hover:opacity-70 transition-opacity"
            onClick={async () => {
              await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
              })
              alert('Verification email resent — check your inbox.')
            }}
          >
            Resend
          </button>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-soft-red-light text-soft-red text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <Input
        label="Full Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="John Doe"
        required
        autoComplete="name"
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        autoComplete="email"
      />

      <Input
        label="Phone Number"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+353 87 123 4567"
        required
        autoComplete="tel"
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        autoComplete="new-password"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-charcoal">I am a...</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
              role === 'customer'
                ? 'border-charcoal bg-charcoal text-brass'
                : 'border-border-warm text-warm-gray hover:border-charcoal-200'
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('barber')}
            className={`py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
              role === 'barber'
                ? 'border-charcoal bg-charcoal text-brass'
                : 'border-border-warm text-warm-gray hover:border-charcoal-200'
            }`}
          >
            Barber
          </button>
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-border-warm accent-charcoal flex-shrink-0"
        />
        <span className="text-sm text-warm-gray leading-snug">
          I agree to the{' '}
          <Link href="/terms" target="_blank" className="text-charcoal font-semibold underline hover:opacity-70">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" target="_blank" className="text-charcoal font-semibold underline hover:opacity-70">Privacy Policy</Link>.
          I confirm I am at least 16 years old.
        </span>
      </label>

      <Button type="submit" fullWidth loading={loading} size="lg" disabled={!agreed}>
        Create Account
      </Button>
    </form>
  )
}
