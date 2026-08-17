import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import Service from '@/models/Service'
import { getSessionFromRequest } from '@/lib/getSession'
import { ok, err } from '@/lib/apiResponse'

function getMonthRange() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const from = `${y}-${m}-01`
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate()
  const to = `${y}-${m}-${String(lastDay).padStart(2, '0')}`
  return { from, to }
}

function getWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { from: fmt(monday), to: fmt(sunday) }
}

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session || session.role !== 'barber') return err('Forbidden', 403)

  await connectDB()

  const { from: weekFrom, to: weekTo } = getWeekRange()
  const { from: monthFrom, to: monthTo } = getMonthRange()

  const [weekBookings, monthBookings] = await Promise.all([
    Booking.find({
      barberId: session.userId,
      date: { $gte: weekFrom, $lte: weekTo },
      status: { $in: ['confirmed', 'completed'] },
    }).populate('serviceId', 'name price').lean(),
    Booking.find({
      barberId: session.userId,
      date: { $gte: monthFrom, $lte: monthTo },
      status: { $in: ['confirmed', 'completed'] },
    }).populate('serviceId', 'name price').lean(),
  ])

  const sum = (bookings: typeof weekBookings) =>
    bookings.reduce((acc, b) => {
      const svc = b.serviceId as { price?: number } | null
      return acc + (svc?.price ?? 0)
    }, 0)

  // Service breakdown for this month
  const serviceMap: Record<string, { name: string; count: number; revenue: number }> = {}
  for (const b of monthBookings) {
    const svc = b.serviceId as { _id: { toString(): string }; name?: string; price?: number } | null
    if (!svc) continue
    const id = svc._id.toString()
    serviceMap[id] ??= { name: svc.name ?? 'Unknown', count: 0, revenue: 0 }
    serviceMap[id].count++
    serviceMap[id].revenue += svc.price ?? 0
  }

  const byService = Object.values(serviceMap).sort((a, b) => b.revenue - a.revenue)

  // Daily breakdown for this month (for simple chart)
  const dailyMap: Record<string, number> = {}
  for (const b of monthBookings) {
    const svc = b.serviceId as { price?: number } | null
    dailyMap[b.date] = (dailyMap[b.date] ?? 0) + (svc?.price ?? 0)
  }
  const daily = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }))

  return ok({
    week: { revenue: sum(weekBookings), bookings: weekBookings.length },
    month: { revenue: sum(monthBookings), bookings: monthBookings.length },
    byService,
    daily,
  })
}
