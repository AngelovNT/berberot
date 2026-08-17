import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { ok, err } from '@/lib/apiResponse'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    await connectDB()
    const { shopId } = await params

    const barbers = await User.find({
      role: 'barber',
      barberShopId: shopId,
      isActive: true,
    })
      .select('-password')
      .lean()

    return ok(barbers)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
