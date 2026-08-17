'use client'

import { useState } from 'react'
import { IBooking, IUser, IService } from '@/types'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

interface BookingRowProps {
  booking: IBooking
  onCancelled?: (id: string) => void
  showBarber?: boolean
  showClient?: boolean
}

export default function BookingRow({
  booking,
  onCancelled,
  showBarber = false,
  showClient = true,
}: BookingRowProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(booking.status)

  const service = booking.serviceId as IService
  const client = booking.userId as IUser
  const barber = booking.barberId as IUser

  const handleCancel = async () => {
    if (!confirm('Cancel this booking?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/bookings/${booking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      if (res.ok) {
        setStatus('cancelled')
        onCancelled?.(booking._id)
      }
    } finally {
      setLoading(false)
    }
  }

  const displayDate = new Date(booking.date + 'T00:00:00').toLocaleDateString('en-IE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-border-warm last:border-0">
      <div className="flex items-start gap-3">
        <div className="bg-[#0f0f0f] text-white rounded-lg px-3 py-2 text-center min-w-[60px]">
          <div className="text-xs font-medium">{booking.startTime}</div>
          <div className="text-xs text-warm-gray">{booking.endTime}</div>
        </div>
        <div>
          <p className="font-medium text-[#0f0f0f] text-sm">
            {typeof service === 'object' ? service.name : 'Service'}
          </p>
          <p className="text-xs text-warm-gray mt-0.5">{displayDate}</p>
          {showClient && typeof client === 'object' && (
            <p className="text-xs text-warm-gray mt-0.5">Client: {client.name}</p>
          )}
          {showBarber && typeof barber === 'object' && (
            <p className="text-xs text-warm-gray mt-0.5">Barber: {barber.name}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge status={status} />
        {status === 'confirmed' && (
          <Button variant="danger" size="sm" loading={loading} onClick={handleCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
