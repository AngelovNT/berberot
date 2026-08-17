import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import BarberShop from '@/models/BarberShop'
import { getSessionFromRequest } from '@/lib/getSession'
import { ok, err } from '@/lib/apiResponse'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const shop = await BarberShop.findById(id).lean()
    if (!shop) return err('Not found', 404)
    return ok(shop)
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

    // Admin can update anything; barber can only update their own shop
    if (session.role !== 'admin') {
      if (session.role !== 'barber') return err('Forbidden', 403)
      if (session.barberShopId !== id) return err('Forbidden', 403)
    }

    const body = await request.json()

    // For non-admin, restrict to profile fields only
    let updateData: Record<string, unknown>
    if (session.role === 'admin') {
      updateData = body
    } else {
      const { name, location, description, coverImage, instagram, facebook, website, promoVideo } = body
      updateData = {}
      if (name !== undefined) updateData.name = name
      if (location !== undefined) updateData.location = location
      if (description !== undefined) updateData.description = description
      if (coverImage !== undefined) updateData.coverImage = coverImage
      if (instagram !== undefined) updateData.instagram = instagram
      if (facebook !== undefined) updateData.facebook = facebook
      if (website !== undefined) updateData.website = website
      if (promoVideo !== undefined) updateData.promoVideo = promoVideo
    }

    const shop = await BarberShop.findByIdAndUpdate(id, updateData, { new: true })
    if (!shop) return err('Not found', 404)

    return ok(shop)
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
    if (session.role !== 'admin') return err('Forbidden', 403)

    await connectDB()
    const { id } = await params
    await BarberShop.findByIdAndDelete(id)
    return ok({ deleted: true })
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
