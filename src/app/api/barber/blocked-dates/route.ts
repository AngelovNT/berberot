import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import BlockedDate from '@/models/BlockedDate'
import { getSessionFromRequest } from '@/lib/getSession'
import { ok, err } from '@/lib/apiResponse'

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session || session.role !== 'barber') return err('Forbidden', 403)
  await connectDB()
  const dates = await BlockedDate.find({ barberId: session.userId }).lean()
  return ok(dates)
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session || session.role !== 'barber') return err('Forbidden', 403)
  const { date, reason } = await request.json()
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return err('Valid date required (YYYY-MM-DD)', 400)
  await connectDB()
  const doc = await BlockedDate.findOneAndUpdate(
    { barberId: session.userId, date },
    { barberId: session.userId, date, reason: reason ?? '' },
    { upsert: true, new: true }
  )
  return ok(doc, 201)
}

export async function DELETE(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session || session.role !== 'barber') return err('Forbidden', 403)
  const { date } = await request.json()
  if (!date) return err('date required', 400)
  await connectDB()
  await BlockedDate.deleteOne({ barberId: session.userId, date })
  return ok({ deleted: true })
}
