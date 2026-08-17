'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import { IBooking, IService, IUser } from '@/types'

function BtnSpinner() {
  return (
    <svg className="animate-spin w-3.5 h-3.5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function getDateStr(daysFromNow = 0) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IE', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

type Filter = 'all' | 'today' | 'tomorrow' | 'week'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All Upcoming' },
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'week', label: 'This Week' },
]

function buildUrl(filter: Filter): string {
  const today = getDateStr(0)
  if (filter === 'today') return `/api/bookings?date=${today}`
  if (filter === 'tomorrow') return `/api/bookings?date=${getDateStr(1)}`
  if (filter === 'week') return `/api/bookings?from=${today}&to=${getDateStr(7)}`
  return `/api/bookings?from=${today}`
}

// ─── Add Booking Modal ────────────────────────────────────────────────────────

interface ClientOption { _id: string; name: string; phone: string; email: string }
interface ServiceOption { _id: string; name: string; price: number; duration: number }
interface SlotOption { startTime: string; endTime: string }

function AddBookingModal({
  shopId,
  barberId,
  onClose,
  onAdded,
}: {
  shopId: string
  barberId: string
  onClose: () => void
  onAdded: () => void
}) {
  // Steps: 'client' | 'details'
  const [step, setStep] = useState<'client' | 'details'>('client')

  // Client step
  const [clients, setClients] = useState<ClientOption[]>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [clientSearch, setClientSearch] = useState('')
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null)
  const [newClient, setNewClient] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')

  // Details step
  const [services, setServices] = useState<ServiceOption[]>([])
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null)
  const [date, setDate] = useState(getDateStr(0))
  const [slots, setSlots] = useState<SlotOption[]>([])
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Load clients + services on mount
  useEffect(() => {
    setClientsLoading(true)
    fetch('/api/barber/clients')
      .then(r => r.json())
      .then(j => { if (j.success) setClients(j.data?.clients ?? []) })
      .catch(() => {})
      .finally(() => setClientsLoading(false))
    fetch(`/api/services?shopId=${shopId}`).then(r => r.json()).then(j => {
      if (j.success) setServices(j.data)
    })
  }, [shopId])

  // Load slots when service + date change
  useEffect(() => {
    if (!selectedService || !date) return
    setSlots([])
    setSelectedSlot(null)
    setLoadingSlots(true)
    fetch(`/api/slots?barberId=${barberId}&date=${date}&serviceId=${selectedService._id}`)
      .then(r => r.json())
      .then(j => { if (j.success) setSlots(j.data) })
      .catch(() => {})
      .finally(() => setLoadingSlots(false))
  }, [selectedService, date, barberId])

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.phone.includes(clientSearch)
  )

  const handleClientNext = async () => {
    setError('')
    if (newClient) {
      if (!newName.trim() || !newPhone.trim()) { setError('Name and phone are required'); return }
      try {
        const res = await fetch('/api/barber/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName, phone: newPhone }),
        })
        const j = await res.json()
        if (!res.ok) { setError(j.message ?? 'Failed to create client'); return }
        const created = { _id: j.data.customer._id, name: newName, phone: newPhone, email: '' }
        setSelectedClient(created)
        setStep('details')
      } catch {
        setError('Something went wrong. Please try again.')
      }
      return
    }
    if (!selectedClient) { setError('Select or add a client'); return }
    setStep('details')
  }

  const handleSubmit = async () => {
    setError('')
    if (!selectedService) { setError('Select a service'); return }
    if (!selectedSlot) { setError('Select a time slot'); return }
    if (!selectedClient) { setError('No client selected'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId,
          userId: selectedClient._id,
          serviceId: selectedService._id,
          date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          phone: selectedClient.phone,
        }),
      })
      const j = await res.json()
      if (!res.ok) { setError(j.message ?? 'Failed to create booking'); return }
      onAdded()
      onClose()
    } catch {
      setError('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-warm flex-shrink-0">
          <div className="flex items-center gap-3">
            {step === 'details' && (
              <button onClick={() => setStep('client')} className="text-warm-gray hover:text-warm-gray p-1 -ml-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="text-base font-bold text-[#111]">
              {step === 'client' ? 'Who is the booking for?' : 'When & what service?'}
            </h2>
          </div>
          <button onClick={onClose} className="text-warm-gray hover:text-warm-gray text-2xl leading-none">×</button>
        </div>

        {/* Step indicators */}
        <div className="flex px-5 pt-3 gap-1.5 flex-shrink-0">
          {['client', 'details'].map((s, i) => (
            <div key={s} className={`flex-1 h-1 rounded-full ${step === s || (s === 'client' && step === 'details') ? 'bg-charcoal' : 'bg-charcoal-100'}`} />
          ))}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">

          {/* ── Step 1: Client ── */}
          {step === 'client' && (
            <div className="space-y-3">
              {!newClient ? (
                <>
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={e => setClientSearch(e.target.value)}
                    placeholder="Search by name or phone…"
                    className="w-full border border-border-warm rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal"
                    autoFocus
                  />

                  {/* Client list */}
                  <div className="space-y-1 max-h-56 overflow-y-auto">
                    {clientsLoading ? (
                      <p className="text-sm text-warm-gray text-center py-4">Loading clients…</p>
                    ) : filteredClients.length === 0 ? (
                      <p className="text-sm text-warm-gray text-center py-4">
                        {clientSearch ? 'No clients found' : 'No clients yet — add one below'}
                      </p>
                    ) : filteredClients.map(c => (
                      <button
                        key={c._id}
                        onClick={() => setSelectedClient(c)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                          selectedClient?._id === c._id
                            ? 'bg-charcoal border border-charcoal'
                            : 'hover:bg-charcoal-50 border border-transparent'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-[#111]">{c.name}</p>
                          {c.phone && <p className="text-xs text-warm-gray">{c.phone}</p>}
                        </div>
                        {selectedClient?._id === c._id && (
                          <svg className="w-4 h-4 text-brass flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => { setNewClient(true); setSelectedClient(null) }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm text-warm-gray hover:border-charcoal hover:text-brass transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New client (not in your list)
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setNewClient(false)}
                    className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-[#111] mb-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to client list
                  </button>
                  <div>
                    <label className="block text-xs font-medium text-warm-gray mb-1.5">Full name *</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full border border-border-warm rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-warm-gray mb-1.5">Phone number *</label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                      placeholder="+353 87 123 4567"
                      className="w-full border border-border-warm rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Step 2: Service + Date + Slot ── */}
          {step === 'details' && (
            <div className="space-y-4">
              {/* Selected client summary */}
              <div className="bg-charcoal border border-charcoal rounded-xl px-3 py-2.5 flex items-center gap-2">
                <svg className="w-4 h-4 text-brass flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#111] truncate">{selectedClient?.name}</p>
                  {selectedClient?.phone && <p className="text-xs text-warm-gray">{selectedClient.phone}</p>}
                </div>
              </div>

              {/* Service */}
              <div>
                <label className="block text-xs font-medium text-warm-gray mb-2">Service *</label>
                <div className="space-y-1.5">
                  {services.map(s => (
                    <button
                      key={s._id}
                      onClick={() => setSelectedService(s)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                        selectedService?._id === s._id
                          ? 'bg-charcoal border border-charcoal'
                          : 'bg-charcoal-50 border border-border-warm hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium text-[#111]">{s.name}</span>
                      <span className="text-xs text-warm-gray">€{s.price} · {s.duration}min</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-warm-gray mb-1.5">Date *</label>
                <input
                  type="date"
                  value={date}
                  min={getDateStr(0)}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border border-border-warm rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal"
                />
              </div>

              {/* Time slots */}
              {selectedService && (
                <div>
                  <label className="block text-xs font-medium text-warm-gray mb-2">Time *</label>
                  {loadingSlots ? (
                    <div className="flex justify-center py-4"><Spinner /></div>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-warm-gray text-center py-3 bg-charcoal-50 rounded-xl">No available slots for this date</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5">
                      {slots.map(slot => (
                        <button
                          key={slot.startTime}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 rounded-xl text-sm font-medium transition-colors ${
                            selectedSlot?.startTime === slot.startTime
                              ? 'bg-charcoal text-white'
                              : 'bg-charcoal-50 border border-border-warm text-[#111] hover:border-charcoal'
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-3 bg-soft-red-light border border-soft-red/20 text-soft-red text-sm px-4 py-3 rounded-xl">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border-warm flex-shrink-0">
          {step === 'client' ? (
            <button
              onClick={handleClientNext}
              className="w-full bg-charcoal hover:bg-charcoal-800 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedService || !selectedSlot}
              className="w-full bg-charcoal hover:bg-charcoal-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <><BtnSpinner />Creating…</> : 'Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Booking card ─────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  onUpdate,
}: {
  booking: IBooking
  onUpdate: (id: string, status: IBooking['status']) => void
}) {
  const [status, setStatus] = useState(booking.status)
  const [loading, setLoading] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const service = booking.serviceId as IService
  const client = booking.userId as IUser
  const phone = booking.phone

  const patch = async (newStatus: IBooking['status']) => {
    setLoading(newStatus)
    try {
      const res = await fetch(`/api/bookings/${booking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setStatus(newStatus)
        onUpdate(booking._id, newStatus)
      }
    } finally {
      setLoading(null)
    }
  }

  const handleCopy = () => {
    if (phone) {
      navigator.clipboard.writeText(phone).catch(() => {})
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-white border border-border-warm rounded-2xl overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-ivory border-b border-border-warm">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-sm font-bold text-[#111] shrink-0">{booking.startTime}</span>
          <span className="text-xs text-warm-gray shrink-0">–</span>
          <span className="text-xs text-warm-gray shrink-0">{booking.endTime}</span>
          <span className="text-xs text-charcoal-200 shrink-0">·</span>
          <span className="text-xs text-warm-gray truncate">{formatDate(booking.date)}</span>
        </div>
        <Badge status={status} />
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <p className="font-semibold text-[#111]">
          {typeof service === 'object' ? service.name : 'Service'}
        </p>
        {typeof service === 'object' && (
          <p className="text-xs text-warm-gray mt-0.5">€{service.price} · {service.duration} min</p>
        )}

        {typeof client === 'object' && (
          <div className="mt-3 pt-3 border-t border-border-warm">
            <p className="text-sm font-medium text-[#111]">{client.name}</p>
            {phone && <p className="text-xs text-warm-gray mt-0.5">{phone}</p>}
            {phone && (
              <div className="flex gap-2 mt-2">
                <a href={`tel:${phone}`} className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-xs font-medium px-3 py-1.5 rounded-lg">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call
                </a>
                <button onClick={handleCopy} className="flex items-center gap-1.5 bg-charcoal-100 text-charcoal text-xs font-medium px-3 py-1.5 rounded-lg">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      {status === 'confirmed' && (
        <div className="grid grid-cols-3 border-t border-border-warm">
          <button onClick={() => patch('completed')} disabled={loading !== null}
            className="flex items-center justify-center gap-1 py-3 text-xs font-medium text-brass bg-charcoal hover:bg-charcoal transition-colors disabled:opacity-50 border-r border-border-warm">
            {loading === 'completed' ? <><BtnSpinner />…</> : 'Completed'}
          </button>
          <button onClick={() => patch('no-show')} disabled={loading !== null}
            className="flex items-center justify-center gap-1 py-3 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors disabled:opacity-50 border-r border-border-warm">
            {loading === 'no-show' ? <><BtnSpinner />…</> : 'No-show'}
          </button>
          <button onClick={() => patch('cancelled')} disabled={loading !== null}
            className="flex items-center justify-center gap-1 py-3 text-xs font-medium text-soft-red bg-soft-red-light hover:bg-soft-red-light transition-colors disabled:opacity-50">
            {loading === 'cancelled' ? <><BtnSpinner />…</> : 'Cancel'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<IBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const loadBookings = useCallback(() => {
    setLoading(true)
    fetch(buildUrl(filter))
      .then(r => r.json())
      .then(json => setBookings(json.success ? json.data : []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [filter])

  useEffect(() => { loadBookings() }, [loadBookings])

  const handleUpdate = (id: string, status: IBooking['status']) => {
    setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b))
  }

  const confirmed = bookings.filter(b => b.status === 'confirmed')
  const other = bookings.filter(b => b.status !== 'confirmed')

  const shopId = user?.barberShopId ?? ''
  const barberId = user?._id ?? ''

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#111]">Bookings</h1>
          <p className="text-warm-gray text-sm mt-1">Your upcoming appointments</p>
        </div>
        {shopId && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-charcoal hover:bg-charcoal-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Booking</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 sm:flex gap-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-colors text-center ${
              filter === f.key
                ? 'bg-charcoal text-white'
                : 'bg-white border border-border-warm text-warm-gray hover:border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : confirmed.length === 0 && other.length === 0 ? (
        <div className="text-center py-16 bg-white border border-border-warm rounded-2xl">
          <p className="text-3xl mb-3">📅</p>
          <p className="font-semibold text-[#111] mb-1">No bookings for this period</p>
          <p className="text-sm text-warm-gray mb-5">
            {filter === 'today' ? 'No appointments today.' : 'Nothing scheduled here yet.'}
          </p>
          {shopId && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-charcoal hover:bg-charcoal-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Add first booking
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {confirmed.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-3">
                Confirmed · {confirmed.length}
              </p>
              <div className="flex flex-col gap-3">
                {confirmed.map(b => <BookingCard key={b._id} booking={b} onUpdate={handleUpdate} />)}
              </div>
            </div>
          )}
          {other.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-3">
                Other · {other.length}
              </p>
              <div className="flex flex-col gap-3">
                {other.map(b => <BookingCard key={b._id} booking={b} onUpdate={handleUpdate} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {showAddModal && shopId && (
        <AddBookingModal
          shopId={shopId}
          barberId={barberId}
          onClose={() => setShowAddModal(false)}
          onAdded={() => { loadBookings() }}
        />
      )}
    </div>
  )
}
