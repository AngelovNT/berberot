'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'

export default function Navbar() {
  const { user, loading, logout } = useAuth()

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-border-warm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between" style={{ height: '60px' }}>
        <Link href="/" className="font-display text-xl font-bold tracking-widest text-charcoal hover:opacity-75 transition-opacity">
          CLIPR<span className="text-brass">.</span>
        </Link>

        {!loading && (
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link href="/" className="text-sm text-warm-gray hover:text-charcoal transition-colors hidden sm:block font-medium">
                  Home
                </Link>
                {user.role === 'customer' && (
                  <>
                    <Link href="/my-bookings" className="text-sm text-warm-gray hover:text-charcoal transition-colors font-medium">
                      My Bookings
                    </Link>
                    <Link href="/profile" className="text-sm text-warm-gray hover:text-charcoal transition-colors hidden sm:block font-medium">
                      Profile
                    </Link>
                  </>
                )}
                {user.role === 'barber' && (
                  <span className="text-xs font-semibold uppercase tracking-widest text-warm-gray hidden sm:block">
                    Barber
                  </span>
                )}
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-sm text-warm-gray hover:text-charcoal transition-colors font-medium">
                    Admin
                  </Link>
                )}
                <span className="text-sm text-charcoal-200 hidden sm:block border-l border-border-warm pl-3">
                  {user.name}
                </span>
                <Button variant="secondary" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
