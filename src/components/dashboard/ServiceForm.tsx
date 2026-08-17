'use client'

import { useState, FormEvent } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { IService } from '@/types'

interface ServiceFormProps {
  service?: IService
  onSuccess: () => void
  onCancel: () => void
}

export default function ServiceForm({ service, onSuccess, onCancel }: ServiceFormProps) {
  const [name, setName] = useState(service?.name ?? '')
  const [price, setPrice] = useState(service?.price?.toString() ?? '')
  const [duration, setDuration] = useState(service?.duration?.toString() ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!service

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = isEdit ? `/api/services/${service._id}` : '/api/services'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price: parseFloat(price),
          duration: parseInt(duration, 10),
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.message ?? 'Failed to save service')
        return
      }

      onSuccess()
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-soft-red-light border border-soft-red/20 text-soft-red text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Input
        label="Service Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Haircut"
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Price (€)"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="25"
          required
        />
        <Input
          label="Duration (min)"
          type="number"
          min="5"
          step="5"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="30"
          required
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" fullWidth loading={loading}>
          {isEdit ? 'Update' : 'Create'} Service
        </Button>
      </div>
    </form>
  )
}
