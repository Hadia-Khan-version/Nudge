'use client'

import { Sidebar } from '@/components/Sidebar'
import { DashboardHeader } from '@/components/DashboardHeader'
import { OverviewRail } from '@/components/OverviewRail'
import { ActionCenter } from '@/components/ActionCenter'
import { useNudgeData } from '@/hooks/useNudgeData'

export default function DashboardPage() {
  const {
  emails, syncing, analyzing, firstName, userEmail, userInitial,
  lastSyncedAt, counts, needsAttention,
  handleSync, handleAnalyze, handleMarkDone, handleSnooze, handleCorrectPriority,
} = useNudgeData()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader
          userEmail={userEmail}
          userInitial={userInitial}
          syncing={syncing}
          analyzing={analyzing}
          onSync={handleSync}
          onAnalyze={handleAnalyze}
        />
        <main className="mx-auto w-full max-w-6xl px-6 py-10">
          <div className="mb-10">
            <h1 className="font-display text-5xl italic leading-tight text-ink">
              Feelin' Good!{firstName ? ` ${firstName}` : ''}.
            </h1>
            <p className="mt-3 max-w-md text-lg text-ink-soft">
              {needsAttention === 0
                ? "You're all caught up."
                : `${needsAttention} ${needsAttention === 1 ? 'thing' : 'things'} worth your attention.`}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px]">
            <ActionCenter emails={emails} onMarkDone={handleMarkDone} onSnooze={handleSnooze} onCorrectPriority={handleCorrectPriority} />
            <OverviewRail urgentCount={counts.urgent} upcomingCount={counts.upcoming} quietCount={counts.low} lastSyncedAt={lastSyncedAt} />
          </div>
        </main>
      </div>
    </div>
  )
}