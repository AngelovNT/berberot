'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Spinner from '@/components/ui/Spinner'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            i + 1 < current ? 'bg-green-500 text-white' :
            i + 1 === current ? 'bg-charcoal text-white' :
            'bg-charcoal-100 text-warm-gray'
          }`}>
            {i + 1 < current ? '✓' : i + 1}
          </div>
          {i < total - 1 && <div className={`flex-1 h-0.5 w-8 ${i + 1 < current ? 'bg-brass' : 'bg-charcoal-100'}`} />}
        </div>
      ))}
      <span className="ml-2 text-sm text-warm-gray">Step {current} of {total}</span>
    </div>
  )
}

function BtnSpinner() {
  return <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
}

// ── Step 1: Create Shop ──────────────────────────────────────────────────────

function Step1Shop({ onDone }: { onDone: (shopId: string) => void }) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !location.trim()) { setError('Both fields are required'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/barbershops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), location: location.trim() }),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) { setError(json.message ?? 'Failed to create shop'); return }
    onDone(json.data._id)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1.5">Shop Name *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. The Fade Factory" required
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
      </div>
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1.5">Location / Address *</label>
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. 12 Main Street, Dublin" required
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
      </div>
      {error && <p className="text-soft-red text-sm bg-soft-red-light border border-soft-red/20 px-4 py-2.5 rounded-xl">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-charcoal hover:bg-charcoal-800 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60">
        {loading ? <><BtnSpinner />Creating…</> : 'Create My Shop →'}
      </button>
    </form>
  )
}

// ── Step 2: Add Services ─────────────────────────────────────────────────────

function Step2Services({ onDone }: { onDone: () => void }) {
  const [services, setServices] = useState<{ name: string; price: string; duration: string }[]>([
    { name: '', price: '', duration: '30' },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addRow = () => setServices(s => [...s, { name: '', price: '', duration: '30' }])
  const updateRow = (i: number, field: string, val: string) => {
    setServices(s => s.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  }
  const removeRow = (i: number) => setServices(s => s.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const valid = services.filter(s => s.name.trim() && s.price && s.duration)
    if (valid.length === 0) { setError('Add at least one service'); return }
    setLoading(true); setError('')
    try {
      await Promise.all(valid.map(s => fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: s.name.trim(), price: Number(s.price), duration: Number(s.duration) }),
      })))
      onDone()
    } catch { setError('Failed to save services') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {services.map((svc, i) => (
        <div key={i} className="flex items-end gap-2 bg-charcoal-50 rounded-xl p-3">
          <div className="flex-1">
            <label className="block text-xs text-warm-gray mb-1">Service name</label>
            <input value={svc.name} onChange={e => updateRow(i, 'name', e.target.value)} placeholder="e.g. Haircut"
              className="w-full border border-border-warm rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
          </div>
          <div className="w-20">
            <label className="block text-xs text-warm-gray mb-1">Price (€)</label>
            <input type="number" value={svc.price} onChange={e => updateRow(i, 'price', e.target.value)} placeholder="20" min="0"
              className="w-full border border-border-warm rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
          </div>
          <div className="w-24">
            <label className="block text-xs text-warm-gray mb-1">Duration</label>
            <select value={svc.duration} onChange={e => updateRow(i, 'duration', e.target.value)}
              className="w-full border border-border-warm rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal">
              {[15,20,30,45,60,90].map(d => <option key={d} value={d}>{d}min</option>)}
            </select>
          </div>
          {services.length > 1 && (
            <button type="button" onClick={() => removeRow(i)} className="text-warm-gray hover:text-red-500 pb-2 flex-shrink-0">✕</button>
          )}
        </div>
      ))}
      <button type="button" onClick={addRow}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 text-warm-gray hover:border-charcoal hover:text-brass py-2.5 rounded-xl text-sm transition-colors">
        + Add another service
      </button>
      {error && <p className="text-soft-red text-sm bg-soft-red-light border border-soft-red/20 px-4 py-2.5 rounded-xl">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-charcoal hover:bg-charcoal-800 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60">
        {loading ? <><BtnSpinner />Saving…</> : 'Save Services →'}
      </button>
    </form>
  )
}

// ── Step 3: Working Hours ────────────────────────────────────────────────────

function Step3Hours({ onDone }: { onDone: () => void }) {
  const [days, setDays] = useState(
    Object.fromEntries(DAYS.map(d => [d, { enabled: ['monday','tuesday','wednesday','thursday','friday'].includes(d), start: '09:00', end: '18:00' }]))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggle = (day: string) => setDays(prev => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }))
  const update = (day: string, field: string, val: string) => setDays(prev => ({ ...prev, [day]: { ...prev[day], [field]: val } }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const schedule = Object.fromEntries(
      DAYS.map(d => [d, days[d].enabled ? [{ start: days[d].start, end: days[d].end }] : []])
    )
    const res = await fetch('/api/working-hours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedule }),
    })
    setLoading(false)
    if (!res.ok) { setError('Failed to save hours'); return }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {DAYS.map(day => (
          <div key={day} className={`flex items-start gap-2 p-3 rounded-xl border transition-colors ${days[day].enabled ? 'bg-charcoal border-charcoal' : 'bg-charcoal-50 border-border-warm'}`}>
            <button type="button" onClick={() => toggle(day)}
              className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${days[day].enabled ? 'bg-charcoal' : 'bg-white border border-gray-300'}`}>
              {days[day].enabled && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </button>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-medium capitalize text-[#111] mb-1.5">{day}</span>
              {days[day].enabled ? (
                <div className="flex items-center gap-1.5">
                  <input type="time" value={days[day].start} onChange={e => update(day, 'start', e.target.value)}
                    className="flex-1 min-w-0 w-full border border-border-warm rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
                  <span className="text-warm-gray text-sm flex-shrink-0">–</span>
                  <input type="time" value={days[day].end} onChange={e => update(day, 'end', e.target.value)}
                    className="flex-1 min-w-0 w-full border border-border-warm rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
                </div>
              ) : (
                <span className="text-sm text-warm-gray">Closed</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-soft-red text-sm bg-soft-red-light border border-soft-red/20 px-4 py-2.5 rounded-xl">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-charcoal hover:bg-charcoal-800 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60">
        {loading ? <><BtnSpinner />Saving…</> : 'Save Hours →'}
      </button>
    </form>
  )
}

// ── Step 4: Photos ───────────────────────────────────────────────────────────

function Step4Photos({ shopId, userId, onDone }: { shopId: string; userId: string; onDone: () => void }) {
  const [coverImage, setCoverImage] = useState('')
  const [photo, setPhoto] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await Promise.all([
        coverImage && fetch(`/api/barbershops/${shopId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coverImage }),
        }),
        photo && fetch(`/api/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo }),
        }),
      ])
      onDone()
    } catch { setError('Failed to save photos') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1.5">Cover Image URL</label>
        <input value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://... (optional)"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
        {coverImage && <img src={coverImage} alt="Cover preview" className="mt-2 w-full h-32 object-cover rounded-xl border border-border-warm" onError={e => (e.currentTarget.style.display='none')} />}
      </div>
      <div>
        <label className="block text-sm font-medium text-charcoal mb-1.5">Your Profile Photo URL</label>
        <input value={photo} onChange={e => setPhoto(e.target.value)} placeholder="https://... (optional)"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
        {photo && <img src={photo} alt="Photo preview" className="mt-2 w-12 h-12 rounded-full object-cover border border-border-warm" onError={e => (e.currentTarget.style.display='none')} />}
      </div>
      <p className="text-xs text-warm-gray">You can update these at any time from Settings.</p>
      {error && <p className="text-soft-red text-sm bg-soft-red-light border border-soft-red/20 px-4 py-2.5 rounded-xl">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-charcoal hover:bg-charcoal-800 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60">
        {loading ? <><BtnSpinner />Saving…</> : 'Finish Setup →'}
      </button>
      <button type="button" onClick={onDone} className="w-full text-center text-sm text-warm-gray hover:text-warm-gray py-2">
        Skip for now
      </button>
    </form>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

const STEP_TITLES = [
  { title: 'Create your barbershop', subtitle: 'Tell clients where to find you' },
  { title: 'Add your services', subtitle: 'What do you offer and at what price?' },
  { title: 'Set your working hours', subtitle: 'When are you available for bookings?' },
  { title: 'Add photos', subtitle: 'A cover image builds trust with clients' },
]

export default function OnboardingPage() {
  const { user, loading: authLoading, refetch } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [shopId, setShopId] = useState('')

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== 'barber') router.replace('/')
      // If already has a shop, skip step 1 — but only if still on step 1
      if (user.barberShopId) {
        setShopId(user.barberShopId)
        setStep(s => s <= 1 ? 2 : s)
      }
    }
  }, [user, authLoading, router])

  const next = async () => {
    await refetch?.()
    if (step < 4) {
      setStep(s => s + 1)
    } else {
      router.push('/dashboard')
    }
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>

  const { title, subtitle } = STEP_TITLES[step - 1]

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border-warm px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-[#111]">Clipr</span>
          <span className="text-sm text-warm-gray">Setup your profile</span>
        </div>
      </header>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        <StepIndicator current={step} total={4} />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111]">{title}</h1>
          <p className="text-warm-gray text-sm mt-1">{subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl border border-border-warm p-6 shadow-sm">
          {step === 1 && (
            <Step1Shop onDone={id => { setShopId(id); refetch?.(); setStep(2) }} />
          )}
          {step === 2 && (
            <Step2Services onDone={next} />
          )}
          {step === 3 && (
            <Step3Hours onDone={next} />
          )}
          {step === 4 && user && (
            <Step4Photos shopId={shopId || user.barberShopId || ''} userId={user._id} onDone={next} />
          )}
        </div>
      </div>
    </div>
  )
}
