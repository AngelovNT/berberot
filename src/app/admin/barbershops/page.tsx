'use client'

import { useEffect, useState } from 'react'
import BarberShopTable from '@/components/admin/BarberShopTable'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import { IBarberShop } from '@/types'

export default function AdminBarberShopsPage() {
  const [shops, setShops] = useState<IBarberShop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/barbershops')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setShops(json.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0f0f0f]">Barbershops</h1>
        <p className="text-warm-gray text-sm mt-1">Manage all registered barbershops</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <Card>
          {shops.length === 0 ? (
            <p className="text-sm text-warm-gray text-center py-6">No barbershops registered yet.</p>
          ) : (
            <BarberShopTable initialShops={shops} />
          )}
        </Card>
      )}
    </div>
  )
}
