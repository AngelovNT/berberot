import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import WorkingHours from '@/models/WorkingHours'
import { ok, err } from '@/lib/apiResponse'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ barberId: string }> }
) {
  try {
    await connectDB()
    const { barberId } = await params
    const wh = await WorkingHours.findOne({ barberId }).lean()
    if (!wh) return ok(null)
    return ok(wh)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
