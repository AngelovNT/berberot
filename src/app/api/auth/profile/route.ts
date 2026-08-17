import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getSessionFromRequest } from '@/lib/getSession'
import { ok, err } from '@/lib/apiResponse'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) return err('Unauthorized', 401)

    await connectDB()

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return err('Current and new password are required', 400)
    }

    if (newPassword.length < 6) {
      return err('New password must be at least 6 characters', 400)
    }

    const user = await User.findById(session.userId)
    if (!user) return err('User not found', 404)

    const valid = await user.comparePassword(currentPassword)
    if (!valid) return err('Current password is incorrect', 400)

    user.password = newPassword
    await user.save()

    return ok({ message: 'Password updated' })
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
