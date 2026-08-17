'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { IBooking, IService, IUser } from '@/types'

interface BarberWithShop extends Omit<IUser, 'barberShopId'> {
  barberShopId?: string | { _id: string; name: string }
}

export default function SmartRebook() {
  const [url, setUrl] = useState<string | null>(null)
  const [label, setLabel] = useState('')

  useEffect(() => {
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return
        const bookings: IBooking[] = json.data

        const completed = bookings
          .filter((b) => b.status === 'completed' || b.status === 'confirmed')
          .sort((a, b) => b.date.localeCompare(a.date))

        if (completed.length < 2) return

        // Calculate average interval
        const sorted = [...completed].sort((a, b) => a.date.localeCompare(b.date))
        const intervals: number[] = []
        for (let i = 1; i < sorted.length; i++) {
          const prev = new Date(sorted[i - 1].date + 'T00:00:00').getTime()
          const curr = new Date(sorted[i].date + 'T00:00:00').getTime()
          intervals.push((curr - prev) / 86400000)
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
        const lastDate = new Date(sorted[sorted.length - 1].date + 'T00:00:00')
        const nextDate = new Date(lastDate.getTime() + avgInterval * 86400000)
        const today = new Date()

        // Only show if within 3 days of due date or overdue
        const diffDays = Math.round((nextDate.getTime() - today.getTime()) / 86400000)
        if (diffDays > 3) return

        // Build rebook URL from last booking
        const last = sorted[sorted.length - 1]
        const barber = last.barberId as BarberWithShop
        const service = last.serviceId as IService
        if (typeof barber !== 'object' || typeof service !== 'object') return

        const shopId = typeof barber.barberShopId === 'object'
          ? barber.barberShopId._id
          : barber.barberShopId
        if (!shopId) return

        setUrl(`/book/${shopId}/${service._id}/${barber._id}`)
        setLabel(diffDays < 0 ? 'Overdue!' : diffDays === 0 ? 'Today!' : `In ${diffDays} day${diffDays === 1 ? '' : 's'}`)
      })
      .catch(() => {})
  }, [])

  if (!url) return null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
      <div className="bg-charcoal border border-charcoal rounded-2xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✂️</span>
          <div>
            <p className="font-semibold text-[#111]">Time for your next haircut!</p>
            <p className="text-sm text-warm-gray">Based on your history — due {label}</p>
          </div>
        </div>
        <Link
          href={url}
          className="bg-charcoal hover:bg-charcoal-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
        >
          Book again →
        </Link>
      </div>
    </div>
  )
}
