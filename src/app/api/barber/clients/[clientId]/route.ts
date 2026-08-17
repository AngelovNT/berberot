import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import BarberClientMeta from '@/models/BarberClientMeta'
import { getSessionFromRequest } from '@/lib/getSession'
import { ok, err } from '@/lib/apiResponse'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'barber') return err('Forbidden', 403)

    const { clientId } = await params
    await connectDB()

    const body = await request.json()
    const update: { notes?: string; isFavorite?: boolean } = {}
    if (typeof body.notes === 'string') update.notes = body.notes
    if (typeof body.isFavorite === 'boolean') update.isFavorite = body.isFavorite

    const meta = await BarberClientMeta.findOneAndUpdate(
      { barberId: session.userId, clientId },
      { $set: update },
      { upsert: true, new: true }
    )

    return ok(meta)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
