import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Service from '@/models/Service'
import User from '@/models/User'
import { getSessionFromRequest } from '@/lib/getSession'
import { ok, err } from '@/lib/apiResponse'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const shopId = request.nextUrl.searchParams.get('shopId')
    const filter = shopId ? { barberShopId: shopId } : {}
    const services = await Service.find(filter).lean()
    return ok(services)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) return err('Unauthorized', 401)
    if (session.role !== 'barber' && session.role !== 'admin') return err('Forbidden', 403)

    await connectDB()

    const body = await request.json()
    const { name, price, duration } = body

    if (!name || price == null || !duration) {
      return err('Name, price, and duration are required', 400)
    }

    // Find user's barberShopId
    const user = await User.findById(session.userId)
    if (!user?.barberShopId) {
      return err('You must create a barbershop first', 400)
    }

    const service = await Service.create({
      name,
      price,
      duration,
      barberShopId: user.barberShopId,
    })

    return ok(service, 201)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
