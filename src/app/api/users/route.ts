import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getSessionFromRequest } from '@/lib/getSession'
import { ok, err } from '@/lib/apiResponse'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) return err('Unauthorized', 401)
    if (session.role !== 'admin') return err('Forbidden', 403)

    await connectDB()

    const role = request.nextUrl.searchParams.get('role')
    const filter = role ? { role } : {}

    const users = await User.find(filter).select('-password').lean()
    return ok(users)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
