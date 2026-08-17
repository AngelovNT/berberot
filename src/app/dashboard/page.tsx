'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Spinner from '@/components/ui/Spinner'
import Link from 'next/link'
import { IBooking, IService } from '@/types'

function ShareLinkCard({ shopId }: { shopId: string }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/shop/${shopId}`
    : `/shop/${shopId}`

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }).catch(() => {})
  }

  return (
    <div className="bg-brass-light border border-charcoal rounded-2xl p-4 mb-6">
      <p className="font-semibold text-charcoal text-sm mb-0.5">Share your booking link</p>
      <p className="text-xs text-warm-gray mb-3">Send this to clients via WhatsApp, Instagram or SMS</p>
      <div className="flex items-center gap-2">
        <p className="flex-1 min-w-0 text-xs font-mono bg-white border border-charcoal rounded-xl px-3 py-2 text-brass truncate">{url}</p>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 bg-charcoal hover:bg-charcoal-800 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all whitespace-nowrap shadow-sm"
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color = 'default' }: { label: string; value: string | number; sub?: string; color?: 'default' | 'blue' | 'green' }) {
  const isNumber = typeof value === 'number'
  const valueColor = color === 'blue' ? 'text-brass' : color === 'green' ? 'text-green-600' : 'text-charcoal'
  return (
    <div className="bg-white border border-border-warm rounded-2xl p-4 shadow-card">
      <p className="text-xs text-warm-gray font-semibold uppercase tracking-wider truncate">{label}</p>
      <p className={`font-bold mt-1.5 leading-tight truncate ${isNumber ? 'text-3xl' : 'text-lg'} ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-warm-gray mt-1.5 truncate">{sub}</p>}
    </div>
  )
}

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekRange() {
  const today = new Date()
  const from = getTodayStr()
  const toDate = new Date(today)
  toDate.setDate(today.getDate() + 7)
  const to = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, '0')}-${String(toDate.getDate()).padStart(2, '0')}`
  return { from, to }
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface RevenueData {
  week: { revenue: number; bookings: number }
  month: { revenue: number; bookings: number }
  byService: { name: string; count: number; revenue: number }[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [todayBookings, setTodayBookings] = useState<IBooking[]>([])
  const [weekBookings, setWeekBookings] = useState<IBooking[]>([])
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = getTodayStr()
    const { from, to } = getWeekRange()
    Promise.all([
      fetch(`/api/bookings?date=${today}`).then((r) => r.json()),
      fetch(`/api/bookings?from=${from}&to=${to}`).then((r) => r.json()),
      fetch('/api/barber/revenue').then((r) => r.json()),
    ])
      .then(([todayJson, weekJson, revenueJson]) => {
        if (todayJson.success) setTodayBookings(todayJson.data)
        if (weekJson.success) setWeekBookings(weekJson.data)
        if (revenueJson.success) setRevenue(revenueJson.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const todayConfirmed = todayBookings.filter((b) => b.status === 'confirmed')
  const weekConfirmed = weekBookings.filter((b) => b.status === 'confirmed')
  const todayTotal = todayBookings.length

  const serviceCounts: Record<string, { name: string; count: number }> = {}
  for (const b of weekBookings) {
    const svc = b.serviceId as IService
    if (typeof svc !== 'object') continue
    if (!serviceCounts[svc._id]) serviceCounts[svc._id] = { name: svc.name, count: 0 }
    serviceCounts[svc._id].count++
  }
  const popularService = Object.values(serviceCounts).sort((a, b) => b.count - a.count)[0] ?? null

  const dayCounts: Record<string, number> = {}
  for (const b of weekBookings) {
    const day = DAY_NAMES[new Date(b.date + 'T00:00:00').getDay()]
    dayCounts[day] = (dayCounts[day] ?? 0) + 1
  }
  const busiestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner /></div>
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-charcoal">Dashboard</h1>
        <p className="text-warm-gray text-sm mt-1">Welcome back, {user?.name}.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Today" value={todayConfirmed.length} sub="confirmed" />
        <StatCard label="This week" value={weekConfirmed.length} sub="upcoming" color="blue" />
        <StatCard
          label="Top service"
          value={popularService?.name ?? '—'}
          sub={popularService ? `${popularService.count}× this week` : undefined}
        />
        <StatCard
          label="Busiest day"
          value={busiestDay ?? '—'}
          sub={busiestDay ? `${dayCounts[busiestDay]} bookings` : undefined}
        />
      </div>

      {/* Revenue */}
      {revenue && (
        <div className="bg-white border border-border-warm rounded-2xl shadow-card p-5 mb-6">
          <h2 className="text-sm font-semibold text-charcoal mb-4">Revenue</h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-forest/5 border border-forest/15 rounded-xl p-4">
              <p className="text-xs font-semibold text-forest uppercase tracking-wider mb-1">This Week</p>
              <p className="text-2xl font-bold text-forest">€{revenue.week.revenue}</p>
              <p className="text-xs text-forest/70 mt-0.5">{revenue.week.bookings} bookings</p>
            </div>
            <div className="bg-brass-light border border-charcoal rounded-xl p-4">
              <p className="text-xs font-semibold text-brass uppercase tracking-wider mb-1">This Month</p>
              <p className="text-2xl font-bold text-brass">€{revenue.month.revenue}</p>
              <p className="text-xs text-charcoal mt-0.5">{revenue.month.bookings} bookings</p>
            </div>
          </div>
          {revenue.byService.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-3">By Service</p>
              <div className="space-y-3">
                {revenue.byService.slice(0, 4).map((s) => {
                  const pct = revenue.month.revenue > 0 ? Math.round((s.revenue / revenue.month.revenue) * 100) : 0
                  return (
                    <div key={s.name} className="flex items-center gap-3">
                      <div className="w-24 flex-shrink-0">
                        <span className="text-xs font-medium text-charcoal truncate block">{s.name}</span>
                      </div>
                      <div className="flex-1 h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
                        <div className="h-full bg-charcoal rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-warm-gray w-20 text-right flex-shrink-0 font-variant-numeric tabular-nums">
                        €{s.revenue} · {s.count}×
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share link */}
      {user?.barberShopId && <ShareLinkCard shopId={user.barberShopId} />}

      {/* Today's schedule */}
      <div className="bg-white border border-border-warm rounded-2xl shadow-card overflow-hidden mb-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-warm">
          <h2 className="text-sm font-semibold text-charcoal">Today&apos;s Schedule</h2>
          <Link href="/dashboard/bookings" className="text-xs font-semibold text-brass hover:underline">View all →</Link>
        </div>

        {todayConfirmed.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-sm font-medium text-charcoal">No bookings today</p>
            <p className="text-xs text-warm-gray mt-1">Share your booking link to get more clients!</p>
          </div>
        ) : (
          <div className="divide-y divide-border-warm">
            {todayConfirmed.map((b) => {
              const svc = b.serviceId as IService
              const client = b.userId as { name?: string; phone?: string }
              return (
                <div key={b._id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="bg-charcoal text-white rounded-xl px-3 py-2 text-center flex-shrink-0 min-w-[54px]">
                    <p className="text-xs font-semibold leading-none">{b.startTime}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-charcoal truncate">
                      {typeof svc === 'object' ? svc.name : 'Service'}
                    </p>
                    {typeof client === 'object' && client.name && (
                      <p className="text-xs text-warm-gray truncate">{client.name}</p>
                    )}
                  </div>
                  {typeof client === 'object' && client.phone && (
                    <a
                      href={`tel:${client.phone}`}
                      className="flex-shrink-0 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors font-medium"
                    >
                      Call
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* No-shows */}
      {todayTotal > todayConfirmed.length && (
        <div className="bg-brass-light border border-brass/20 rounded-2xl px-4 py-3">
          <p className="text-sm font-medium text-brass-dark">
            {todayTotal - todayConfirmed.length} booking{todayTotal - todayConfirmed.length > 1 ? 's' : ''} cancelled/no-show today
          </p>
        </div>
      )}
    </div>
  )
}
