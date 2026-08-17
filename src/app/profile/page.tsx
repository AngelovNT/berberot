'use client'

import { useState, useEffect, FormEvent } from 'react'
import Navbar from '@/components/layout/Navbar'
import { useAuth } from '@/hooks/useAuth'
import Spinner from '@/components/ui/Spinner'

function BtnSpinner() {
  return (
    <svg className="animate-spin w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default function ProfilePage() {
  const { user, refetch } = useAuth()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [photo, setPhoto] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passLoading, setPassLoading] = useState(false)
  const [passSaved, setPassSaved] = useState(false)
  const [passError, setPassError] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name ?? '')
      setPhone(user.phone ?? '')
      setPhoto(user.photo ?? '')
    }
  }, [user])

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSaved(false)
    setProfileLoading(true)

    try {
      const res = await fetch(`/api/users/${user?._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, photo }),
      })
      const json = await res.json()
      if (!res.ok) {
        setProfileError(json.message ?? 'Failed to save')
      } else {
        setProfileSaved(true)
        await refetch()
        setTimeout(() => setProfileSaved(false), 3000)
      }
    } catch {
      setProfileError('Something went wrong.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    setPassError('')
    setPassSaved(false)

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters')
      return
    }

    setPassLoading(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const json = await res.json()
      if (!res.ok) {
        setPassError(json.message ?? 'Failed to update password')
      } else {
        setPassSaved(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPassSaved(false), 3000)
      }
    } catch {
      setPassError('Something went wrong.')
    } finally {
      setPassLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-ivory">
        <Navbar />
        <div className="flex justify-center py-20"><Spinner /></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#111]">My Profile</h1>
          <p className="text-warm-gray text-sm mt-1">Manage your personal information</p>
        </div>

        {/* Avatar preview */}
        <div className="bg-white border border-border-warm rounded-2xl p-6 mb-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
              {photo ? (
                <img src={photo} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-charcoal flex items-center justify-center text-white font-bold text-2xl">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-[#111]">{user.name}</p>
              <p className="text-sm text-warm-gray">{user.email}</p>
              <span className="inline-block mt-1 text-xs bg-charcoal-100 text-warm-gray px-2 py-0.5 rounded-full capitalize">{user.role}</span>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+353 87 123 4567"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal"
              />
              <p className="text-xs text-warm-gray mt-1">Saved to your profile — won&apos;t need to enter it each booking.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Photo URL <span className="text-warm-gray font-normal">(optional)</span></label>
              <input
                type="url"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal"
              />
            </div>

            {profileError && (
              <div className="bg-soft-red-light border border-soft-red/20 text-soft-red text-sm px-4 py-3 rounded-xl">{profileError}</div>
            )}
            {profileSaved && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">Profile saved!</div>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-charcoal hover:bg-charcoal-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              {profileLoading ? <><BtnSpinner />Saving…</> : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white border border-border-warm rounded-2xl p-6">
          <h2 className="text-base font-semibold text-[#111] mb-5">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal"
              />
            </div>

            {passError && (
              <div className="bg-soft-red-light border border-soft-red/20 text-soft-red text-sm px-4 py-3 rounded-xl">{passError}</div>
            )}
            {passSaved && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">Password updated!</div>
            )}

            <button
              type="submit"
              disabled={passLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              {passLoading ? <><BtnSpinner />Updating…</> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
