'use client'

import { ITimeSlot } from '@/types'

interface TimeSlotPickerProps {
  slots: ITimeSlot[]
  selectedSlot: ITimeSlot | null
  onSelect: (slot: ITimeSlot) => void
  loading?: boolean
  disabled?: boolean
}

function hourOf(time: string) {
  return parseInt(time.split(':')[0], 10)
}

function groupSlots(slots: ITimeSlot[]) {
  const morning: ITimeSlot[] = []
  const afternoon: ITimeSlot[] = []
  const evening: ITimeSlot[] = []

  for (const slot of slots) {
    const h = hourOf(slot.startTime)
    if (h < 12) morning.push(slot)
    else if (h < 17) afternoon.push(slot)
    else evening.push(slot)
  }

  return [
    { label: 'Morning', slots: morning },
    { label: 'Afternoon', slots: afternoon },
    { label: 'Evening', slots: evening },
  ].filter((g) => g.slots.length > 0)
}

export default function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelect,
  loading = false,
  disabled = false,
}: TimeSlotPickerProps) {
  if (loading) {
    return (
      <div className="space-y-5">
        {[6, 4].map((n, gi) => (
          <div key={gi}>
            <div className="h-3 w-20 rounded-full bg-charcoal-100 animate-pulse mb-3" />
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {Array.from({ length: n }).map((_, i) => (
                <div key={i} className="h-14 rounded-2xl bg-charcoal-100 animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-card">
        <p className="text-sm font-semibold text-charcoal">No slots available</p>
        <p className="text-xs text-warm-gray mt-1">Try a different date.</p>
      </div>
    )
  }

  const groups = groupSlots(slots)

  return (
    <div className="space-y-5">
      {groups.map(({ label, slots: groupSlots }) => (
        <div key={label}>
          <p className="text-xs font-semibold text-warm-gray uppercase tracking-widest mb-2.5">{label}</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {groupSlots.map((slot) => {
              const isSelected = selectedSlot?.startTime === slot.startTime
              return (
                <button
                  key={slot.startTime}
                  onClick={() => onSelect(slot)}
                  disabled={disabled}
                  className={`py-3.5 px-2 rounded-2xl text-sm font-semibold transition-all
                    ${disabled && !isSelected ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}
                    ${isSelected
                      ? 'bg-charcoal text-white shadow-md'
                      : 'bg-white text-charcoal shadow-card hover:bg-brass-light hover:text-brass-dark'
                    }`}
                >
                  {slot.startTime}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
