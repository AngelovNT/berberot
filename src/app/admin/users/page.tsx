'use client'

import { useEffect, useState } from 'react'
import UserTable from '@/components/admin/UserTable'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import { IUser } from '@/types'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<IUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const url = filter === 'all' ? '/api/users' : `/api/users?role=${filter}`
    setLoading(true)
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setUsers(json.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter])

  const roleFilters = ['all', 'admin', 'barber', 'customer']

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0f0f0f]">Users</h1>
        <p className="text-warm-gray text-sm mt-1">Manage all platform users</p>
      </div>

      <div className="flex gap-2 mb-4">
        {roleFilters.map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize ${
              filter === r
                ? 'bg-[#0f0f0f] text-white border-[#0f0f0f]'
                : 'bg-white text-warm-gray border-border-warm hover:border-gray-400'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <Card>
          {users.length === 0 ? (
            <p className="text-sm text-warm-gray text-center py-6">No users found.</p>
          ) : (
            <UserTable initialUsers={users} />
          )}
        </Card>
      )}
    </div>
  )
}
