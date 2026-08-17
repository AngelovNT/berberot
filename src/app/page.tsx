import Link from 'next/link'
import { Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import { getSession } from '@/lib/getSession'
import connectDB from '@/lib/mongodb'
import BarberShopModel from '@/models/BarberShop'
import ServiceModel from '@/models/Service'
import UserModel from '@/models/User'
import BookingModel from '@/models/Booking'
import { getNextAvailableSlot, formatNextSlotLabel, NextSlotResult } from '@/lib/nextSlot'
import SmartRebook from '@/components/SmartRebook'
import BookNextAvailable from '@/components/booking/BookNextAvailable'
import DiscoveryFilter from '@/components/DiscoveryFilter'

async function getData() {
  try {
    await connectDB()
    const shops = await BarberShopModel.find({ isActive: true }).lean()
    const shopIds = shops.map((s: { _id: unknown }) => s._id)

    const [services, barbers] = await Promise.all([
      ServiceModel.find({ barberShopId: { $in: shopIds } })
        .select('barberShopId name price duration')
        .lean(),
      UserModel.find({ barberShopId: { $in: shopIds }, role: 'barber' })
        .select('barberShopId')
        .lean(),
    ])

    const barberIds = barbers.map((b) => b._id)
    const ratingAggs = await BookingModel.aggregate<{ _id: unknown; avg: number; count: number }>([
      { $match: { barberId: { $in: barberIds }, rating: { $exists: true, $ne: null } } },
      { $lookup: { from: 'users', localField: 'barberId', foreignField: '_id', as: 'barber' } },
      { $unwind: '$barber' },
      { $group: { _id: '$barber.barberShopId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ])

    const ratingMap: Record<string, { avg: number; count: number }> = {}
    for (const r of ratingAggs) ratingMap[String(r._id)] = { avg: r.avg, count: r.count }

    const nextSlots = await Promise.all(shops.map((s) => getNextAvailableSlot(String(s._id))))
    const nextSlotMap: Record<string, NextSlotResult | null> = {}
    shops.forEach((s, i) => { nextSlotMap[String(s._id)] = nextSlots[i] })

    return { shops, services, ratingMap, nextSlotMap }
  } catch {
    return { shops: [], services: [], ratingMap: {}, nextSlotMap: {} }
  }
}

interface Shop { _id: string; name: string; location: string; coverImage?: string }
interface Service { _id: string; barberShopId: string; name: string; price: number; duration: number }

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string }>
}) {
  const { sort = 'soonest', q = '' } = await searchParams
  const [session, { shops, services, ratingMap, nextSlotMap }] = await Promise.all([getSession(), getData()])

  const servicesByShop = (services as unknown as Service[]).reduce<Record<string, Service[]>>((acc, svc) => {
    const key = svc.barberShopId.toString()
    if (!acc[key]) acc[key] = []
    acc[key].push(svc)
    return acc
  }, {})

  let filteredShops = (shops as unknown as Shop[])
  if (q) {
    const ql = q.toLowerCase()
    filteredShops = filteredShops.filter(s => s.name.toLowerCase().includes(ql) || s.location.toLowerCase().includes(ql))
  }

  if (sort === 'rated') {
    filteredShops = [...filteredShops].sort((a, b) => {
      const ra = ratingMap[a._id.toString()]?.avg ?? 0
      const rb = ratingMap[b._id.toString()]?.avg ?? 0
      return rb - ra
    })
  } else {
    filteredShops = [...filteredShops].sort((a, b) => {
      const sa = nextSlotMap[a._id.toString()]
      const sb = nextSlotMap[b._id.toString()]
      if (sa && !sb) return -1
      if (!sa && sb) return 1
      if (sa && sb) return (sa.date + sa.slot).localeCompare(sb.date + sb.slot)
      return 0
    })
  }

  return (
    <div className="min-h-screen bg-ivory pb-20 sm:pb-0">
      <Navbar />

      {/* Dark Hero */}
      <section className="bg-charcoal px-4 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto text-center">
          {session ? (
            <>
              <p className="text-xs font-semibold text-brass uppercase tracking-widest mb-4">Welcome back</p>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight" style={{ textWrap: 'balance' }}>
                {session.name}
              </h1>
              <p className="text-white/50 mt-3 text-lg">Ready for your next cut?</p>
              <div className="flex gap-3 justify-center mt-8 flex-wrap">
                <a href="#shops" className="bg-brass hover:bg-brass-dark text-white px-7 py-3.5 rounded-2xl font-semibold transition-all shadow-sm hover:shadow-md">
                  Book Appointment
                </a>
                <Link href="/my-bookings" className="bg-white/10 hover:bg-white/20 text-white px-7 py-3.5 rounded-2xl font-semibold transition-colors">
                  My Bookings
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-brass uppercase tracking-widest mb-4">Premium barbershop booking</p>
              <h1 className="font-display text-4xl sm:text-6xl font-bold text-white leading-tight tracking-tight" style={{ textWrap: 'balance' }}>
                Book your next cut
              </h1>
              <p className="text-white/50 mt-4 text-lg">Find the best barbershops near you and book in seconds.</p>
              <div className="flex gap-3 justify-center mt-8 flex-wrap">
                <a href="#shops" className="bg-brass hover:bg-brass-dark text-white px-7 py-3.5 rounded-2xl font-semibold transition-all shadow-sm hover:shadow-md">
                  Find a Barber
                </a>
                <Link href="/register" className="bg-white/10 hover:bg-white/20 text-white px-7 py-3.5 rounded-2xl font-semibold transition-colors">
                  Get Started — it&apos;s free
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Smart rebook banner */}
      {session?.role === 'customer' && <SmartRebook />}

      {/* Barbershops */}
      <section id="shops" className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-charcoal">Barbershops</h2>
            <p className="text-warm-gray text-sm mt-0.5">
              {q ? `Results for "${q}"` : sort === 'rated' ? 'Sorted by top rating' : 'Sorted by soonest available'}
            </p>
          </div>
        </div>

        <Suspense fallback={null}>
          <DiscoveryFilter />
        </Suspense>

        {filteredShops.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border-warm shadow-card">
            <p className="text-4xl mb-3">✂️</p>
            <p className="text-warm-gray">{q ? `No barbershops match "${q}"` : 'No barbershops listed yet. Check back soon!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredShops.map((shop) => {
              const shopServices = servicesByShop[shop._id.toString()] ?? []
              const preview = shopServices.slice(0, 2)
              const rating = ratingMap[shop._id.toString()]
              const nextSlot = nextSlotMap[shop._id.toString()]
              const nextLabel = formatNextSlotLabel(nextSlot)

              return (
                <div key={shop._id.toString()} className="bg-white rounded-2xl border border-border-warm shadow-card hover:shadow-card-hover hover:border-charcoal transition-all overflow-hidden group flex flex-col">
                  <div className="h-44 bg-gradient-to-br from-charcoal-800 to-charcoal overflow-hidden flex-shrink-0">
                    {shop.coverImage ? (
                      <img src={shop.coverImage} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">✂️</div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-display font-bold text-charcoal text-lg leading-tight">{shop.name}</h3>
                      {rating && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-amber-400 text-sm">★</span>
                          <span className="text-sm font-semibold text-charcoal">{rating.avg.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-warm-gray mb-3">📍 {shop.location}</p>

                    {nextLabel && (
                      <p className="text-xs text-brass-dark font-semibold mb-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brass inline-block" />
                        Next: {nextLabel}
                      </p>
                    )}

                    {preview.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {preview.map((svc) => (
                          <span key={svc._id.toString()} className="text-xs bg-charcoal-50 text-warm-gray border border-border-warm rounded-full px-2.5 py-1 font-medium">
                            {svc.name} · €{svc.price}
                          </span>
                        ))}
                        {shopServices.length > 2 && (
                          <span className="text-xs text-warm-gray px-2 py-1">+{shopServices.length - 2} more</span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto space-y-2">
                      <Link href={`/shop/${shop._id}`} className="block w-full text-center bg-charcoal hover:bg-charcoal-800 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm">
                        View &amp; Book
                      </Link>
                      <BookNextAvailable shopId={shop._id.toString()} initial={nextSlot} label={nextLabel} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <footer className="bg-white border-t border-border-warm text-warm-gray text-center py-8 space-y-2">
        <p className="font-display text-lg font-bold tracking-widest text-charcoal">CLIPR<span className="text-brass">.</span></p>
        <p className="text-sm">© {new Date().getFullYear()} Clipr. All rights reserved.</p>
        <div className="flex items-center justify-center gap-4 text-xs">
          <Link href="/privacy" className="hover:text-charcoal transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-charcoal transition-colors">Terms of Service</Link>
          <span>·</span>
          <a href="mailto:legal@berberot.com" className="hover:text-charcoal transition-colors">legal@berberot.com</a>
        </div>
      </footer>
    </div>
  )
}
