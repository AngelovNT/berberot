import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import { getSessionFromRequest } from '@/lib/getSession'
import { ok, err } from '@/lib/apiResponse'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) return err('Unauthorized', 401)

    await connectDB()

    const { searchParams } = request.nextUrl
    const date = searchParams.get('date')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let filter: Record<string, unknown> = {}

    if (session.role === 'customer') {
      filter = { userId: session.userId }
    } else if (session.role === 'barber') {
      filter = { barberId: session.userId }
      if (date) {
        filter.date = date
      } else if (from || to) {
        const dateFilter: Record<string, string> = {}
        if (from) dateFilter.$gte = from
        if (to) dateFilter.$lte = to
        filter.date = dateFilter
      }
    } else if (session.role === 'admin') {
      if (date) filter.date = date
    }

    const bookings = await Booking.find(filter)
      .populate('serviceId', 'name price duration')
      .populate('userId', 'name email phone')
      .populate({
        path: 'barberId',
        select: 'name email photo barberShopId',
        populate: { path: 'barberShopId', select: 'name' },
      })
      .sort({ date: 1, startTime: 1 })
      .lean()

    return ok(bookings)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) return err('Unauthorized', 401)
    if (session.role !== 'customer' && session.role !== 'barber') return err('Forbidden', 403)

    await connectDB()

    const body = await request.json()
    const { barberId, serviceId, date, startTime, endTime, phone, userId: bodyUserId, recurrenceWeeks } = body

    if (!barberId || !serviceId || !date || !startTime || !endTime) {
      return err('All fields are required', 400)
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return err('Invalid date format', 400)
    }

    // Barbers can pass userId to book on behalf of a client
    // Customers always book for themselves
    let userId: string
    if (session.role === 'barber') {
      if (!bodyUserId) return err('userId is required when booking as barber', 400)
      userId = bodyUserId
    } else {
      if (!phone) return err('Phone number is required', 400)
      userId = session.userId
    }

    const conflict = await Booking.findOne({ barberId, date, startTime, status: 'confirmed' })
    if (conflict) return err('This time slot is already booked', 409)

    const booking = await Booking.create({
      barberId,
      userId,
      serviceId,
      date,
      startTime,
      endTime,
      status: 'confirmed',
      phone: phone ?? '',
      ...(recurrenceWeeks && recurrenceWeeks >= 1 && recurrenceWeeks <= 12
        ? { recurrenceWeeks: Number(recurrenceWeeks) }
        : {}),
    })

    const populated = await booking.populate([
      { path: 'serviceId', select: 'name price duration' },
      { path: 'userId', select: 'name email phone' },
      { path: 'barberId', select: 'name email' },
    ])

    return ok(populated, 201)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
