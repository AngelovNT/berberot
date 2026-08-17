'use client'

import { useEffect, useState } from 'react'
import StatsCard from '@/components/dashboard/StatsCard'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'

interface Stats {
  totalUsers: number
  totalBarbers: number
  totalCustomers: number
  totalShops: number
  totalBookings: number
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then((r) => r.json()),
      fetch('/api/barbershops').then((r) => r.json()),
      fetch('/api/bookings').then((r) => r.json()),
    ])
      .then(([usersJson, shopsJson, bookingsJson]) => {
        const users = usersJson.data ?? []
        const shops = shopsJson.data ?? []
        const bookings = bookingsJson.data ?? []

        setStats({
          totalUsers: users.length,
          totalBarbers: users.filter((u: { role: string }) => u.role === 'barber').length,
          totalCustomers: users.filter((u: { role: string }) => u.role === 'customer').length,
          totalShops: shops.length,
          totalBookings: bookings.length,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0f0f0f]">Admin Overview</h1>
        <p className="text-warm-gray text-sm mt-1">Platform statistics at a glance</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard label="Total Users" value={stats?.totalUsers ?? 0} icon="👥" />
        <StatsCard label="Barbers" value={stats?.totalBarbers ?? 0} icon="✂️" />
        <StatsCard label="Customers" value={stats?.totalCustomers ?? 0} icon="👤" />
        <StatsCard label="Barbershops" value={stats?.totalShops ?? 0} icon="💈" />
        <StatsCard label="Total Bookings" value={stats?.totalBookings ?? 0} icon="📅" />
      </div>

      <Card>
        <h2 className="text-base font-semibold text-[#0f0f0f] mb-3">Quick Links</h2>
        <div className="space-y-2">
          <a href="/admin/users" className="flex items-center gap-2 text-sm text-brass hover:underline">
            → Manage Users
          </a>
          <a href="/admin/barbershops" className="flex items-center gap-2 text-sm text-brass hover:underline">
            → Manage Barbershops
          </a>
        </div>
      </Card>
    </div>
  )
}
