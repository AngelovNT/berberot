import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import WorkingHours from '@/models/WorkingHours'
import { getSessionFromRequest } from '@/lib/getSession'
import { ok, err } from '@/lib/apiResponse'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) return err('Unauthorized', 401)
    if (session.role !== 'barber') return err('Forbidden', 403)

    await connectDB()

    const wh = await WorkingHours.findOne({ barberId: session.userId }).lean()
    return ok(wh)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) return err('Unauthorized', 401)
    if (session.role !== 'barber') return err('Forbidden', 403)

    await connectDB()

    const body = await request.json()
    const { schedule, bufferMinutes } = body

    if (!schedule) {
      return err('Schedule is required', 400)
    }

    const update: Record<string, unknown> = { barberId: session.userId, schedule }
    if (typeof bufferMinutes === 'number') update.bufferMinutes = bufferMinutes

    const wh = await WorkingHours.findOneAndUpdate(
      { barberId: session.userId },
      update,
      { upsert: true, new: true }
    )

    return ok(wh)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
