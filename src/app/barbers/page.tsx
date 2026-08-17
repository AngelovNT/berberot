import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { getSession } from '@/lib/getSession'
import connectDB from '@/lib/mongodb'
import BookingModel from '@/models/Booking'
import BarberShopModel from '@/models/BarberShop'
import UserModel from '@/models/User'

interface ShopWithMeta {
  _id: string
  name: string
  location: string
  coverImage?: string
  visitCount?: number
  lastVisit?: string
}

async function getData(userId?: string) {
  await connectDB()

  if (userId) {
    // Get all this customer's completed/confirmed bookings, populate barber→shop
    const bookings = await BookingModel.find({ userId })
      .populate({
        path: 'barberId',
        select: 'barberShopId',
        populate: { path: 'barberShopId', select: 'name location coverImage isActive' },
      })
      .sort({ date: -1 })
      .lean()

    // Extract unique shops + visit stats
    const shopMap = new Map<string, ShopWithMeta>()
    const visitCounts = new Map<string, number>()
    const lastVisits = new Map<string, string>()

    for (const b of bookings) {
      const barber = b.barberId as unknown as { barberShopId?: { _id: unknown; name: string; location: string; coverImage?: string; isActive?: boolean } }
      const shop = barber?.barberShopId
      if (!shop) continue
      const id = String(shop._id)
      if (!shopMap.has(id) && shop.isActive !== false) {
        shopMap.set(id, {
          _id: id,
          name: shop.name,
          location: shop.location,
          coverImage: shop.coverImage,
        })
      }
      visitCounts.set(id, (visitCounts.get(id) ?? 0) + 1)
      if (!lastVisits.has(id)) lastVisits.set(id, b.date)
    }

    if (shopMap.size > 0) {
      const myShops: ShopWithMeta[] = Array.from(shopMap.values()).map((s) => ({
        ...s,
        visitCount: visitCounts.get(s._id) ?? 0,
        lastVisit: lastVisits.get(s._id),
      }))
      return { myShops, allShops: null }
    }
  }

  // No bookings or not logged in — show all active shops
  const shops = await BarberShopModel.find({ isActive: true }).lean() as unknown as ShopWithMeta[]
  return { myShops: null, allShops: shops }
}

function formatLastVisit(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const diffDays = Math.round((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 14) return `${diffDays} days ago`
  if (diffDays < 60) return `${Math.round(diffDays / 7)} weeks ago`
  return d.toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })
}

export default async function BarbersPage() {
  const session = await getSession()
  const { myShops, allShops } = await getData(session?.userId)

  const isPersonalised = myShops !== null

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-28 sm:pb-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111]">
            {isPersonalised ? 'My Barbers' : 'Barber Shops'}
          </h1>
          <p className="text-warm-gray text-sm mt-1">
            {isPersonalised
              ? "Shops you've visited — tap to book again"
              : 'Find a barber shop and book your next cut'}
          </p>
        </div>

        {isPersonalised && myShops ? (
          <div className="space-y-3">
            {myShops.map((shop) => (
              <div key={shop._id} className="bg-white border border-border-warm rounded-2xl overflow-hidden hover:border-charcoal hover:shadow-sm transition-all">
                {shop.coverImage && (
                  <img src={shop.coverImage} alt={shop.name} className="w-full h-32 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-[#111] text-lg">{shop.name}</h2>
                      <p className="text-sm text-warm-gray mt-0.5">{shop.location}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-warm-gray">
                        {shop.visitCount && (
                          <span>{shop.visitCount} visit{shop.visitCount !== 1 ? 's' : ''}</span>
                        )}
                        {shop.lastVisit && (
                          <span>Last: {formatLastVisit(shop.lastVisit)}</span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/shop/${shop._id}`}
                      className="flex-shrink-0 bg-charcoal hover:bg-charcoal-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2 text-center">
              <Link href="/" className="text-sm text-brass hover:underline">
                Explore other barber shops →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {(allShops ?? []).map((shop) => (
              <div key={shop._id} className="bg-white border border-border-warm rounded-2xl overflow-hidden hover:border-charcoal hover:shadow-sm transition-all">
                {shop.coverImage && (
                  <img src={shop.coverImage} alt={shop.name} className="w-full h-32 object-cover" />
                )}
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-[#111]">{shop.name}</h2>
                    <p className="text-sm text-warm-gray mt-0.5">{shop.location}</p>
                  </div>
                  <Link
                    href={`/shop/${shop._id}`}
                    className="flex-shrink-0 bg-charcoal hover:bg-charcoal-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    Book
                  </Link>
                </div>
              </div>
            ))}

            {(allShops ?? []).length === 0 && (
              <div className="text-center py-16 bg-white border border-border-warm rounded-2xl">
                <p className="text-3xl mb-3">✂️</p>
                <p className="font-semibold text-[#111]">No barber shops yet</p>
                <p className="text-sm text-warm-gray mt-1">Check back soon!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
