import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import { getSessionFromRequest } from '@/lib/getSession'
import { ok, err } from '@/lib/apiResponse'

const VALID_STATUSES = ['confirmed', 'cancelled', 'completed', 'no-show']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) return err('Unauthorized', 401)

    await connectDB()
    const { id } = await params

    const booking = await Booking.findById(id)
      .populate('serviceId', 'name price duration')
      .populate('userId', 'name email')
      .populate('barberId', 'name email')
      .lean()

    if (!booking) return err('Not found', 404)

    const userId = (booking.userId as { _id: { toString(): string } })._id?.toString()
    const barberId = (booking.barberId as { _id: { toString(): string } })._id?.toString()

    if (
      session.role !== 'admin' &&
      session.userId !== userId &&
      session.userId !== barberId
    ) {
      return err('Forbidden', 403)
    }

    return ok(booking)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) return err('Unauthorized', 401)

    await connectDB()
    const { id } = await params

    const booking = await Booking.findById(id)
    if (!booking) return err('Not found', 404)

    const userId = booking.userId.toString()
    const barberId = booking.barberId.toString()

    if (
      session.role !== 'admin' &&
      session.userId !== userId &&
      session.userId !== barberId
    ) {
      return err('Forbidden', 403)
    }

    const body = await request.json()
    const { status, rating, reviewText } = body

    if (status && !VALID_STATUSES.includes(status)) {
      return err('Invalid status', 400)
    }

    // Only barbers/admin can mark completed or no-show
    if ((status === 'completed' || status === 'no-show') && session.role === 'customer') {
      return err('Forbidden', 403)
    }

    // Enforce 2-hour cancellation policy for customers
    if (status === 'cancelled' && session.role === 'customer') {
      const bookingDateTime = new Date(`${booking.date}T${booking.startTime}:00`)
      const hoursUntil = (bookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60)
      if (hoursUntil < 2) {
        return err('Cancellations are only allowed up to 2 hours before your appointment', 400)
      }
    }

    // Only customers can submit ratings/reviews, only on completed bookings
    if (rating !== undefined) {
      if (session.role !== 'customer') return err('Only customers can rate', 403)
      if (booking.status !== 'completed') return err('Can only rate completed bookings', 400)
      if (rating < 1 || rating > 5) return err('Rating must be 1–5', 400)
      booking.rating = rating
    }
    if (reviewText !== undefined) {
      if (session.role !== 'customer') return err('Only customers can review', 403)
      if (booking.status !== 'completed') return err('Can only review completed bookings', 400)
      booking.reviewText = String(reviewText).slice(0, 500)
    }

    if (status) booking.status = status
    await booking.save()

    return ok(booking)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
