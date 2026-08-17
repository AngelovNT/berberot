'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import WorkingHoursForm from '@/components/dashboard/WorkingHoursForm'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageUpload from '@/components/ui/ImageUpload'

function InviteLinkSection({ shopId }: { shopId: string }) {
  const [copied, setCopied] = useState(false)
  const link = typeof window !== 'undefined' ? `${window.location.origin}/join?shop=${shopId}` : `/join?shop=${shopId}`

  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }).catch(() => {})
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="flex-1 min-w-0 text-xs font-mono bg-charcoal-50 border border-border-warm rounded-xl px-3 py-2.5 text-warm-gray truncate">{link}</p>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 bg-charcoal hover:bg-charcoal-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
      </div>
      <p className="text-xs text-warm-gray">The barber opens this link, creates an account, and is instantly added to your shop.</p>
    </div>
  )
}

function BlockedDatesForm() {
  const [blocked, setBlocked] = useState<{ _id: string; date: string; reason: string }[]>([])
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch('/api/barber/blocked-dates')
      .then((r) => r.json())
      .then((j) => { if (j.success) setBlocked(j.data) })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  const handleBlock = async (e: FormEvent) => {
    e.preventDefault()
    if (!newDate) return
    setLoading(true)
    try {
      const res = await fetch('/api/barber/blocked-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate, reason: newReason }),
      })
      const j = await res.json()
      if (res.ok) {
        setBlocked((prev) => [...prev.filter((b) => b.date !== newDate), j.data].sort((a, b) => a.date.localeCompare(b.date)))
        setNewDate('')
        setNewReason('')
      }
    } finally { setLoading(false) }
  }

  const handleUnblock = async (date: string) => {
    await fetch('/api/barber/blocked-dates', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    })
    setBlocked((prev) => prev.filter((b) => b.date !== date))
  }

  const formatDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-IE', { weekday: 'short', month: 'short', day: 'numeric' })

  if (fetching) return <div className="animate-pulse h-20 bg-charcoal-100 rounded-xl" />

  return (
    <div className="space-y-4">
      <p className="text-sm text-warm-gray">Block specific dates — no bookings can be made on blocked days.</p>
      <form onSubmit={handleBlock} className="flex flex-col sm:flex-row gap-2">
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          required
          className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal"
        />
        <input
          type="text"
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
          placeholder="Reason (optional)"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal"
        />
        <button type="submit" disabled={loading || !newDate}
          className="bg-charcoal hover:bg-charcoal-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60 whitespace-nowrap">
          Block Date
        </button>
      </form>

      {blocked.length === 0 ? (
        <p className="text-sm text-warm-gray">No blocked dates.</p>
      ) : (
        <div className="space-y-2">
          {blocked.map((b) => (
            <div key={b._id} className="flex items-center justify-between bg-soft-red-light border border-soft-red/15 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#111]">{formatDate(b.date)}</p>
                {b.reason && <p className="text-xs text-warm-gray mt-0.5">{b.reason}</p>}
              </div>
              <button onClick={() => handleUnblock(b.date)}
                className="text-xs text-soft-red hover:text-soft-red border border-soft-red/20 bg-white hover:bg-soft-red-light px-3 py-1.5 rounded-lg transition-colors">
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface ShopProfile {
  name: string
  location: string
  description: string
  coverImage: string
  instagram: string
  facebook: string
  website: string
  promoVideo: string
}

function ShopProfileForm({ shopId }: { shopId: string }) {
  const [profile, setProfile] = useState<ShopProfile>({
    name: '',
    location: '',
    description: '',
    coverImage: '',
    instagram: '',
    facebook: '',
    website: '',
    promoVideo: '',
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/barbershops/${shopId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const d = json.data
          setProfile({
            name: d.name ?? '',
            location: d.location ?? '',
            description: d.description ?? '',
            coverImage: d.coverImage ?? '',
            instagram: d.instagram ?? '',
            facebook: d.facebook ?? '',
            website: d.website ?? '',
            promoVideo: d.promoVideo ?? '',
          })
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [shopId])

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSaved(false)

    try {
      const res = await fetch(`/api/barbershops/${shopId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.message ?? 'Failed to save')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const set = (key: keyof ShopProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile((prev) => ({ ...prev, [key]: e.target.value }))
  }

  if (fetching) {
    return <div className="animate-pulse h-40 bg-charcoal-100 rounded-xl" />
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Shop Name"
          value={profile.name}
          onChange={set('name')}
          placeholder="Sharp Cuts"
          required
        />
        <Input
          label="Location"
          value={profile.location}
          onChange={set('location')}
          placeholder="42 Main Street, Dublin"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-charcoal">Description</label>
        <textarea
          value={profile.description}
          onChange={set('description')}
          placeholder="Tell customers about your barbershop..."
          rows={3}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-charcoal focus:border-transparent resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-charcoal mb-2">Cover Image</label>
        <ImageUpload
          value={profile.coverImage}
          onChange={(url) => set('coverImage')({ target: { value: url } } as React.ChangeEvent<HTMLInputElement>)}
          folder="berberot/shops"
          shape="square"
          placeholder="🏪"
        />
      </div>
      {profile.coverImage && (
        <div className="h-32 rounded-xl overflow-hidden border border-border-warm">
          <img src={profile.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Instagram handle"
          value={profile.instagram}
          onChange={set('instagram')}
          placeholder="sharpcuts_official"
        />
        <Input
          label="Facebook page"
          value={profile.facebook}
          onChange={set('facebook')}
          placeholder="SharpCutsBarber"
        />
        <Input
          label="Website URL"
          value={profile.website}
          onChange={set('website')}
          placeholder="https://yoursite.com"
          type="url"
        />
      </div>
      <Input
        label="Promo Video (YouTube URL)"
        value={profile.promoVideo}
        onChange={set('promoVideo')}
        placeholder="https://www.youtube.com/watch?v=..."
        type="url"
      />

      {error && (
        <div className="bg-soft-red-light border border-soft-red/20 text-soft-red text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
          Shop profile saved!
        </div>
      )}

      <Button type="submit" loading={loading}>
        Save Shop Profile
      </Button>
    </form>
  )
}

function PhotoForm({ userId }: { userId: string }) {
  const [photo, setPhoto] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setPhoto(json.data.photo ?? '')
          setPhone(json.data.phone ?? '')
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [userId])

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSaved(false)

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo, phone }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.message ?? 'Failed to save')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="animate-pulse h-20 bg-charcoal-100 rounded-xl" />
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <ImageUpload
        value={photo}
        onChange={setPhoto}
        folder="berberot/barbers"
        shape="circle"
        placeholder="👤"
      />
      <Input
        label="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+353 87 123 4567"
        type="tel"
      />

      {error && (
        <div className="bg-soft-red-light border border-soft-red/20 text-soft-red text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
          Profile saved!
        </div>
      )}

      <Button type="submit" loading={loading}>
        Save Profile
      </Button>
    </form>
  )
}

export default function SettingsPage() {
  const { user, refetch } = useAuth()
  const [shopName, setShopName] = useState('')
  const [shopLocation, setShopLocation] = useState('')
  const [shopLoading, setShopLoading] = useState(false)
  const [shopError, setShopError] = useState('')
  const [shopSaved, setShopSaved] = useState(false)

  const handleShopCreate = async (e: FormEvent) => {
    e.preventDefault()
    setShopError('')
    setShopLoading(true)

    try {
      const res = await fetch('/api/barbershops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: shopName, location: shopLocation }),
      })

      const json = await res.json()

      if (!res.ok) {
        setShopError(json.message ?? 'Failed to create shop')
        return
      }

      setShopSaved(true)
      await refetch()
    } catch {
      setShopError('Something went wrong.')
    } finally {
      setShopLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111]">Settings</h1>
        <p className="text-warm-gray text-sm mt-1">Manage your barbershop and working hours</p>
      </div>

      {/* Barbershop setup */}
      {!user?.barberShopId && (
        <Card className="mb-6">
          <h2 className="text-base font-semibold text-[#111] mb-4">Create Your Barbershop</h2>
          {shopSaved ? (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
              Barbershop created! You can now add services and set working hours.
            </div>
          ) : (
            <form onSubmit={handleShopCreate} className="space-y-4">
              {shopError && (
                <div className="bg-soft-red-light border border-soft-red/20 text-soft-red text-sm px-4 py-3 rounded-lg">
                  {shopError}
                </div>
              )}
              <Input
                label="Barbershop Name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. The Sharp Blade"
                required
              />
              <Input
                label="Location"
                value={shopLocation}
                onChange={(e) => setShopLocation(e.target.value)}
                placeholder="e.g. 42 Main Street, Dublin"
                required
              />
              <Button type="submit" loading={shopLoading}>
                Create Barbershop
              </Button>
            </form>
          )}
        </Card>
      )}

      {user?.barberShopId && (
        <div className="space-y-6">
          {/* Team invite link */}
          <Card>
            <h2 className="text-base font-semibold text-[#111] mb-1">Team</h2>
            <p className="text-sm text-warm-gray mb-4">
              Share this invite link with a barber to add them to your shop. They click the link, create an account, and are added automatically.
            </p>
            <InviteLinkSection shopId={user.barberShopId ?? ''} />
          </Card>

          {/* Shop Profile */}
          <Card>
            <h2 className="text-base font-semibold text-[#111] mb-4">Shop Profile</h2>
            <p className="text-sm text-warm-gray mb-5">
              Customize your public barbershop profile with photos, descriptions, and social links.
            </p>
            <ShopProfileForm shopId={user.barberShopId} />
          </Card>

          {/* Barber Profile */}
          <Card>
            <h2 className="text-base font-semibold text-[#111] mb-4">Your Profile</h2>
            <p className="text-sm text-warm-gray mb-5">
              Add a photo and phone number so customers can recognize and reach you.
            </p>
            <PhotoForm userId={user._id} />
          </Card>

          {/* Working Hours */}
          <Card>
            <h2 className="text-base font-semibold text-[#111] mb-4">Working Hours</h2>
            <WorkingHoursForm />
          </Card>

          {/* Blocked Dates */}
          <Card>
            <h2 className="text-base font-semibold text-[#111] mb-4">Blocked Dates</h2>
            <BlockedDatesForm />
          </Card>

          {/* Danger zone */}
          <Card>
            <h2 className="text-base font-semibold text-soft-red mb-1">Danger Zone</h2>
            <p className="text-sm text-warm-gray mb-4">
              Permanently delete your account and all personal data. This cannot be undone.
            </p>
            <DeleteAccountButton />
          </Card>

        </div>
      )}
    </div>
  )
}

function DeleteAccountButton() {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'DELETE' })
      if (res.ok) router.push('/')
    } catch {
      setLoading(false)
    }
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="text-sm font-semibold text-soft-red border border-soft-red/30 hover:bg-soft-red-light px-4 py-2.5 rounded-xl transition-colors"
      >
        Delete my account
      </button>
    )
  }

  return (
    <div className="bg-soft-red-light border border-soft-red/20 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-soft-red">Are you sure? This will permanently delete your account and all personal data.</p>
      <div className="flex gap-3">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-sm font-semibold text-white bg-soft-red hover:opacity-90 px-4 py-2 rounded-xl transition-opacity disabled:opacity-50"
        >
          {loading ? 'Deleting…' : 'Yes, delete my account'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-sm font-semibold text-warm-gray hover:text-charcoal transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
