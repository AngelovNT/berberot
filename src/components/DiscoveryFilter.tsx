'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

export default function DiscoveryFilter() {
  const router = useRouter()
  const sp = useSearchParams()
  const [, startTransition] = useTransition()
  const [q, setQ] = useState(sp.get('q') ?? '')
  const sort = sp.get('sort') ?? 'soonest'

  const setSort = (val: string) => {
    const params = new URLSearchParams(sp.toString())
    params.set('sort', val)
    if (q) params.set('q', q); else params.delete('q')
    startTransition(() => router.push(`/?${params.toString()}`))
  }

  const handleSearch = (val: string) => {
    setQ(val)
    const params = new URLSearchParams(sp.toString())
    if (val) params.set('q', val); else params.delete('q')
    startTransition(() => router.replace(`/?${params.toString()}`))
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      {/* Search */}
      <div className="relative flex-1">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={q}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search barbershops…"
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-border-warm rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20 focus:border-charcoal hover:border-charcoal-200 transition-colors"
        />
      </div>

      {/* Sort pills */}
      <div className="flex gap-1.5 flex-shrink-0">
        {[
          { key: 'soonest', label: 'Soonest' },
          { key: 'rated', label: 'Best rated' },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => setSort(opt.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              sort === opt.key
                ? 'bg-charcoal text-white'
                : 'bg-white shadow-card text-warm-gray hover:shadow-card-hover hover:text-charcoal'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
