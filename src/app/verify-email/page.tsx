'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link.')
      return
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setStatus('success')
          setTimeout(() => router.push('/'), 2500)
        } else {
          setStatus('error')
          setMessage(j.message ?? 'This link is invalid or has expired.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Something went wrong. Please try again.')
      })
  }, [token, router])

  return (
    <>
      {status === 'loading' && (
        <>
          <div className="w-10 h-10 border-2 border-charcoal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-warm-gray">Verifying your email…</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-charcoal mb-2">Email verified!</h1>
          <p className="text-sm text-warm-gray">You&apos;re all set. Redirecting you now…</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-12 h-12 bg-soft-red-light rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-soft-red" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-charcoal mb-2">Verification failed</h1>
          <p className="text-sm text-warm-gray mb-6">{message}</p>
          <Link href="/login" className="text-sm font-semibold text-charcoal hover:opacity-70 transition-opacity">
            Back to login
          </Link>
        </>
      )}
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-card p-8 w-full max-w-sm text-center">
        <p className="font-display text-xl font-bold tracking-widest text-charcoal mb-8">
          BERBEROT<span className="text-brass">.</span>
        </p>
        <Suspense fallback={
          <div className="w-10 h-10 border-2 border-charcoal border-t-transparent rounded-full animate-spin mx-auto" />
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  )
}
