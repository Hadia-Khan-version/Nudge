'use client'

import { createClient } from '@/lib/supabase/client'

function Mark() {
  return (
    <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="markGrad" x1="0" y1="0" x2="28" y2="28">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <path d="M6 14a8 8 0 0 1 8-8" stroke="url(#markGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M6 14a8 8 0 0 0 8 8" stroke="url(#markGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <circle cx="20" cy="14" r="4" fill="url(#markGrad)" />
    </svg>
  )
}

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/gmail.readonly',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-glass-border bg-glass p-10 shadow-[0_0_80px_rgba(52,228,193,0.08)] backdrop-blur-xl">
        <Mark />
        <h1 className="mt-6 font-display text-4xl italic tracking-tight text-ink">Nudge</h1>
        <p className="mt-2 text-sm text-ink-soft">Your inbox, minus the noise.</p>

        <p className="mt-6 text-sm leading-relaxed text-ink-soft">
          Nudge reads your new mail, flags what actually needs you, and tells you why it matters — so the rest can wait.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="group mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-glass-border bg-white/[0.03] px-4 py-3 text-sm font-medium text-ink transition-all duration-300 hover:border-brand/40 hover:bg-white/[0.06] hover:shadow-[0_0_30px_rgba(52,228,193,0.15)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="transition-transform group-hover:translate-x-0.5">Continue with Google</span>
        </button>

        <p className="mt-4 text-xs text-ink-faint">
          Nudge only reads your inbox — it never sends or deletes anything on your behalf.
        </p>
      </div>
    </div>
  )
}