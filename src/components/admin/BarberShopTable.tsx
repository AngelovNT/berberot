'use client'

import { useState } from 'react'
import { IBarberShop } from '@/types'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

interface BarberShopTableProps {
  initialShops: IBarberShop[]
}

export default function BarberShopTable({ initialShops }: BarberShopTableProps) {
  const [shops, setShops] = useState(initialShops)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const toggle = async (shop: IBarberShop) => {
    setLoadingId(shop._id)
    try {
      const res = await fetch(`/api/barbershops/${shop._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !shop.isActive }),
      })
      if (res.ok) {
        setShops((prev) =>
          prev.map((s) => (s._id === shop._id ? { ...s, isActive: !s.isActive } : s))
        )
      }
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-warm">
            <th className="text-left py-3 px-3 text-warm-gray font-medium">Name</th>
            <th className="text-left py-3 px-3 text-warm-gray font-medium hidden sm:table-cell">Location</th>
            <th className="text-left py-3 px-3 text-warm-gray font-medium">Status</th>
            <th className="py-3 px-3"></th>
          </tr>
        </thead>
        <tbody>
          {shops.map((shop) => (
            <tr key={shop._id} className="border-b border-border-warm hover:bg-charcoal-50">
              <td className="py-3 px-3 font-medium text-[#0f0f0f]">{shop.name}</td>
              <td className="py-3 px-3 text-warm-gray hidden sm:table-cell">{shop.location}</td>
              <td className="py-3 px-3">
                <Badge status={shop.isActive ? 'confirmed' : 'cancelled'} />
              </td>
              <td className="py-3 px-3">
                <Button
                  size="sm"
                  variant={shop.isActive ? 'danger' : 'primary'}
                  loading={loadingId === shop._id}
                  onClick={() => toggle(shop)}
                >
                  {shop.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
