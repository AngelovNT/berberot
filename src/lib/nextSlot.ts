import connectDB from './mongodb'
import UserModel from '@/models/User'
import ServiceModel from '@/models/Service'
import { getAvailableSlots } from './slots'

export interface NextSlotResult {
  slot: string
  endTime: string
  date: string
  barberId: string
  barberName: string
  serviceId: string
}

function getDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export async function getNextAvailableSlot(shopId: string): Promise<NextSlotResult | null> {
  try {
    await connectDB()
    const barbers = await UserModel.find({ barberShopId: shopId, role: 'barber', isActive: true }).lean()
    if (barbers.length === 0) return null

    const service = await ServiceModel.findOne({ barberShopId: shopId }).lean()
    const duration = service?.duration ?? 30

    const now = new Date()
    for (let dayOffset = 0; dayOffset <= 6; dayOffset++) {
      const checkDate = new Date(now)
      checkDate.setDate(now.getDate() + dayOffset)
      const dateStr = getDateStr(checkDate)

      for (const barber of barbers) {
        const slots = await getAvailableSlots({ barberId: String(barber._id), date: dateStr, duration })
        if (slots.length > 0) {
          return {
            slot: slots[0].startTime,
            endTime: slots[0].endTime,
            date: dateStr,
            barberId: String(barber._id),
            barberName: barber.name,
            serviceId: service ? String(service._id) : '',
          }
        }
      }
    }
    return null
  } catch {
    return null
  }
}

export function formatNextSlotLabel(result: NextSlotResult | null): string | null {
  if (!result) return null
  const today = new Date()
  const todayStr = getDateStr(today)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const tomorrowStr = getDateStr(tomorrow)

  if (result.date === todayStr) return `Today ${result.slot}`
  if (result.date === tomorrowStr) return `Tomorrow ${result.slot}`
  const d = new Date(result.date + 'T00:00:00')
  return `${d.toLocaleDateString('en-IE', { weekday: 'short', month: 'short', day: 'numeric' })} ${result.slot}`
}
