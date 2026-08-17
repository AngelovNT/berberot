import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import BarberShop from '@/models/BarberShop'
import User from '@/models/User'
import { getSessionFromRequest } from '@/lib/getSession'
import { ok, err } from '@/lib/apiResponse'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const session = await getSessionFromRequest(request)
    // Admins see all shops; everyone else sees only active
    const filter = session?.role === 'admin' ? {} : { isActive: true }
    const shops = await BarberShop.find(filter).lean()
    return ok(shops)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) return err('Unauthorized', 401)
    if (!['barber', 'admin'].includes(session.role)) return err('Forbidden', 403)

    await connectDB()

    const body = await request.json()
    const { name, location } = body

    if (!name || !location) {
      return err('Name and location are required', 400)
    }

    const shop = await BarberShop.create({
      name,
      location,
      ownerId: session.userId,
    })

    // Update user's barberShopId
    await User.findByIdAndUpdate(session.userId, { barberShopId: shop._id })

    return ok(shop, 201)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
