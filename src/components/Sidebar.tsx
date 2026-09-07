'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function Mark() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="sideMarkGrad" x1="0" y1="0" x2="28" y2="28">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <path d="M6 14a8 8 0 0 1 8-8" stroke="url(#sideMarkGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M6 14a8 8 0 0 0 8 8" stroke="url(#sideMarkGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <circle cx="20" cy="14" r="4" fill="url(#sideMarkGrad)" />
    </svg>
  )
}

const NAV = [
  { label: 'Dashboard', href: '/dashboard', enabled: true },
  { label: 'Calendar', href: '/dashboard/calendar', enabled: true },
  { label: 'Settings', href: '/dashboard/settings', enabled: false },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-60 shrink-0 border-r border-glass-border bg-glass px-4 py-6 backdrop-blur-xl md:block">
      <div className="flex items-center gap-2 px-2">
        <Mark />
        <span className="font-display text-lg italic text-ink">Nudge</span>
      </div>

      <nav className="mt-8 space-y-1">
        {NAV.map((item) => {
          if (!item.enabled) {
            return (
              <div key={item.label} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-ink-faint">
                <span>{item.label}</span>
                <span className="rounded-full border border-glass-border px-1.5 py-0.5 text-[10px] font-mono">soon</span>
              </div>
            )
          }
          const active = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`block rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
                active
                  ? 'bg-brand/10 font-medium text-brand shadow-[0_0_20px_rgba(52,228,193,0.15)]'
                  : 'text-ink-soft hover:bg-white/[0.04] hover:text-ink'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}