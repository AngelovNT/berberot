'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface BookingConfirmProps {
  shopName: string
  serviceName: string
  servicePrice: number
  serviceDuration: number
  barberName: string
  barberPhoto?: string
  date: string
  startTime: string
  endTime: string
  barberId: string
  serviceId: string
}

export default function BookingConfirm({
  shopName,
  serviceName,
  servicePrice,
  serviceDuration,
  barberName,
  barberPhoto,
  date,
  startTime,
  endTime,
  barberId,
  serviceId,
}: BookingConfirmProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneLoaded, setPhoneLoaded] = useState(false)
  const [recurrence, setRecurrence] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.phone) {
          setPhone(json.data.phone)
        }
      })
      .catch(() => {})
      .finally(() => setPhoneLoaded(true))
  }, [])

  const handleConfirm = async () => {
    if (!phone.trim()) {
      setError('Phone number is required')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId, serviceId, date, startTime, endTime, phone: phone.trim(),
          ...(recurrence > 0 ? { recurrenceWeeks: recurrence } : {}),
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.message ?? 'Failed to create booking')
        return
      }

      const params = new URLSearchParams({
        service: serviceName,
        barber: barberName,
        shop: shopName,
        date,
        startTime,
        endTime,
        bookingId: json.data._id ?? '',
      })
      router.push(`/booking/success?${params.toString()}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-4 pb-28">
      {/* Summary card */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="h-1 bg-brass" />
        <div className="p-5">
        <h2 className="text-base font-semibold text-charcoal mb-4">Booking Summary</h2>

        {/* Barber identity */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-warm">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            {barberPhoto ? (
              <img src={barberPhoto} alt={barberName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-charcoal flex items-center justify-center text-white font-bold text-lg">
                {barberName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-charcoal">{barberName}</p>
            <p className="text-sm text-warm-gray">{shopName}</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Service', value: serviceName },
            { label: 'Duration', value: `${serviceDuration} min` },
            { label: 'Date', value: displayDate },
            { label: 'Time', value: `${startTime} – ${endTime}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-warm-gray">{label}</span>
              <span className="font-medium text-charcoal">{value}</span>
            </div>
          ))}
          <div className="pt-3 border-t border-border-warm flex justify-between items-center">
            <span className="font-semibold text-charcoal">Total</span>
            <span className="text-2xl font-bold text-charcoal">€{servicePrice}</span>
          </div>
        </div>
        </div>
      </div>

      {/* Recurring booking */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={recurrence > 0}
            onChange={(e) => setRecurrence(e.target.checked ? 2 : 0)}
            className="w-4 h-4 accent-charcoal"
          />
          <span className="text-sm font-medium text-charcoal">Book automatically every few weeks</span>
        </label>
        {recurrence > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-warm-gray">Repeat every</span>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(Number(e.target.value))}
              className="border border-border-warm rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal bg-white"
            >
              {[1,2,3,4,6,8].map((w) => (
                <option key={w} value={w}>{w} week{w > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Cancellation policy */}
      <div className="bg-brass-light rounded-2xl px-4 py-3 flex items-start gap-2">
        <span className="text-brass mt-0.5 flex-shrink-0 text-xs">ℹ</span>
        <p className="text-xs text-brass-dark">
          <span className="font-semibold">Cancellation policy:</span> Cancellations are only allowed up to 2 hours before your appointment.
        </p>
      </div>

      {/* Phone number */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <label className="block text-sm font-semibold text-charcoal mb-1.5">
          Your Phone Number <span className="text-brass">*</span>
        </label>
        <p className="text-xs text-warm-gray mb-3">
          {phoneLoaded && phone
            ? 'Pre-filled from your profile. You can edit if needed.'
            : 'The barber may contact you about your appointment.'}
        </p>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+353 87 123 4567"
          className="w-full bg-white border border-border-warm text-charcoal placeholder-charcoal-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal hover:border-charcoal-200 transition-colors"
        />
      </div>

      {error && (
        <div className="bg-soft-red-light text-soft-red text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Sticky confirm button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-border-warm z-50">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-brass hover:bg-brass-dark active:scale-[0.98] text-white font-semibold py-4 rounded-2xl text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Confirming…
            </>
          ) : 'Confirm Booking'}
        </button>
      </div>
    </div>
  )
}
