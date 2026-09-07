'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function DashboardHeader({
  userEmail, userInitial, syncing, analyzing, onSync, onAnalyze,
}: {
  userEmail: string; userInitial: string; syncing: boolean; analyzing: boolean
  onSync: () => void; onAnalyze: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header className="flex items-center justify-between border-b border-glass-border bg-glass px-6 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-sm">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand shadow-[0_0_10px_rgba(52,228,193,0.8)]" />
        <span className="text-ink-soft">Gmail connected</span>
        <button onClick={onSync} disabled={syncing} className="ml-2 text-xs font-medium text-brand transition-opacity hover:opacity-70 disabled:opacity-50">
          {syncing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onAnalyze}
          disabled={analyzing}
          className="rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-2.5 text-sm font-medium text-void shadow-[0_0_25px_rgba(52,228,193,0.35)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(52,228,193,0.5)] disabled:opacity-50 disabled:hover:scale-100"
        >
          {analyzing ? 'Finding what matters…' : 'Find what matters'}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-glass-border bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 text-sm font-medium text-ink transition-all hover:border-brand/40"
          >
            {userInitial}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 w-48 rounded-xl border border-glass-border bg-surface/90 p-2 text-sm shadow-2xl backdrop-blur-xl">
              <p className="truncate px-2 py-1 text-xs text-ink-faint">{userEmail}</p>
              <button onClick={handleSignOut} className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-ink transition-colors hover:bg-white/[0.06]">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}