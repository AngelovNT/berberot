import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getSession } from '@/lib/getSession'
import { ok, err } from '@/lib/apiResponse'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return err('Unauthorized', 401)
    }

    await connectDB()

    const user = await User.findById(session.userId).select('-password')
    if (!user) {
      return err('User not found', 404)
    }

    return ok({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      barberShopId: user.barberShopId,
      isActive: user.isActive,
      phone: user.phone,
      photo: user.photo,
    })
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
