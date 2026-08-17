'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IService } from '@/types'

interface ServicePickerProps {
  services: IService[]
  shopId: string
}

export default function ServicePicker({ services, shopId }: ServicePickerProps) {
  const router = useRouter()
  const [navigating, setNavigating] = useState<string | null>(null)

  const handleSelect = (serviceId: string) => {
    if (navigating) return
    setNavigating(serviceId)
    router.push(`/book/${shopId}/${serviceId}`)
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-card">
        <p className="text-sm font-medium text-charcoal">No services listed yet</p>
        <p className="text-xs text-warm-gray mt-1">Check back soon.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {services.map((service) => {
        const isLoading = navigating === service._id
        const isDisabled = navigating !== null

        return (
          <button
            key={service._id}
            onClick={() => handleSelect(service._id)}
            disabled={isDisabled}
            className={`text-left w-full bg-white rounded-2xl p-5 active:scale-[0.98] transition-all group
              ${isLoading
                ? 'shadow-card-hover ring-2 ring-charcoal/20'
                : isDisabled
                ? 'shadow-card opacity-50 cursor-not-allowed'
                : 'shadow-card hover:shadow-card-hover cursor-pointer'
              }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-charcoal">{service.name}</h3>
                <p className="text-sm text-warm-gray mt-1">{service.duration} min</p>
              </div>
              <span className="text-2xl font-bold text-charcoal">€{service.price}</span>
            </div>
            <div className="mt-4 pt-3 border-t border-border-warm flex items-center justify-between">
              <span className="text-xs text-warm-gray">
                {isLoading ? 'Loading…' : 'Tap to select'}
              </span>
              {isLoading ? (
                <svg className="animate-spin w-4 h-4 text-brass" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-brass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
