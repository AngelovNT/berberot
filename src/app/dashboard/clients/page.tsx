'use client'

import { useEffect, useState, useCallback } from 'react'
import Spinner from '@/components/ui/Spinner'

function BtnSpinner() {
  return (
    <svg className="animate-spin w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

interface ClientBooking {
  _id: string
  date: string
  startTime: string
  endTime: string
  status: string
  serviceId?: { name: string; price: number }
}

interface Client {
  _id: string
  name: string
  email: string
  phone: string
  photo: string
  totalBookings: number
  noShowCount: number
  upcomingBookings: ClientBooking[]
  pastBookings: ClientBooking[]
  notes: string
  isFavorite: boolean
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IE', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

function ClientModal({
  client,
  onClose,
  onUpdated,
}: {
  client: Client
  onClose: () => void
  onUpdated: (updated: Partial<Client>) => void
}) {
  const [notes, setNotes] = useState(client.notes)
  const [isFavorite, setIsFavorite] = useState(client.isFavorite)
  const [savingNotes, setSavingNotes] = useState(false)
  const [savingFav, setSavingFav] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)

  const patchMeta = async (patch: { notes?: string; isFavorite?: boolean }) => {
    await fetch(`/api/barber/clients/${client._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    await patchMeta({ notes })
    setSavingNotes(false)
    setNotesSaved(true)
    onUpdated({ notes })
    setTimeout(() => setNotesSaved(false), 2000)
  }

  const handleToggleFavorite = async () => {
    if (savingFav) return
    const next = !isFavorite
    setSavingFav(true)
    setIsFavorite(next)
    await patchMeta({ isFavorite: next })
    setSavingFav(false)
    onUpdated({ isFavorite: next })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border-warm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#111]">Client Profile</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFavorite}
                disabled={savingFav}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                className={`text-2xl leading-none transition-transform hover:scale-110 ${savingFav ? 'opacity-50' : ''}`}
              >
                {isFavorite ? '⭐' : '☆'}
              </button>
              <button onClick={onClose} className="text-warm-gray hover:text-warm-gray text-2xl leading-none">×</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
              {client.photo ? (
                <img src={client.photo} alt={client.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-charcoal flex items-center justify-center text-white font-bold text-xl">
                  {client.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-[#111] text-lg">{client.name}</p>
                {isFavorite && <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-medium">Favorite</span>}
              </div>
              <p className="text-sm text-warm-gray">{client.email.includes('@clipr.local') ? 'No email on file' : client.email}</p>
              {client.phone && <p className="text-sm text-warm-gray mt-0.5">{client.phone}</p>}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {client.phone && (
              <a
                href={`tel:${client.phone}`}
                className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                Call
              </a>
            )}
            {client.phone && (
              <button
                onClick={() => navigator.clipboard.writeText(client.phone).catch(() => {})}
                className="flex items-center gap-1.5 bg-charcoal-100 hover:bg-charcoal-100 text-charcoal text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                Copy number
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-border-warm">
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-[#111]">{client.totalBookings}</p>
            <p className="text-xs text-warm-gray mt-0.5">Total visits</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-[#111]">{client.upcomingBookings.length}</p>
            <p className="text-xs text-warm-gray mt-0.5">Upcoming</p>
          </div>
          <div className="p-4 text-center">
            <p className={`text-2xl font-bold ${client.noShowCount > 0 ? 'text-orange-500' : 'text-[#111]'}`}>
              {client.noShowCount}
            </p>
            <p className="text-xs text-warm-gray mt-0.5">No-shows</p>
          </div>
        </div>

        <div className="p-5 border-b border-border-warm">
          <p className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">Notes</p>
          <textarea
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setNotesSaved(false) }}
            placeholder="Add notes about this client…"
            rows={3}
            className="w-full border border-border-warm rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal resize-none"
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="text-sm bg-charcoal hover:bg-charcoal-800 text-white font-medium px-4 py-1.5 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1.5"
            >
              {savingNotes ? <><BtnSpinner />Saving…</> : notesSaved ? '✓ Saved' : 'Save Notes'}
            </button>
          </div>
        </div>

        {client.upcomingBookings.length > 0 && (
          <div className="p-5 border-b border-border-warm">
            <p className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-3">Upcoming</p>
            <div className="space-y-2">
              {client.upcomingBookings.map((b) => (
                <div key={b._id} className="flex items-center justify-between text-sm bg-charcoal border border-charcoal rounded-xl px-3 py-2">
                  <span className="font-medium text-[#111]">{formatDate(b.date)} · {b.startTime}</span>
                  {b.serviceId && <span className="text-warm-gray">{b.serviceId.name}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {client.pastBookings.length > 0 && (
          <div className="p-5">
            <p className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-3">History</p>
            <div className="space-y-2">
              {client.pastBookings.slice(0, 10).map((b) => (
                <div key={b._id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                  <div>
                    <span className="font-medium text-[#111]">{formatDate(b.date)}</span>
                    <span className="text-warm-gray ml-1">· {b.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.serviceId && <span className="text-warm-gray">{b.serviceId.name}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      b.status === 'completed' ? 'bg-green-100 text-green-700' :
                      b.status === 'no-show' ? 'bg-orange-100 text-orange-600' :
                      b.status === 'cancelled' ? 'bg-soft-red-light text-soft-red' :
                      'bg-charcoal text-charcoal'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AddClientModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name || !phone) { setError('Name and phone are required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/barber/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.message ?? 'Failed to add client'); return }
      onAdded()
      onClose()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#111]">Add Client</h2>
            <button onClick={onClose} className="text-warm-gray hover:text-warm-gray text-2xl leading-none">×</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Full Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Phone Number *</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+353 87 123 4567" required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Email <span className="text-warm-gray font-normal">(optional)</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal" />
            </div>
            {error && <div className="bg-soft-red-light border border-soft-red/20 text-soft-red text-sm px-4 py-3 rounded-xl">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-charcoal hover:bg-charcoal-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60">
              {loading ? <><BtnSpinner />Adding…</> : 'Add Client'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const LIMIT = 20

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selected, setSelected] = useState<Client | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const load = useCallback(async (q: string, p: number, append = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true)
    try {
      const params = new URLSearchParams({ limit: String(LIMIT), page: String(p) })
      if (q) params.set('search', q)
      const res = await fetch(`/api/barber/clients?${params}`)
      const json = await res.json()
      if (json.success) {
        setClients((prev) => append ? [...prev, ...json.data.clients] : json.data.clients)
        setTotal(json.data.total)
        setPage(json.data.page)
        setPages(json.data.pages)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => { load(search, 1) }, [search, load])

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleLoadMore = () => load(search, page + 1, true)

  const reload = () => load(search, 1)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111]">Clients</h1>
          <p className="text-warm-gray text-sm mt-1">
            {total} client{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-charcoal hover:bg-charcoal-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name, phone, or email…"
          className="w-full bg-white border border-border-warm rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16 bg-white border border-border-warm rounded-2xl">
          <p className="text-3xl mb-3">👤</p>
          <p className="font-semibold text-[#111] mb-1">
            {search ? 'No clients found' : 'No clients yet'}
          </p>
          <p className="text-sm text-warm-gray mb-5">
            {search ? 'Try a different search.' : 'Clients appear here once they book with you.'}
          </p>
          {!search && (
            <button onClick={() => setShowAdd(true)}
              className="inline-block bg-charcoal hover:bg-charcoal-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Add First Client
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white border border-border-warm rounded-2xl overflow-hidden">
            {clients.map((client, idx) => (
              <button
                key={client._id}
                onClick={() => setSelected(client)}
                className={`w-full flex items-center justify-between px-5 py-4 hover:bg-ivory transition-colors text-left ${
                  idx < clients.length - 1 ? 'border-b border-border-warm' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    {client.photo ? (
                      <img src={client.photo} alt={client.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-charcoal flex items-center justify-center text-white font-bold">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-[#111] text-sm truncate">{client.name}</p>
                      {client.isFavorite && <span className="text-sm leading-none flex-shrink-0">⭐</span>}
                    </div>
                    <p className="text-xs text-warm-gray mt-0.5 truncate">
                      {client.phone || (client.email.includes('@clipr.local') ? 'No contact' : client.email)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right flex-shrink-0 ml-2">
                  <div>
                    <p className="text-sm font-semibold text-[#111]">{client.totalBookings}</p>
                    <p className="text-xs text-warm-gray">visits</p>
                  </div>
                  {client.noShowCount > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-orange-500">{client.noShowCount}</p>
                      <p className="text-xs text-warm-gray">no-show</p>
                    </div>
                  )}
                  {client.upcomingBookings.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-brass">{client.upcomingBookings.length}</p>
                      <p className="text-xs text-warm-gray">upcoming</p>
                    </div>
                  )}
                  <svg className="w-4 h-4 text-charcoal-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {page < pages && (
            <div className="mt-4 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 bg-white border border-border-warm hover:border-charcoal text-warm-gray hover:text-brass text-sm font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60"
              >
                {loadingMore ? <><BtnSpinner />Loading…</> : `Load more (${total - clients.length} remaining)`}
              </button>
            </div>
          )}
        </>
      )}

      {selected && (
        <ClientModal
          client={selected}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => {
            setClients((prev) => prev.map((c) => c._id === selected._id ? { ...c, ...updated } : c))
            setSelected((prev) => prev ? { ...prev, ...updated } : null)
          }}
        />
      )}
      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} onAdded={reload} />}
    </div>
  )
}
