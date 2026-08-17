'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IUser } from '@/types'
import Card from '@/components/ui/Card'

interface BarberPickerProps {
  barbers: IUser[]
  shopId: string
  serviceId: string
  ratings?: Record<string, { avg: number; count: number }>
}

export default function BarberPicker({ barbers, shopId, serviceId, ratings = {} }: BarberPickerProps) {
  const router = useRouter()
  const [navigating, setNavigating] = useState<string | null>(null)

  const handleSelect = (barberId: string) => {
    if (navigating) return
    setNavigating(barberId)
    router.push(`/book/${shopId}/${serviceId}/${barberId}`)
  }

  if (barbers.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-card">
        <p className="text-sm font-medium text-charcoal">No barbers available</p>
        <p className="text-xs text-warm-gray mt-1">This shop has no active barbers.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {barbers.map((barber) => {
        const rating = ratings[barber._id]
        const isLoading = navigating === barber._id
        const isDisabled = navigating !== null

        return (
          <button
            key={barber._id}
            onClick={() => handleSelect(barber._id)}
            disabled={isDisabled}
            className="text-left w-full"
          >
            <Card className={`transition-all
              ${isLoading
                ? 'shadow-card-hover ring-2 ring-charcoal/20'
                : isDisabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-card-hover cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  {barber.photo ? (
                    <img
                      src={barber.photo}
                      alt={barber.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-charcoal flex items-center justify-center text-white font-bold text-xl">
                      {barber.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-charcoal">
                    {barber.name}
                  </h3>
                  {rating ? (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-sm text-warm-gray font-medium">{rating.avg.toFixed(1)}</span>
                      <span className="text-xs text-warm-gray">({rating.count})</span>
                    </div>
                  ) : (
                    <p className="text-xs text-warm-gray mt-1">No reviews yet</p>
                  )}
                </div>
                {isLoading ? (
                  <svg className="animate-spin w-4 h-4 text-brass flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-warm-gray group-hover:text-brass flex-shrink-0 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </Card>
          </button>
        )
      })}
    </div>
  )
}
