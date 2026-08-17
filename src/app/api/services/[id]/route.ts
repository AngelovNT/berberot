import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Service from '@/models/Service'
import User from '@/models/User'
import { getSessionFromRequest } from '@/lib/getSession'
import { ok, err } from '@/lib/apiResponse'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const service = await Service.findById(id).lean()
    if (!service) return err('Not found', 404)
    return ok(service)
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
    if (session.role !== 'barber' && session.role !== 'admin') return err('Forbidden', 403)

    await connectDB()
    const { id } = await params

    const service = await Service.findById(id)
    if (!service) return err('Not found', 404)

    // Verify ownership
    if (session.role === 'barber') {
      const user = await User.findById(session.userId)
      if (!user?.barberShopId || service.barberShopId.toString() !== user.barberShopId.toString()) {
        return err('Forbidden', 403)
      }
    }

    const body = await request.json()
    const updated = await Service.findByIdAndUpdate(id, body, { new: true })
    return ok(updated)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) return err('Unauthorized', 401)
    if (session.role !== 'barber' && session.role !== 'admin') return err('Forbidden', 403)

    await connectDB()
    const { id } = await params

    const service = await Service.findById(id)
    if (!service) return err('Not found', 404)

    if (session.role === 'barber') {
      const user = await User.findById(session.userId)
      if (!user?.barberShopId || service.barberShopId.toString() !== user.barberShopId.toString()) {
        return err('Forbidden', 403)
      }
    }

    await Service.findByIdAndDelete(id)
    return ok({ deleted: true })
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
