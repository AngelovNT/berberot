'use client'

import { IBooking } from '@/types'
import BookingRow from './BookingRow'
import Card from '@/components/ui/Card'

interface TodayBookingsProps {
  bookings: IBooking[]
}

export default function TodayBookings({ bookings }: TodayBookingsProps) {
  if (bookings.length === 0) {
    return (
      <Card>
        <h2 className="text-base font-semibold text-[#111] mb-3">Today&apos;s Bookings</h2>
        <p className="text-sm text-warm-gray py-4 text-center">No bookings scheduled for today.</p>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="text-base font-semibold text-[#111] mb-2">Today&apos;s Bookings</h2>
      <div>
        {bookings.map((booking) => (
          <BookingRow key={booking._id} booking={booking} showClient />
        ))}
      </div>
    </Card>
  )
}
