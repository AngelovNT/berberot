import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import UserModel from '@/models/User'
import ServiceModel from '@/models/Service'
import { getAvailableSlots } from '@/lib/slots'
import { ok, err } from '@/lib/apiResponse'

function getDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    await connectDB()
    const { shopId } = await params

    const barbers = await UserModel.find({ barberShopId: shopId, role: 'barber', isActive: true }).lean()
    if (barbers.length === 0) return ok({ slot: null, date: null })

    const service = await ServiceModel.findOne({ barberShopId: shopId }).lean()
    const duration = service?.duration ?? 30

    const now = new Date()
    for (let dayOffset = 0; dayOffset <= 6; dayOffset++) {
      const checkDate = new Date(now)
      checkDate.setDate(now.getDate() + dayOffset)
      const dateStr = getDateStr(checkDate)

      for (const barber of barbers) {
        const slots = await getAvailableSlots({
          barberId: String(barber._id),
          date: dateStr,
          duration,
        })

        if (slots.length > 0) {
          return ok({
            slot: slots[0].startTime,
            endTime: slots[0].endTime,
            date: dateStr,
            barberId: String(barber._id),
            barberName: barber.name,
            serviceId: service ? String(service._id) : null,
          })
        }
      }
    }

    return ok({ slot: null, date: null })
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
