import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Booking from '@/models/Booking'
import BarberClientMeta from '@/models/BarberClientMeta'
import { getSessionFromRequest } from '@/lib/getSession'
import { ok, err } from '@/lib/apiResponse'
import { COOKIE_NAME } from '@/lib/constants'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) return err('Unauthorized', 401)

    await connectDB()

    const user = await User.findById(session.userId)
    if (!user) return err('User not found', 404)

    // Anonymise bookings rather than hard-delete (legal/accounting retention)
    await Booking.updateMany(
      { userId: session.userId },
      { $set: { userId: null, phone: '' } }
    )

    // If barber: anonymise their bookings too
    if (user.role === 'barber') {
      await Booking.updateMany(
        { barberId: session.userId },
        { $set: { barberId: null } }
      )
    }

    // Delete metadata
    await BarberClientMeta.deleteMany({ $or: [{ barberId: session.userId }, { clientId: session.userId }] })

    // Delete the user
    await User.findByIdAndDelete(session.userId)

    const response = ok({ message: 'Account deleted.' })
    response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
    return response
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
