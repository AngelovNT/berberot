import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Service from '@/models/Service'
import { getAvailableSlots } from '@/lib/slots'
import { ok, err } from '@/lib/apiResponse'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const barberId = searchParams.get('barberId')
    const date = searchParams.get('date')
    const serviceId = searchParams.get('serviceId')

    if (!barberId || !date || !serviceId) {
      return err('barberId, date, and serviceId are required', 400)
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return err('Invalid date format, use YYYY-MM-DD', 400)
    }

    await connectDB()

    const service = await Service.findById(serviceId)
    if (!service) return err('Service not found', 404)

    const slots = await getAvailableSlots({
      barberId,
      date,
      duration: service.duration,
    })

    return ok(slots)
  } catch (e) {
    console.error(e)
    return err('Server error', 500)
  }
}
