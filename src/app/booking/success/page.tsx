'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

function formatDisplayDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function buildCalendarUrl(date: string, startTime: string, endTime: string, service: string, shop: string) {
  const start = `${date.replace(/-/g, '')}T${startTime.replace(':', '')}00`
  const end = `${date.replace(/-/g, '')}T${endTime.replace(':', '')}00`
  const text = encodeURIComponent(`${service} at ${shop}`)
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}`
}

function SuccessContent() {
  const sp = useSearchParams()
  const service = sp.get('service') ?? 'Appointment'
  const barber = sp.get('barber') ?? ''
  const shop = sp.get('shop') ?? ''
  const date = sp.get('date') ?? ''
  const startTime = sp.get('startTime') ?? ''
  const endTime = sp.get('endTime') ?? ''

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 pb-28 sm:pb-16">
      {/* Animated success icon */}
      <div className="text-center mb-10">
        <div
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ animation: 'pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}
        >
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1
          className="font-display text-4xl font-bold text-charcoal"
          style={{ animation: 'slide-up 0.4s 0.2s ease-out both' }}
        >
          You&apos;re booked.
        </h1>
        <p
          className="text-warm-gray mt-2 text-base"
          style={{ animation: 'slide-up 0.4s 0.3s ease-out both' }}
        >
          See you soon — we&apos;re looking forward to it.
        </p>
      </div>

      {/* Booking details */}
      <div
        className="bg-white rounded-2xl shadow-card overflow-hidden mb-5"
        style={{ animation: 'slide-up 0.4s 0.35s ease-out both' }}
      >
        <div className="h-1 bg-green-500" />
        <div className="p-5 space-y-3.5">
          {[
            { label: 'Service', value: service },
            { label: 'Barber', value: barber },
            { label: 'Shop', value: shop },
            { label: 'Date', value: date ? formatDisplayDate(date) : '' },
            { label: 'Time', value: startTime && endTime ? `${startTime} – ${endTime}` : startTime },
          ].filter(r => r.value).map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm gap-4">
              <span className="text-warm-gray flex-shrink-0">{label}</span>
              <span className="font-semibold text-charcoal text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cancellation note */}
      <p
        className="text-xs text-warm-gray text-center mb-6 px-4"
        style={{ animation: 'slide-up 0.4s 0.4s ease-out both' }}
      >
        You can cancel up to 2 hours before your appointment from My Bookings.
      </p>

      {/* Actions */}
      <div
        className="space-y-3"
        style={{ animation: 'slide-up 0.4s 0.45s ease-out both' }}
      >
        <Link
          href="/my-bookings"
          className="block w-full text-center bg-charcoal hover:bg-charcoal-800 text-white font-semibold py-4 rounded-2xl transition-all shadow-sm hover:shadow-md"
        >
          View My Bookings
        </Link>
        {date && startTime && (
          <a
            href={buildCalendarUrl(date, startTime, endTime, service, shop)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full text-center text-warm-gray hover:text-brass text-sm font-medium py-3 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Add to Google Calendar
          </a>
        )}
        <Link
          href="/"
          className="block w-full text-center text-warm-gray hover:text-charcoal text-sm font-medium py-3 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <Suspense fallback={<div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-charcoal border-t-transparent rounded-full animate-spin" /></div>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
