import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import BarberPicker from '@/components/booking/BarberPicker'
import BookingStepIndicator from '@/components/booking/BookingStepIndicator'
import { IUser, IService, IBarberShop } from '@/types'
import connectDB from '@/lib/mongodb'
import BookingModel from '@/models/Booking'
import mongoose from 'mongoose'

async function getShop(shopId: string): Promise<IBarberShop | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/barbershops/${shopId}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return json.data
  } catch {
    return null
  }
}

async function getService(serviceId: string): Promise<IService | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/services/${serviceId}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return json.data
  } catch {
    return null
  }
}

async function getBarbers(shopId: string): Promise<IUser[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/barbers/${shopId}`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

export default async function SelectBarberPage({
  params,
}: {
  params: Promise<{ shopId: string; serviceId: string }>
}) {
  const { shopId, serviceId } = await params
  const [shop, service, barbers] = await Promise.all([
    getShop(shopId),
    getService(serviceId),
    getBarbers(shopId),
  ])

  if (!shop || !service) notFound()

  // Fetch barber ratings
  let ratingMap: Record<string, { avg: number; count: number }> = {}
  try {
    await connectDB()
    const barberIds = barbers.map((b) => new mongoose.Types.ObjectId(b._id))
    const ratings = await BookingModel.aggregate<{ _id: unknown; avg: number; count: number }>([
      { $match: { barberId: { $in: barberIds }, rating: { $exists: true } } },
      { $group: { _id: '$barberId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ])
    for (const r of ratings) {
      ratingMap[String(r._id)] = { avg: r.avg, count: r.count }
    }
  } catch { /* ignore, show barbers without ratings */ }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <BookingStepIndicator currentStep={2} />

        {/* Selection summary */}
        <div className="bg-white border border-border-warm rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-charcoal rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</div>
          <div>
            <p className="text-xs text-warm-gray">{shop.name}</p>
            <p className="font-semibold text-[#111] text-sm">{service.name} · {service.duration} min · €{service.price}</p>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111]">Select a Barber</h1>
          <p className="text-warm-gray text-sm mt-1">Choose who will be cutting your hair</p>
        </div>
        <BarberPicker barbers={barbers} shopId={shopId} serviceId={serviceId} ratings={ratingMap} />
      </div>
    </div>
  )
}
