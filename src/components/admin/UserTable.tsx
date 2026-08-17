'use client'

import { useState } from 'react'
import { IUser } from '@/types'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

interface UserTableProps {
  initialUsers: IUser[]
}

export default function UserTable({ initialUsers }: UserTableProps) {
  const [users, setUsers] = useState(initialUsers)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const toggle = async (user: IUser) => {
    setLoadingId(user._id)
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u))
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
            <th className="text-left py-3 px-3 text-warm-gray font-medium hidden sm:table-cell">Email</th>
            <th className="text-left py-3 px-3 text-warm-gray font-medium">Role</th>
            <th className="text-left py-3 px-3 text-warm-gray font-medium">Status</th>
            <th className="py-3 px-3"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border-b border-border-warm hover:bg-charcoal-50">
              <td className="py-3 px-3 font-medium text-[#0f0f0f]">{user.name}</td>
              <td className="py-3 px-3 text-warm-gray hidden sm:table-cell">{user.email}</td>
              <td className="py-3 px-3">
                <span className="capitalize text-warm-gray">{user.role}</span>
              </td>
              <td className="py-3 px-3">
                <Badge status={user.isActive ? 'confirmed' : 'cancelled'} />
              </td>
              <td className="py-3 px-3">
                <Button
                  size="sm"
                  variant={user.isActive ? 'danger' : 'primary'}
                  loading={loadingId === user._id}
                  onClick={() => toggle(user)}
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
