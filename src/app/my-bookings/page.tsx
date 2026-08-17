'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import { IBooking, IService, IUser } from '@/types'

function BtnSpinner() {
  return (
    <svg className="animate-spin w-3 h-3 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function StarRating({ bookingId, existing, existingReview }: { bookingId: string; existing?: number; existingReview?: string }) {
  const [rating, setRating] = useState(existing ?? 0)
  const [hover, setHover] = useState(0)
  const [reviewText, setReviewText] = useState(existingReview ?? '')
  const [saved, setSaved] = useState(!!existing)
  const [saving, setSaving] = useState(false)
  const [showReview, setShowReview] = useState(false)

  const submit = async (star: number) => {
    if (saved) return
    setRating(star)
    setShowReview(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, reviewText }),
      })
      setSaved(true)
      setShowReview(false)
    } catch { /* ignore */ }
    finally { setSaving(false) }
  }

  return (
    <div className="mt-3 pt-3 border-t border-border-warm">
      <p className="text-xs text-warm-gray font-medium mb-1.5">{saved ? 'Your rating' : 'Rate this visit'}</p>
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => submit(star)}
            onMouseEnter={() => !saved && setHover(star)}
            onMouseLeave={() => !saved && setHover(0)}
            disabled={saved}
            className={`text-xl transition-transform ${!saved ? 'hover:scale-125 cursor-pointer' : 'cursor-default'} ${
              star <= (hover || rating) ? 'text-amber-400' : 'text-gray-200'
            }`}
          >
            ★
          </button>
        ))}
      </div>
      {saved && existingReview && (
        <p className="text-xs text-warm-gray italic mt-1">{existingReview}</p>
      )}
      {showReview && !saved && (
        <div className="mt-2 space-y-2">
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience (optional)…"
            rows={2}
            maxLength={500}
            className="w-full border border-border-warm rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-charcoal resize-none"
          />
          <button
            onClick={handleSave}
            disabled={saving || rating === 0}
            className="text-xs bg-charcoal hover:bg-charcoal-800 text-white font-semibold px-4 py-1.5 rounded-lg transition-all shadow-sm disabled:opacity-60 flex items-center gap-1.5"
          >
            {saving ? <><BtnSpinner />Saving…</> : 'Submit Review'}
          </button>
        </div>
      )}
    </div>
  )
}

interface BarberWithShop extends Omit<IUser, 'barberShopId'> {
  barberShopId?: string | { _id: string; name: string }
}

function getShopName(barber: BarberWithShop): string {
  if (!barber.barberShopId) return ''
  if (typeof barber.barberShopId === 'object') return barber.barberShopId.name
  return ''
}

function BookingCard({
  booking,
  onCancelled,
}: {
  booking: IBooking
  onCancelled: (id: string) => void
}) {
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [status, setStatus] = useState(booking.status)
  const service = booking.serviceId as IService
  const barber = booking.barberId as BarberWithShop

  const shopId = typeof barber === 'object'
    ? (typeof barber.barberShopId === 'object' ? barber.barberShopId._id : barber.barberShopId)
    : undefined
  const serviceId = typeof service === 'object' ? service._id : undefined
  const barberId = typeof barber === 'object' ? barber._id : undefined
  const shopName = typeof barber === 'object' ? getShopName(barber) : ''

  const bookAgainUrl =
    shopId && serviceId && barberId
      ? `/book/${shopId}/${serviceId}/${barberId}`
      : '/'

  const handleCancel = async () => {
    if (!confirm('Cancel this booking?')) return
    setCancelling(true)
    setCancelError('')
    try {
      const res = await fetch(`/api/bookings/${booking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      const json = await res.json()
      if (res.ok) {
        setStatus('cancelled')
        onCancelled(booking._id)
      } else {
        setCancelError(json.message ?? 'Could not cancel booking')
      }
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="bg-white border border-border-warm rounded-2xl p-4 sm:p-5 hover:border-charcoal hover:shadow-card-hover transition-all shadow-card">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="bg-charcoal text-white rounded-xl px-3 py-2.5 text-center min-w-[64px] flex-shrink-0">
            <div className="text-sm font-semibold">{booking.startTime}</div>
            <div className="text-xs text-warm-gray">{booking.endTime}</div>
          </div>
          <div>
            <p className="font-semibold text-charcoal">
              {typeof service === 'object' ? service.name : 'Service'}
            </p>
            <p className="text-sm text-warm-gray mt-0.5">{formatDate(booking.date)}</p>
            {typeof barber === 'object' && (
              <div className="flex items-center gap-2 mt-1">
                {barber.photo ? (
                  <img
                    src={barber.photo}
                    alt={barber.name}
                    className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-charcoal flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {barber.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <p className="text-sm text-warm-gray">
                  {barber.name}
                  {shopName && <span className="text-charcoal-200"> · {shopName}</span>}
                </p>
              </div>
            )}
            {typeof service === 'object' && (
              <p className="text-xs text-warm-gray mt-0.5">
                €{service.price} · {service.duration} min
              </p>
            )}
          </div>
        </div>
        <Badge status={status} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-border-warm">
        {status === 'confirmed' && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="inline-flex items-center gap-1.5 text-xs text-soft-red hover:text-soft-red border border-soft-red/20 bg-soft-red-light hover:bg-soft-red-light px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 font-medium"
          >
            {cancelling ? <><BtnSpinner />Cancelling…</> : 'Cancel'}
          </button>
        )}
        <Link
          href={bookAgainUrl}
          className="text-xs text-brass hover:text-white border border-charcoal bg-brass-light hover:bg-charcoal px-3 py-1.5 rounded-xl transition-colors font-medium"
        >
          Book again
        </Link>
      </div>

      {cancelError && (
        <p className="text-xs text-soft-red bg-soft-red-light border border-soft-red/20 rounded-xl px-3 py-2 mt-2">{cancelError}</p>
      )}

      {status === 'completed' && (
        <StarRating bookingId={booking._id} existing={booking.rating} existingReview={booking.reviewText} />
      )}
    </div>
  )
}

function HaircutAnalytics({ bookings }: { bookings: IBooking[] }) {
  const today = getTodayStr()
  // Count any past confirmed booking as a haircut if it was never marked completed
  const completed = bookings.filter(
    (b) => b.status === 'completed' || (b.status === 'confirmed' && b.date < today)
  )
  if (completed.length === 0) return null

  const now = new Date()
  const sorted = [...completed].sort((a, b) => a.date.localeCompare(b.date))
  const lastBooking = sorted[sorted.length - 1]
  const lastDate = new Date(lastBooking.date + 'T00:00:00')

  // Last haircut label
  const daysSinceLast = Math.round((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
  let lastCutLabel: string
  if (daysSinceLast === 0) lastCutLabel = 'Today'
  else if (daysSinceLast === 1) lastCutLabel = 'Yesterday'
  else if (daysSinceLast < 14) lastCutLabel = `${daysSinceLast}d ago`
  else if (daysSinceLast < 60) lastCutLabel = `${Math.round(daysSinceLast / 7)}w ago`
  else lastCutLabel = lastDate.toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })

  // Average interval in days (from 2+ cuts)
  let avgIntervalDays = 0
  if (sorted.length >= 2) {
    const intervals: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].date + 'T00:00:00').getTime()
      const curr = new Date(sorted[i].date + 'T00:00:00').getTime()
      intervals.push((curr - prev) / (1000 * 60 * 60 * 24))
    }
    avgIntervalDays = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
  }

  // Frequency label (human-readable)
  let frequencyLabel = '—'
  if (avgIntervalDays > 0) {
    if (avgIntervalDays <= 10) frequencyLabel = 'Weekly'
    else if (avgIntervalDays <= 18) frequencyLabel = 'Every 2w'
    else if (avgIntervalDays <= 25) frequencyLabel = 'Every 3w'
    else if (avgIntervalDays <= 40) frequencyLabel = 'Monthly'
    else frequencyLabel = `Every ${Math.round(avgIntervalDays / 7)}w`
  }

  // Next cut prediction
  let nextCutLabel = ''
  let nextCutOverdue = false
  if (avgIntervalDays > 0) {
    const nextDate = new Date(lastDate.getTime() + avgIntervalDays * 24 * 60 * 60 * 1000)
    const diffDays = Math.round((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) {
      nextCutLabel = 'Overdue!'
      nextCutOverdue = true
    } else if (diffDays === 0) {
      nextCutLabel = 'Today'
    } else if (diffDays <= 7) {
      nextCutLabel = `In ${diffDays}d`
    } else if (diffDays <= 21) {
      nextCutLabel = `In ${Math.round(diffDays / 7)}w`
    } else {
      nextCutLabel = nextDate.toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })
    }
  } else if (completed.length === 1) {
    // Single cut — estimate based on typical 2-3w
    const nextDate = new Date(lastDate.getTime() + 21 * 24 * 60 * 60 * 1000)
    const diffDays = Math.round((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) { nextCutLabel = 'Overdue!'; nextCutOverdue = true }
    else if (diffDays <= 7) nextCutLabel = `In ${diffDays}d`
    else nextCutLabel = nextDate.toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })
  }

  // Favourite barber
  const barberCounts: Record<string, { name: string; count: number }> = {}
  for (const b of completed) {
    const barber = b.barberId as IUser
    if (typeof barber !== 'object') continue
    barberCounts[barber._id] = barberCounts[barber._id] ?? { name: barber.name, count: 0 }
    barberCounts[barber._id].count++
  }
  const favBarber = Object.values(barberCounts).sort((a, b) => b.count - a.count)[0] ?? null

  // Favourite service
  const serviceCounts: Record<string, { name: string; count: number }> = {}
  for (const b of completed) {
    const svc = b.serviceId as IService
    if (typeof svc !== 'object') continue
    serviceCounts[svc._id] = serviceCounts[svc._id] ?? { name: svc.name, count: 0 }
    serviceCounts[svc._id].count++
  }
  const favService = Object.values(serviceCounts).sort((a, b) => b.count - a.count)[0] ?? null

  return (
    <div className="bg-white border border-border-warm rounded-2xl p-5 mb-6 shadow-card">
      <h2 className="text-sm font-semibold text-charcoal mb-4 uppercase tracking-wider text-xs text-warm-gray">Your Haircut Stats</h2>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-ivory rounded-xl p-3 text-center">
          <p className="text-3xl font-bold text-charcoal">{completed.length}</p>
          <p className="text-xs text-warm-gray mt-1 font-medium">Total cuts</p>
        </div>
        <div className="bg-ivory rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-charcoal">{lastCutLabel}</p>
          <p className="text-xs text-warm-gray mt-1 font-medium">Last haircut</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-ivory rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-charcoal">{frequencyLabel}</p>
          <p className="text-xs text-warm-gray mt-1 font-medium">Your frequency</p>
        </div>
        {nextCutLabel && (
          <div className={`rounded-xl p-3 text-center ${nextCutOverdue ? 'bg-amber-50 border border-amber-200' : 'bg-brass-light border border-charcoal'}`}>
            <p className={`text-2xl font-bold ${nextCutOverdue ? 'text-amber-600' : 'text-brass'}`}>
              {nextCutLabel}
            </p>
            <p className={`text-xs mt-1 font-medium ${nextCutOverdue ? 'text-amber-500' : 'text-charcoal'}`}>
              Next cut est.
            </p>
          </div>
        )}
      </div>

      {(favBarber || favService) && (
        <div className="grid grid-cols-2 gap-3">
          {favBarber && (
            <div className="bg-ivory rounded-xl p-3">
              <p className="text-xs text-warm-gray mb-1 font-medium">Fav barber</p>
              <p className="text-sm font-semibold text-charcoal truncate">{favBarber.name}</p>
              <p className="text-xs text-warm-gray">{favBarber.count}×</p>
            </div>
          )}
          {favService && (
            <div className="bg-ivory rounded-xl p-3">
              <p className="text-xs text-warm-gray mb-1 font-medium">Fav service</p>
              <p className="text-sm font-semibold text-charcoal truncate">{favService.name}</p>
              <p className="text-xs text-warm-gray">{favService.count}×</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MyBookingsContent() {
  const [bookings, setBookings] = useState<IBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const searchParams = useSearchParams()
  const success = searchParams.get('success')

  useEffect(() => {
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((json) => { if (json.success) setBookings(json.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleCancelled = (id: string) => {
    setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b)))
  }

  const today = getTodayStr()
  const upcoming = bookings.filter((b) => b.status === 'confirmed' && b.date >= today)
  const past = bookings.filter((b) => b.status !== 'confirmed' || b.date < today)
  const shown = tab === 'upcoming' ? upcoming : past

  return (
    <>
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm font-semibold">
          ✓ Booking confirmed! See you soon.
        </div>
      )}

      {!loading && <HaircutAnalytics bookings={bookings} />}

      {/* Tabs */}
      <div className="flex gap-1 bg-charcoal-100 border border-border-warm p-1 rounded-xl mb-6">
        <button
          onClick={() => setTab('upcoming')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
            tab === 'upcoming' ? 'bg-white text-charcoal shadow-sm' : 'text-warm-gray hover:text-warm-gray'
          }`}
        >
          Upcoming
          {upcoming.length > 0 && (
            <span className="ml-2 text-xs bg-charcoal text-white rounded-full px-1.5 py-0.5">
              {upcoming.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('past')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
            tab === 'past' ? 'bg-white text-charcoal shadow-sm' : 'text-warm-gray hover:text-warm-gray'
          }`}
        >
          Past &amp; Cancelled
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : shown.length === 0 ? (
        <div className="text-center py-16 bg-white border border-border-warm rounded-2xl shadow-card">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-semibold text-charcoal mb-1">
            {tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
          </p>
          <p className="text-sm text-warm-gray mb-5">
            {tab === 'upcoming' ? "You don't have any appointments scheduled." : "Nothing here yet."}
          </p>
          {tab === 'upcoming' && (
            <Link
              href="/"
              className="inline-block bg-charcoal hover:bg-charcoal-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              Book Appointment
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {shown.map((b) => (
            <BookingCard key={b._id} booking={b} onCancelled={handleCancelled} />
          ))}
        </div>
      )}
    </>
  )
}

export default function MyBookingsPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-charcoal">My Bookings</h1>
          <p className="text-warm-gray text-sm mt-1">Manage your appointments</p>
        </div>
        <Suspense fallback={<div className="flex justify-center py-16"><Spinner /></div>}>
          <MyBookingsContent />
        </Suspense>
      </div>
    </div>
  )
}
