'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NextSlotResult } from '@/lib/nextSlot'

interface Props {
  shopId: string
  initial: NextSlotResult | null
  label: string | null
}

export default function BookNextAvailable({ shopId, initial, label }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!initial || !label) return null

  const handleClick = () => {
    if (loading) return
    if (!initial.serviceId || !initial.barberId) {
      router.push(`/book/${shopId}`)
      return
    }
    setLoading(true)
    const qs = new URLSearchParams({
      date: initial.date,
      startTime: initial.slot,
      endTime: initial.endTime,
    })
    router.push(`/book/${shopId}/${initial.serviceId}/${initial.barberId}/confirm?${qs}`)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full inline-flex items-center justify-center gap-2.5 bg-charcoal hover:bg-charcoal-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 mt-2"
    >
      {loading ? (
        <>
          <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading…
        </>
      ) : (
        <>
          <span>⚡</span>
          <span className="flex flex-col items-start leading-tight">
            <span>Book next available</span>
            <span className="text-xs font-normal opacity-70">{label}</span>
          </span>
        </>
      )}
    </button>
  )
}
