import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import BarberShop from '@/models/BarberShop'
import User from '@/models/User'
import { getSessionFromRequest } from '@/lib/getSession'
import { ok, err } from '@/lib/apiResponse'

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session || session.role !== 'barber') return err('Forbidden', 403)

  const { shopId } = await request.json()
  if (!shopId) return err('shopId is required', 400)

  await connectDB()

  const shop = await BarberShop.findById(shopId)
  if (!shop || !shop.isActive) return err('Shop not found', 404)

  if (session.barberShopId && session.barberShopId !== shopId) {
    return err('You are already linked to a different shop', 400)
  }

  await User.findByIdAndUpdate(session.userId, { barberShopId: shopId })

  return ok({ shopId, shopName: shop.name })
}
