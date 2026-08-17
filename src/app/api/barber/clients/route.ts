import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Booking from '@/models/Booking'
import BarberClientMeta from '@/models/BarberClientMeta'
import { getSessionFromRequest } from '@/lib/getSession'
import { ok, err } from '@/lib/apiResponse'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'barber') return err('Forbidden', 403)

    await connectDB()

    const { searchParams } = request.nextUrl
    const search = searchParams.get('search')?.toLowerCase() ?? ''
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? 20)))

    // Get all bookings for this barber, populate customer info
    const bookings = await Booking.find({ barberId: session.userId })
      .populate('userId', 'name email phone photo createdAt')
      .populate('serviceId', 'name price duration')
      .sort({ date: -1, startTime: -1 })
      .lean()

    // Fetch all metadata for this barber's clients
    const allMeta = await BarberClientMeta.find({ barberId: session.userId }).lean()
    const metaMap = new Map(allMeta.map((m) => [m.clientId.toString(), m]))

    // Build client map with full stats
    const today = new Date().toISOString().slice(0, 10)
    const clientMap = new Map<string, {
      _id: string
      name: string
      email: string
      phone: string
      photo: string
      totalBookings: number
      noShowCount: number
      upcomingBookings: typeof bookings
      pastBookings: typeof bookings
      notes: string
      isFavorite: boolean
    }>()

    for (const booking of bookings) {
      const user = booking.userId as unknown as { _id: { toString(): string }; name: string; email: string; phone?: string; photo?: string }
      if (!user || typeof user !== 'object') continue

      const id = user._id.toString()
      if (!clientMap.has(id)) {
        const meta = metaMap.get(id)
        clientMap.set(id, {
          _id: id,
          name: user.name,
          email: user.email,
          phone: user.phone ?? '',
          photo: user.photo ?? '',
          totalBookings: 0,
          noShowCount: 0,
          upcomingBookings: [],
          pastBookings: [],
          notes: meta?.notes ?? '',
          isFavorite: meta?.isFavorite ?? false,
        })
      }

      const client = clientMap.get(id)!
      client.totalBookings++
      if (booking.status === 'no-show') client.noShowCount++

      if (booking.status === 'confirmed' && booking.date >= today) {
        client.upcomingBookings.push(booking)
      } else {
        client.pastBookings.push(booking)
      }
    }

    // Also include clients added manually (have BarberClientMeta but no bookings yet)
    const metaOnlyIds = allMeta
      .map((m) => m.clientId)
      .filter((id) => !clientMap.has(id.toString()))

    if (metaOnlyIds.length > 0) {
      const extraUsers = await User.find({ _id: { $in: metaOnlyIds } })
        .select('name email phone photo')
        .lean()
      for (const user of extraUsers) {
        const id = (user._id as { toString(): string }).toString()
        const meta = metaMap.get(id)
        clientMap.set(id, {
          _id: id,
          name: user.name as string,
          email: (user.email as string) ?? '',
          phone: (user.phone as string | undefined) ?? '',
          photo: (user.photo as string | undefined) ?? '',
          totalBookings: 0,
          noShowCount: 0,
          upcomingBookings: [],
          pastBookings: [],
          notes: meta?.notes ?? '',
          isFavorite: meta?.isFavorite ?? false,
        })
      }
    }

    let clients = Array.from(clientMap.values()).sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1
      if (!a.isFavorite && b.isFavorite) return 1
      return b.totalBookings - a.totalBookings
    })

    if (search) {
      clients = clients.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.phone.includes(search)
      )
    }

    const total = clients.length
    const paginated = clients.slice((page - 1) * limit, page * limit)

    return ok({ clients: paginated, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'barber') return err('Forbidden', 403)

    await connectDB()

    const body = await request.json()
    const { name, phone, email, serviceId, date, startTime, endTime } = body

    if (!name || !phone) {
      return err('Name and phone are required', 400)
    }

    // Find or create customer
    let customer = email ? await User.findOne({ email: email.toLowerCase() }) : null

    if (!customer) {
      // Create a new customer account with a random password
      const randomPassword = crypto.randomBytes(16).toString('hex')
      const customerEmail = email || `${phone.replace(/\D/g, '')}@clipr.local`

      // Check if generated email already exists
      const existing = await User.findOne({ email: customerEmail })
      if (existing) {
        customer = existing
      } else {
        customer = await User.create({
          name,
          email: customerEmail,
          password: randomPassword,
          role: 'customer',
          phone,
        })
      }
    } else {
      // Update phone if missing
      if (!customer.phone && phone) {
        customer.phone = phone
        await customer.save()
      }
    }

    // Always link the client to this barber so they appear in the client list
    await BarberClientMeta.updateOne(
      { barberId: session.userId, clientId: customer._id },
      { $setOnInsert: { notes: '', isFavorite: false } },
      { upsert: true }
    )

    // Optionally create a booking
    let booking = null
    if (serviceId && date && startTime && endTime) {
      // Check for conflicts
      const conflict = await Booking.findOne({
        barberId: session.userId,
        date,
        startTime,
        status: 'confirmed',
      })
      if (conflict) return err('This time slot is already booked', 409)

      booking = await Booking.create({
        barberId: session.userId,
        userId: customer._id,
        serviceId,
        date,
        startTime,
        endTime,
        status: 'confirmed',
        phone,
      })
    }

    return ok({ customer, booking }, 201)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
