'use client'

import { useState, useEffect, FormEvent } from 'react'
import Button from '@/components/ui/Button'
import { WeekSchedule, ITimeWindow } from '@/types'
import { DAYS_OF_WEEK } from '@/lib/constants'

type DayKey = typeof DAYS_OF_WEEK[number]

interface DayState {
  enabled: boolean
  start: string
  end: string
}

const defaultDays: Record<DayKey, DayState> = {
  monday: { enabled: true, start: '09:00', end: '17:00' },
  tuesday: { enabled: true, start: '09:00', end: '17:00' },
  wednesday: { enabled: true, start: '09:00', end: '17:00' },
  thursday: { enabled: true, start: '09:00', end: '17:00' },
  friday: { enabled: true, start: '09:00', end: '17:00' },
  saturday: { enabled: false, start: '09:00', end: '14:00' },
  sunday: { enabled: false, start: '09:00', end: '14:00' },
}

export default function WorkingHoursForm() {
  const [days, setDays] = useState<Record<DayKey, DayState>>(defaultDays)
  const [bufferMinutes, setBufferMinutes] = useState(0)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/working-hours')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const schedule: WeekSchedule = json.data.schedule
          const updated = { ...defaultDays }
          for (const day of DAYS_OF_WEEK) {
            const windows = schedule[day]
            if (windows && windows.length > 0) {
              updated[day] = {
                enabled: true,
                start: (windows[0] as ITimeWindow).start,
                end: (windows[0] as ITimeWindow).end,
              }
            } else {
              updated[day] = { ...defaultDays[day], enabled: false }
            }
          }
          setDays(updated)
          setBufferMinutes(json.data.bufferMinutes ?? 0)
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  const toggle = (day: DayKey) => {
    setDays((prev) => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }))
  }

  const updateTime = (day: DayKey, field: 'start' | 'end', value: string) => {
    setDays((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSaved(false)

    const schedule: WeekSchedule = {}
    for (const day of DAYS_OF_WEEK) {
      schedule[day] = days[day].enabled ? [{ start: days[day].start, end: days[day].end }] : []
    }

    try {
      const res = await fetch('/api/working-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule, bufferMinutes }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.message ?? 'Failed to save')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="animate-pulse h-64 bg-charcoal-100 rounded-xl" />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Buffer time */}
      <div className="bg-ivory border border-border-warm rounded-xl p-4 mb-2">
        <label className="block text-sm font-medium text-[#111] mb-1">
          Buffer Time Between Bookings
        </label>
        <p className="text-xs text-warm-gray mb-3">
          Automatically blocks time after each booking for cleanup/prep.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={60}
            step={5}
            value={bufferMinutes}
            onChange={(e) => setBufferMinutes(Number(e.target.value))}
            className="w-24 bg-white border border-gray-300 text-[#111] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal"
          />
          <span className="text-sm text-warm-gray">minutes</span>
        </div>
      </div>

      {/* Days */}
      {DAYS_OF_WEEK.map((day) => (
        <div
          key={day}
          className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-border-warm last:border-0"
        >
          <div className="flex items-center gap-3 w-36">
            <button
              type="button"
              onClick={() => toggle(day)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                days[day].enabled ? 'bg-charcoal' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  days[day].enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm font-medium capitalize text-[#111]">{day}</span>
          </div>

          {days[day].enabled ? (
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={days[day].start}
                onChange={(e) => updateTime(day, 'start', e.target.value)}
                className="bg-white border border-gray-300 text-[#111] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal"
              />
              <span className="text-warm-gray text-sm">to</span>
              <input
                type="time"
                value={days[day].end}
                onChange={(e) => updateTime(day, 'end', e.target.value)}
                className="bg-white border border-gray-300 text-[#111] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal"
              />
            </div>
          ) : (
            <span className="text-sm text-warm-gray">Day off</span>
          )}
        </div>
      ))}

      {error && (
        <div className="bg-soft-red-light border border-soft-red/20 text-soft-red text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
          Working hours saved!
        </div>
      )}

      <Button type="submit" loading={loading}>
        Save Working Hours
      </Button>
    </form>
  )
}
