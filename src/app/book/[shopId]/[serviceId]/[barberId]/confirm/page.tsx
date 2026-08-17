import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import BookingStepIndicator from '@/components/booking/BookingStepIndicator'
import BookingConfirm from '@/components/booking/BookingConfirm'
import { IBarberShop, IService, IUser } from '@/types'

async function fetchData(shopId: string, serviceId: string, barberId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const [shopRes, serviceRes, barberRes] = await Promise.all([
    fetch(`${baseUrl}/api/barbershops/${shopId}`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/services/${serviceId}`, { cache: 'no-store' }),
    fetch(`${baseUrl}/api/users/${barberId}`, { cache: 'no-store' }),
  ])

  const shop: IBarberShop | null = shopRes.ok ? (await shopRes.json()).data : null
  const service: IService | null = serviceRes.ok ? (await serviceRes.json()).data : null
  const barber: IUser | null = barberRes.ok ? (await barberRes.json()).data : null

  return { shop, service, barber }
}

export default async function ConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ shopId: string; serviceId: string; barberId: string }>
  searchParams: Promise<{ date?: string; startTime?: string; endTime?: string }>
}) {
  const { shopId, serviceId, barberId } = await params
  const { date, startTime, endTime } = await searchParams

  if (!date || !startTime || !endTime) notFound()

  const { shop, service, barber } = await fetchData(shopId, serviceId, barberId)

  if (!shop || !service || !barber) notFound()

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
        <BookingStepIndicator currentStep={4} />
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111]">Confirm Booking</h1>
          <p className="text-warm-gray text-sm mt-1">Review your appointment details</p>
        </div>

        <BookingConfirm
          shopName={shop.name}
          serviceName={service.name}
          servicePrice={service.price}
          serviceDuration={service.duration}
          barberName={barber.name}
          barberPhoto={barber.photo}
          date={date}
          startTime={startTime}
          endTime={endTime}
          barberId={barberId}
          serviceId={serviceId}
        />
      </div>
    </div>
  )
}
