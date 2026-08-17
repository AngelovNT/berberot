'use client'

import { IService } from '@/types'
import Button from '@/components/ui/Button'

interface ServiceListProps {
  services: IService[]
  onEdit: (service: IService) => void
  onDelete: (id: string) => void
}

export default function ServiceList({ services, onEdit, onDelete }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <p className="text-sm text-warm-gray text-center py-8">
        No services yet. Add your first service.
      </p>
    )
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return
    const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
    if (res.ok) onDelete(id)
  }

  return (
    <div className="divide-y divide-gray-100">
      {services.map((service) => (
        <div key={service._id} className="flex items-center justify-between gap-3 py-4 px-1">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[#111] truncate">{service.name}</p>
            <p className="text-sm text-warm-gray mt-0.5">
              €{service.price} · {service.duration} min
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="secondary" onClick={() => onEdit(service)}>
              Edit
            </Button>
            <Button size="sm" variant="danger" onClick={() => handleDelete(service._id)}>
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
