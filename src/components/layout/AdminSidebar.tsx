'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/barbershops', label: 'Barbershops', icon: '💈' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-charcoal text-white">
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/" className="font-display text-xl font-bold tracking-widest text-white hover:opacity-75 transition-opacity">
            BERBEROT<span className="text-brass">.</span>
          </Link>
          <p className="text-xs text-white/30 mt-0.5 font-medium tracking-wide uppercase">Admin</p>
        </div>
        <nav className="flex-1 p-3">
          <ul className="space-y-0.5">
            {links.map((link) => {
              const isActive =
                link.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(link.href)
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                    }`}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile bottom tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-charcoal border-t border-white/10 z-40">
        <ul className="flex">
          {links.map((link) => {
            const isActive =
              link.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(link.href)
            return (
              <li key={link.href} className="flex-1">
                <Link
                  href={link.href}
                  className={`flex flex-col items-center py-2 px-1 text-xs transition-colors ${
                    isActive ? 'text-brass' : 'text-warm-gray'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="mt-0.5">{link.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
