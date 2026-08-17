import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import BarberShopModel from '@/models/BarberShop'
import { sendSMS, buildReminderMessage } from '@/lib/sms'

// Called by Vercel Cron every 30 minutes.
// Sends SMS to customers whose booking starts in ~2 hours and hasn't been reminded yet.

export async function GET(request: NextRequest) {
  // Protect the endpoint with a secret
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    // Find bookings starting between 1h45m and 2h15m from now
    const windowStart = new Date(now.getTime() + 105 * 60 * 1000) // +1h45m
    const windowEnd = new Date(now.getTime() + 135 * 60 * 1000)   // +2h15m

    const toHHMM = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    const winStart = toHHMM(windowStart)
    const winEnd = toHHMM(windowEnd)

    const bookings = await Booking.find({
      date: todayStr,
      status: 'confirmed',
      reminderSent: { $ne: true },
      startTime: { $gte: winStart, $lte: winEnd },
    })
      .populate('userId', 'name phone')
      .populate('serviceId', 'name')
      .populate({ path: 'barberId', select: 'name barberShopId' })
      .lean()

    let sent = 0

    for (const booking of bookings) {
      const customer = booking.userId as { name?: string; phone?: string }
      const service = booking.serviceId as { name?: string }
      const barber = booking.barberId as { name?: string; barberShopId?: unknown }

      const phone = customer?.phone
      if (!phone) continue

      let shopName = 'the barbershop'
      if (barber?.barberShopId) {
        const shop = await BarberShopModel.findById(barber.barberShopId).select('name').lean()
        if (shop) shopName = shop.name
      }

      const msg = buildReminderMessage({
        customerName: customer.name ?? 'there',
        serviceName: service.name ?? 'appointment',
        startTime: booking.startTime,
        date: booking.date,
        barberName: barber.name ?? 'your barber',
        shopName,
      })

      const ok = await sendSMS(phone, msg)
      if (ok) {
        await Booking.findByIdAndUpdate(booking._id, { reminderSent: true })
        sent++
      }
    }

    // Auto-create next recurring booking for completed bookings
    const completedRecurring = await Booking.find({
      status: 'completed',
      recurrenceWeeks: { $exists: true, $gt: 0 },
    }).lean()

    let recurringCreated = 0
    for (const b of completedRecurring) {
      const weeks = b.recurrenceWeeks ?? 0
      if (!weeks) continue
      const nextDate = new Date(b.date + 'T00:00:00')
      nextDate.setDate(nextDate.getDate() + weeks * 7)
      const nextDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`
      const existing = await Booking.findOne({ barberId: b.barberId, userId: b.userId, date: nextDateStr, startTime: b.startTime })
      if (!existing) {
        const conflict = await Booking.findOne({ barberId: b.barberId, date: nextDateStr, startTime: b.startTime, status: 'confirmed' })
        if (!conflict) {
          await Booking.create({
            barberId: b.barberId,
            userId: b.userId,
            serviceId: b.serviceId,
            date: nextDateStr,
            startTime: b.startTime,
            endTime: b.endTime,
            status: 'confirmed',
            phone: b.phone ?? '',
            recurrenceWeeks: weeks,
          })
          // Clear recurrence on the completed booking so we don't re-process it
          await Booking.findByIdAndUpdate(b._id, { $unset: { recurrenceWeeks: 1 } })
          recurringCreated++
        }
      }
    }

    return NextResponse.json({ ok: true, sent, checked: bookings.length, recurringCreated })
  } catch (e) {
    console.error('[Reminders cron]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
