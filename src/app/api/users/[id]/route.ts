import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
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
    const user = await User.findById(id).select('-password').lean()
    if (!user) return err('User not found', 404)
    return ok(user)
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
    const body = await request.json()

    let updateData: Record<string, unknown>

    if (session.role === 'admin') {
      // Admin can update isActive
      const { isActive } = body
      updateData = { isActive }
    } else if (session.userId === id) {
      // User can update their own profile fields
      const { photo, phone, name } = body
      updateData = {}
      if (photo !== undefined) updateData.photo = photo
      if (phone !== undefined) updateData.phone = phone
      if (name !== undefined) updateData.name = name
    } else {
      return err('Forbidden', 403)
    }

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password')

    if (!user) return err('User not found', 404)
    return ok(user)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
