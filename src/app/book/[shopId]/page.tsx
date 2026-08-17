import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import ServicePicker from '@/components/booking/ServicePicker'
import BookingStepIndicator from '@/components/booking/BookingStepIndicator'
import { IBarberShop, IService } from '@/types'

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

async function getServices(shopId: string): Promise<IService[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/services?shopId=${shopId}`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

export default async function BookShopPage({
  params,
}: {
  params: Promise<{ shopId: string }>
}) {
  const { shopId } = await params
  const [shop, services] = await Promise.all([getShop(shopId), getServices(shopId)])

  if (!shop) notFound()

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <BookingStepIndicator currentStep={1} />
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111]">{shop.name}</h1>
          <p className="text-warm-gray text-sm mt-1">📍 {shop.location}</p>
          <p className="text-warm-gray mt-3 font-medium">Select a service</p>
        </div>
        <ServicePicker services={services} shopId={shopId} />
      </div>
    </div>
  )
}
