'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [unverified, setUnverified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)
  const router = useRouter()
  const { refetch } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const json = await res.json()

      if (!res.ok) {
        if (res.status === 403 && json.message?.includes('verify')) {
          setUnverified(true)
        } else {
          setError(json.message ?? 'Login failed')
        }
        return
      }

      await refetch()

      const role = json.data.role
      if (role === 'admin') router.push('/admin')
      else if (role === 'barber') router.push('/dashboard')
      else router.push('/my-bookings')

      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setResent(true)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-soft-red-light border border-soft-red/20 text-soft-red text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {unverified && (
        <div className="bg-brass-light border border-brass/20 text-brass-dark text-sm px-4 py-3 rounded-xl space-y-1.5">
          <p className="font-semibold">Please verify your email first.</p>
          <p>Check your inbox for the verification link.</p>
          {!resent ? (
            <button type="button" onClick={handleResend} className="underline font-semibold hover:opacity-70 transition-opacity">
              Resend verification email
            </button>
          ) : (
            <p className="font-semibold">✓ Sent — check your inbox.</p>
          )}
        </div>
      )}

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
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />

      <Button type="submit" fullWidth loading={loading} size="lg">
        Sign In
      </Button>
    </form>
  )
}
