function RadialStat({ urgent, upcoming, quiet }: { urgent: number; upcoming: number; quiet: number }) {
  const total = Math.max(urgent + upcoming + quiet, 1)
  const r = 40
  const circumference = 2 * Math.PI * r
  const urgentLen = (urgent / total) * circumference
  const upcomingLen = (upcoming / total) * circumference
  const quietLen = (quiet / total) * circumference

  return (
    <svg width="120" height="120" viewBox="0 0 100 100" className="mx-auto">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#FB7185" strokeWidth="10"
        strokeDasharray={`${urgentLen} ${circumference - urgentLen}`}
        strokeLinecap="round" transform="rotate(-90 50 50)"
        style={{ filter: 'drop-shadow(0 0 6px rgba(251,113,133,0.6))' }} />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#FBBF24" strokeWidth="10"
        strokeDasharray={`${upcomingLen} ${circumference - upcomingLen}`}
        strokeDashoffset={-urgentLen} strokeLinecap="round" transform="rotate(-90 50 50)"
        style={{ filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.5))' }} />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#34E4C1" strokeWidth="10"
        strokeDasharray={`${quietLen} ${circumference - quietLen}`}
        strokeDashoffset={-(urgentLen + upcomingLen)} strokeLinecap="round" transform="rotate(-90 50 50)"
        style={{ filter: 'drop-shadow(0 0 6px rgba(52,228,193,0.4))' }} />
      <text x="50" y="55" textAnchor="middle" className="fill-ink font-mono text-[16px] font-medium">{total}</text>
    </svg>
  )
}

export function OverviewRail({
  urgentCount, upcomingCount, quietCount, lastSyncedAt,
}: { urgentCount: number; upcomingCount: number; quietCount: number; lastSyncedAt: string | null }) {
  const formattedSync = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : null

  return (
    <aside className="hidden w-64 shrink-0 space-y-4 lg:block">
      <div className="rounded-2xl border border-glass-border bg-glass p-5 backdrop-blur-xl">
        <h3 className="text-sm font-medium text-ink-soft">Overview</h3>
        <RadialStat urgent={urgentCount} upcoming={upcomingCount} quiet={quietCount} />
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-ink-soft"><span className="h-2 w-2 rounded-full bg-urgent" />Urgent</span>
            <span className="font-mono text-ink">{urgentCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-ink-soft"><span className="h-2 w-2 rounded-full bg-upcoming" />Upcoming</span>
            <span className="font-mono text-ink">{upcomingCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-ink-soft"><span className="h-2 w-2 rounded-full bg-brand" />Quiet</span>
            <span className="font-mono text-ink">{quietCount}</span>
          </div>
        </div>
      </div>
      {formattedSync && <p className="px-1 text-xs text-ink-faint">Last synced {formattedSync}</p>}
    </aside>
  )
}