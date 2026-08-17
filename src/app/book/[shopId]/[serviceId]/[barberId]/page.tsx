'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import BookingStepIndicator from '@/components/booking/BookingStepIndicator'
import TimeSlotPicker from '@/components/booking/TimeSlotPicker'
import { ITimeSlot } from '@/types'

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function SelectTimePage({
  params,
}: {
  params: Promise<{ shopId: string; serviceId: string; barberId: string }>
}) {
  const { shopId, serviceId, barberId } = use(params)
  const [date, setDate] = useState(getTodayStr())
  const [slots, setSlots] = useState<ITimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<ITimeSlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const [barberName, setBarberName] = useState('')
  const [barberPhoto, setBarberPhoto] = useState('')
  const [serviceName, setServiceName] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Fetch barber and service names for the summary
    Promise.all([
      fetch(`/api/users/${barberId}`).then((r) => r.json()),
      fetch(`/api/services/${serviceId}`).then((r) => r.json()),
    ]).then(([barberJson, serviceJson]) => {
      if (barberJson.success) {
        setBarberName(barberJson.data?.name ?? '')
        setBarberPhoto(barberJson.data?.photo ?? '')
      }
      if (serviceJson.success) {
        setServiceName(serviceJson.data?.name ?? '')
      }
    }).catch(() => {})
  }, [barberId, serviceId])

  useEffect(() => {
    if (!date) return
    setLoading(true)
    setSelectedSlot(null)
    fetch(`/api/slots?barberId=${barberId}&date=${date}&serviceId=${serviceId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setSlots(json.data)
        else setSlots([])
      })
      .catch(() => setSlots([]))
      .finally(() => setLoading(false))
  }, [date, barberId, serviceId])

  const handleContinue = () => {
    if (!selectedSlot || navigating) return
    setNavigating(true)
    const qs = new URLSearchParams({
      date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
    })
    router.push(`/book/${shopId}/${serviceId}/${barberId}/confirm?${qs.toString()}`)
  }

  const todayStr = getTodayStr()

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <BookingStepIndicator currentStep={3} />

        {/* Selection summary */}
        {(serviceName || barberName) && (
          <div className="bg-white shadow-card rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
            <span className="text-sm font-medium text-[#111]">{serviceName}</span>
            {barberName && (
              <>
                <span className="text-charcoal-200">·</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    {barberPhoto ? (
                      <img src={barberPhoto} alt={barberName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-charcoal flex items-center justify-center text-white text-xs font-bold">
                        {barberName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-[#111]">{barberName}</span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111]">Choose a Time</h1>
          <p className="text-warm-gray text-sm mt-1">Select a date and available time slot</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-warm-gray mb-2">Date</label>
          <input
            type="date"
            value={date}
            min={todayStr}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white border border-border-warm text-charcoal rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal hover:border-gray-300 transition-colors w-full sm:w-auto"
          />
        </div>

        <div className="mb-24">
          <p className="text-sm font-medium text-warm-gray mb-3">Available slots</p>
          <TimeSlotPicker
            slots={slots}
            selectedSlot={selectedSlot}
            onSelect={navigating ? () => {} : setSelectedSlot}
            loading={loading}
            disabled={navigating}
          />
        </div>

        {/* Sticky continue button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-border-warm z-50">
          <button
            onClick={handleContinue}
            disabled={!selectedSlot || navigating}
            className="w-full inline-flex items-center justify-center gap-2 bg-charcoal hover:bg-charcoal-800 active:scale-[0.98] text-white font-semibold py-4 rounded-2xl text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {navigating ? (
              <>
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading…
              </>
            ) : selectedSlot ? `Continue — ${selectedSlot.startTime}` : 'Select a time slot'}
          </button>
        </div>
      </div>
    </div>
  )
}
