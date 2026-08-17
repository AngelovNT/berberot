'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg style={{ width: 18, height: 18 }} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function ScissorsIcon({ active }: { active: boolean }) {
  return (
    <svg style={{ width: 18, height: 18 }} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
    </svg>
  )
}

function UsersIcon({ active }: { active: boolean }) {
  return (
    <svg style={{ width: 18, height: 18 }} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function CogIcon({ active }: { active: boolean }) {
  return (
    <svg style={{ width: 18, height: 18 }} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

const links = [
  { href: '/dashboard',          label: 'Dashboard', Icon: HomeIcon },
  { href: '/dashboard/bookings', label: 'Bookings',  Icon: CalendarIcon },
  { href: '/dashboard/services', label: 'Services',  Icon: ScissorsIcon },
  { href: '/dashboard/clients',  label: 'Clients',   Icon: UsersIcon },
  { href: '/dashboard/settings', label: 'Settings',  Icon: CogIcon },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <>
      {/* Desktop sidebar — dark charcoal */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-charcoal">
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/" className="font-display text-xl font-bold tracking-widest text-white hover:opacity-75 transition-opacity">
            BERBEROT<span className="text-brass">.</span>
          </Link>
          <p className="text-xs text-white/30 mt-0.5 font-medium tracking-wide uppercase">Dashboard</p>
        </div>

        <nav className="flex-1 p-3 pt-4">
          <ul className="space-y-0.5">
            {links.map(({ href, label, Icon }) => {
              const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                    }`}
                  >
                    <Icon active={isActive} />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {user && (
          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brass/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-brass">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-white/30 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={async () => { await logout(); router.push('/') }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors"
            >
              <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile bottom tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-charcoal border-t border-white/10 z-40">
        <ul className="flex">
          {links.map(({ href, label, Icon }) => {
            const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={`flex flex-col items-center py-2.5 px-1 text-xs font-medium transition-colors ${
                    isActive ? 'text-brass' : 'text-white/40'
                  }`}
                >
                  <Icon active={isActive} />
                  <span className="mt-0.5">{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
