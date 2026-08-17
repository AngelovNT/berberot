'use client'

interface Client {
  _id: string
  name: string
  email: string
  bookingCount: number
  lastBooking?: string
}

interface ClientListProps {
  clients: Client[]
}

export default function ClientList({ clients }: ClientListProps) {
  if (clients.length === 0) {
    return (
      <p className="text-sm text-warm-gray text-center py-8">No clients yet.</p>
    )
  }

  return (
    <div className="space-y-3">
      {clients.map((client) => (
        <div
          key={client._id}
          className="flex items-center justify-between py-3 border-b border-border-warm last:border-0"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0f0f0f] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm text-[#0f0f0f]">{client.name}</p>
              <p className="text-xs text-warm-gray">{client.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-[#0f0f0f]">{client.bookingCount}</p>
            <p className="text-xs text-warm-gray">bookings</p>
          </div>
        </div>
      ))}
    </div>
  )
}
