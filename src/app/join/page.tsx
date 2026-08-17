'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Spinner from '@/components/ui/Spinner'
import Link from 'next/link'

interface ShopInfo {
  _id: string
  name: string
  location: string
  coverImage?: string
}

function JoinContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const shopId = searchParams.get('shop')

  const [shop, setShop] = useState<ShopInfo | null>(null)
  const [fetching, setFetching] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!shopId) { setNotFound(true); setFetching(false); return }
    fetch(`/api/barbershops/${shopId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) setShop(j.data)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setFetching(false))
  }, [shopId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) { setError('Name, email and password are required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, role: 'barber', shopId }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.message ?? 'Registration failed'); return }
      router.push('/onboarding')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="flex justify-center py-20"><Spinner /></div>
  }

  if (notFound || !shopId) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">🔗</p>
        <h1 className="text-xl font-bold text-[#111] mb-2">Invalid invite link</h1>
        <p className="text-warm-gray text-sm mb-6">This link is expired or incorrect. Ask your shop owner to send a new one.</p>
        <Link href="/" className="text-brass hover:underline text-sm">Go to homepage</Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      {/* Shop card */}
      <div className="bg-white border border-border-warm rounded-2xl overflow-hidden shadow-sm mb-6">
        {shop?.coverImage ? (
          <img src={shop.coverImage} alt={shop?.name} className="w-full h-32 object-cover" />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <span className="text-5xl">✂️</span>
          </div>
        )}
        <div className="p-5">
          <p className="text-xs font-semibold text-brass uppercase tracking-wider mb-1">You&apos;ve been invited to join</p>
          <h2 className="text-xl font-bold text-[#111]">{shop?.name}</h2>
          <p className="text-sm text-warm-gray mt-0.5">📍 {shop?.location}</p>
        </div>
      </div>

      {/* Register form */}
      <div className="bg-white border border-border-warm rounded-2xl p-6 shadow-sm">
        <h1 className="text-lg font-bold text-[#111] mb-1">Create your barber account</h1>
        <p className="text-sm text-warm-gray mb-5">You&apos;ll be added to <span className="font-medium text-[#111]">{shop?.name}</span> automatically.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Full Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Password *</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Phone <span className="text-warm-gray font-normal">(optional)</span></label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+353 87 123 4567"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
          </div>

          {error && <p className="text-soft-red text-sm bg-soft-red-light border border-soft-red/20 px-4 py-2.5 rounded-xl">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-charcoal hover:bg-charcoal-800 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60">
            {loading ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating account…</>
            ) : `Join ${shop?.name} →`}
          </button>
        </form>

        <p className="text-center text-xs text-warm-gray mt-4">
          Already have an account?{' '}
          <Link href={`/login?redirect=/onboarding`} className="text-brass hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <header className="bg-white border-b border-border-warm px-4 py-4">
        <div className="max-w-lg mx-auto">
          <span className="text-xl font-bold text-[#111]">Clipr</span>
        </div>
      </header>
      <Suspense fallback={<div className="flex justify-center py-20"><Spinner /></div>}>
        <JoinContent />
      </Suspense>
    </div>
  )
}
