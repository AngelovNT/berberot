import connectDB from './mongodb'
import WorkingHours from '@/models/WorkingHours'
import Booking from '@/models/Booking'
import BlockedDate from '@/models/BlockedDate'
import { ITimeSlot, WeekSchedule } from '@/types'

const DAYS: (keyof WeekSchedule)[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export async function getAvailableSlots(params: {
  barberId: string
  date: string
  duration: number
}): Promise<ITimeSlot[]> {
  await connectDB()

  const { barberId, date, duration } = params

  const [workingHours, blocked] = await Promise.all([
    WorkingHours.findOne({ barberId }),
    BlockedDate.findOne({ barberId, date }),
  ])
  if (!workingHours) return []
  if (blocked) return []

  const dateObj = new Date(date + 'T00:00:00')
  const dayIndex = dateObj.getDay()
  const dayName = DAYS[dayIndex]

  const schedule = workingHours.schedule as WeekSchedule
  const windows = schedule[dayName]
  if (!windows || windows.length === 0) return []

  const bufferMinutes: number = workingHours.bufferMinutes ?? 0

  const allSlots: ITimeSlot[] = []

  for (const window of windows) {
    const startMin = timeToMinutes(window.start)
    const endMin = timeToMinutes(window.end)
    let current = startMin

    while (current + duration <= endMin) {
      allSlots.push({
        startTime: minutesToTime(current),
        endTime: minutesToTime(current + duration),
      })
      current += duration
    }
  }

  // Fetch confirmed bookings for this barber on this date
  const bookings = await Booking.find({
    barberId,
    date,
    status: { $in: ['confirmed', 'completed'] },
  })

  // Build blocked ranges: [bookingStart, bookingEnd + buffer)
  const blockedRanges = bookings.map((b: { startTime: string; endTime: string }) => ({
    from: timeToMinutes(b.startTime),
    to: timeToMinutes(b.endTime) + bufferMinutes,
  }))

  // A slot is available only if it doesn't overlap any blocked range
  let filtered = allSlots.filter((slot) => {
    const slotStart = timeToMinutes(slot.startTime)
    const slotEnd = timeToMinutes(slot.endTime)
    return !blockedRanges.some((range) => slotStart < range.to && slotEnd > range.from)
  })

  // Filter out past slots if date is today
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  if (date === todayStr) {
    const nowMinutes = today.getHours() * 60 + today.getMinutes()
    filtered = filtered.filter((slot) => timeToMinutes(slot.startTime) > nowMinutes)
  }

  return filtered
}
