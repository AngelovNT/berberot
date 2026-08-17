'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import ServiceList from '@/components/dashboard/ServiceList'
import ServiceForm from '@/components/dashboard/ServiceForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import { IService } from '@/types'

export default function ServicesPage() {
  const { user } = useAuth()
  const [services, setServices] = useState<IService[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editService, setEditService] = useState<IService | undefined>()

  const fetchServices = () => {
    if (!user?.barberShopId) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`/api/services?shopId=${user.barberShopId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setServices(json.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (user) fetchServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const openCreate = () => {
    setEditService(undefined)
    setModalOpen(true)
  }

  const openEdit = (service: IService) => {
    setEditService(service)
    setModalOpen(true)
  }

  const handleSuccess = () => {
    setModalOpen(false)
    fetchServices()
  }

  const handleDelete = (id: string) => {
    setServices((prev) => prev.filter((s) => s._id !== id))
  }

  if (!user?.barberShopId) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#111] mb-6">Services</h1>
        <Card>
          <p className="text-sm text-warm-gray text-center py-4">
            You need to set up your barbershop first in Settings.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111]">Services</h1>
          <p className="text-warm-gray text-sm mt-1">Manage your service offerings</p>
        </div>
        <Button onClick={openCreate}>+ Add Service</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <Card>
          <ServiceList services={services} onEdit={openEdit} onDelete={handleDelete} />
        </Card>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editService ? 'Edit Service' : 'Add Service'}
      >
        <ServiceForm
          service={editService}
          onSuccess={handleSuccess}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
