'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/dashboard', label: 'Wpisy' },
  { href: '/dashboard/habits', label: 'Nawyki' },
  { href: '/dashboard/stats', label: 'Statystyki' },
  { href: '/dashboard/settings', label: 'Ustawienia' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-4 font-semibold text-slate-900">
        <div className="mr-2 h-6 w-6 rounded-md bg-emerald-500" />
        Dziennik
      </div>

      <nav className="px-2 py-3 space-y-1">
        {items.map((i) => {
          const active = pathname === i.href
          return (
            <Link
              key={i.href}
              href={i.href}
              className={[
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200'
                  : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-900',
              ].join(' ')}
            >
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
              {i.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto p-3">
        <div className="rounded-xl border border-slate-200 bg-emerald-50/60 p-3 text-xs text-slate-600">
          <b className="text-slate-800">Porada:</b> użyj tagów, by szybciej znaleźć wpisy.
        </div>
      </div>
    </div>
  )
}
