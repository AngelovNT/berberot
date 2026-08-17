import connectDB from '@/lib/mongodb'
import BarberShopModel from '@/models/BarberShop'
import ServiceModel from '@/models/Service'
import UserModel from '@/models/User'
import BookingModel from '@/models/Booking'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNextAvailableSlot, formatNextSlotLabel } from '@/lib/nextSlot'
import BookNextAvailable from '@/components/booking/BookNextAvailable'

interface RatingAggResult {
  _id: null
  avg: number
  count: number
}

interface BarberRatingResult {
  _id: unknown
  avg: number
  count: number
}

export default async function ShopProfilePage({
  params,
}: {
  params: Promise<{ shopId: string }>
}) {
  const { shopId } = await params

  await connectDB()

  const shop = await BarberShopModel.findById(shopId).lean()
  if (!shop) notFound()

  const [barbers, services] = await Promise.all([
    UserModel.find({ barberShopId: shop._id, role: 'barber' }).lean(),
    ServiceModel.find({ barberShopId: shop._id }).lean(),
  ])

  const barberIds = barbers.map((b) => b._id)

  const [ratingAgg, barberRatings, reviews] = await Promise.all([
    BookingModel.aggregate<RatingAggResult>([
      { $match: { barberId: { $in: barberIds }, rating: { $exists: true, $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
    BookingModel.aggregate<BarberRatingResult>([
      { $match: { barberId: { $in: barberIds }, rating: { $exists: true } } },
      { $group: { _id: '$barberId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
    BookingModel.find({
      barberId: { $in: barberIds },
      reviewText: { $exists: true, $ne: '' },
      rating: { $exists: true },
    })
      .populate('userId', 'name photo')
      .populate('barberId', 'name')
      .select('rating reviewText date userId barberId')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ])

  const shopRating = ratingAgg[0] ?? null
  const nextSlot = await getNextAvailableSlot(shopId)
  const nextLabel = formatNextSlotLabel(nextSlot)

  const barberRatingMap = new Map<string, { avg: number; count: number }>()
  for (const br of barberRatings) {
    barberRatingMap.set(String(br._id), { avg: br.avg, count: br.count })
  }

  const shopData = shop as typeof shop & {
    coverImage?: string
    description?: string
    instagram?: string
    facebook?: string
    website?: string
    promoVideo?: string
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      {/* Hero */}
      <div className="w-full relative overflow-hidden" style={{ height: 'clamp(280px, 50vh, 500px)' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700">
          {shopData.coverImage && (
            <img
              src={shopData.coverImage}
              alt={shopData.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Hero content overlaid at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-7 pt-16">
          <div className="max-w-4xl mx-auto">
            {shopRating && (
              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={`text-sm ${s <= Math.round(shopRating.avg) ? 'text-amber-400' : 'text-white/30'}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-white/80 font-medium">
                  {shopRating.avg.toFixed(1)} · {shopRating.count} {shopRating.count === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            )}
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight" style={{ textWrap: 'balance' }}>
              {shopData.name}
            </h1>
            <p className="text-white/65 text-sm mt-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {shopData.location}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Booking CTA strip */}
        <div className="bg-white rounded-2xl shadow-elevated px-5 py-4 -mt-5 relative z-10 mb-6 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            {nextLabel ? (
              <>
                <p className="text-xs text-warm-gray font-medium mb-0.5">Next available</p>
                <p className="text-sm font-semibold text-brass-dark flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-brass rounded-full inline-block flex-shrink-0" />
                  {nextLabel}
                </p>
              </>
            ) : (
              <p className="text-sm text-warm-gray">Check availability below</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <BookNextAvailable shopId={String(shopData._id)} initial={nextSlot} label={nextLabel} />
            <Link
              href={`/book/${String(shopData._id)}`}
              className="bg-charcoal hover:bg-charcoal-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md whitespace-nowrap text-center"
            >
              Book Now
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-16">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {(shopData.description || shopData.instagram || shopData.facebook || shopData.website) && (
              <div>
                {shopData.description && (
                  <p className="text-warm-gray leading-relaxed text-base mb-5">{shopData.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {shopData.instagram && (
                    <a
                      href={`https://instagram.com/${shopData.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-brass bg-white shadow-card px-3.5 py-2 rounded-xl hover:shadow-card-hover transition-all"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      @{shopData.instagram}
                    </a>
                  )}
                  {shopData.facebook && (
                    <a
                      href={`https://facebook.com/${shopData.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-brass bg-white shadow-card px-3.5 py-2 rounded-xl hover:shadow-card-hover transition-all"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      {shopData.facebook}
                    </a>
                  )}
                  {shopData.website && (
                    <a
                      href={shopData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-brass bg-white shadow-card px-3.5 py-2 rounded-xl hover:shadow-card-hover transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Website
                    </a>
                  )}
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(shopData.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-brass bg-white shadow-card px-3.5 py-2 rounded-xl hover:shadow-card-hover transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    View on map
                  </a>
                </div>
              </div>
            )}

            {/* Barbers */}
            {barbers.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-charcoal mb-5">Meet the Team</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {barbers.map((barber) => {
                    const barberData = barber as typeof barber & { photo?: string }
                    const br = barberRatingMap.get(String(barber._id))
                    return (
                      <div
                        key={String(barber._id)}
                        className="bg-white rounded-2xl p-5 shadow-card text-center"
                      >
                        <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3">
                          {barberData.photo ? (
                            <img
                              src={barberData.photo}
                              alt={barber.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-charcoal flex items-center justify-center text-white font-bold text-2xl">
                              {barber.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <p className="font-display font-bold text-charcoal text-base leading-tight">{barber.name}</p>
                        {br ? (
                          <p className="text-xs text-warm-gray mt-1.5">
                            <span className="text-amber-400">★</span>{' '}
                            {br.avg.toFixed(1)} · {br.count} {br.count === 1 ? 'review' : 'reviews'}
                          </p>
                        ) : (
                          <p className="text-xs text-warm-gray mt-1.5">No reviews yet</p>
                        )}
                        <Link
                          href={`/book/${String(shopData._id)}`}
                          className="mt-4 block w-full text-center bg-brass-light hover:bg-brass-light text-brass py-2 rounded-xl text-xs font-semibold transition-colors"
                        >
                          Book Appointment
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-charcoal mb-5">What Clients Say</h2>
                <div className="space-y-3">
                  {reviews.map((r) => {
                    const reviewer = r.userId as { name?: string } | null
                    const barber = r.barberId as { name?: string } | null
                    return (
                      <div key={String(r._id)} className="bg-white rounded-2xl p-5 shadow-card">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-9 h-9 rounded-full bg-charcoal flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {reviewer?.name?.charAt(0).toUpperCase() ?? '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-charcoal">{reviewer?.name ?? 'Customer'}</p>
                            {barber?.name && <p className="text-xs text-warm-gray">with {barber.name}</p>}
                          </div>
                          <div className="flex gap-0.5 flex-shrink-0">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s} className={`text-sm ${s <= (r.rating ?? 0) ? 'text-amber-400' : 'text-charcoal-100'}`}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-warm-gray leading-relaxed">{String(r.reviewText ?? '')}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Promo video */}
            {shopData.promoVideo && (
              <div>
                <h2 className="text-xl font-bold text-charcoal mb-5">Watch Our Work</h2>
                <div className="aspect-video rounded-2xl overflow-hidden shadow-card bg-charcoal-100">
                  <iframe
                    src={shopData.promoVideo.replace('watch?v=', 'embed/')}
                    title="Promo video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right column: Services (sticky on desktop) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-6 lg:sticky lg:top-6">
              <h2 className="text-lg font-bold text-charcoal mb-4">Services</h2>
              {services.length === 0 ? (
                <p className="text-sm text-warm-gray">No services listed yet.</p>
              ) : (
                <div>
                  {services.map((service, i) => (
                    <div
                      key={String(service._id)}
                      className={`flex items-center justify-between py-3.5 ${i < services.length - 1 ? 'border-b border-border-warm' : ''}`}
                    >
                      <div>
                        <p className="font-medium text-charcoal text-sm">{service.name}</p>
                        <p className="text-xs text-warm-gray mt-0.5">{service.duration} min</p>
                      </div>
                      <span className="font-bold text-charcoal">€{service.price}</span>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href={`/book/${String(shopData._id)}`}
                className="mt-5 block w-full text-center bg-charcoal hover:bg-charcoal-800 text-white py-3.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
