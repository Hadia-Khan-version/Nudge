'use client'

import { Sidebar } from '@/components/Sidebar'
import { DashboardHeader } from '@/components/DashboardHeader'
import { useNudgeData, type Email, type Analysis } from '@/hooks/useNudgeData'

function gmailLink(messageId: string | null, threadId: string) {
  if (messageId) {
    return `https://mail.google.com/mail/u/0/#search/rfc822msgid:${encodeURIComponent(messageId)}`
  }
  return `https://mail.google.com/mail/u/0/#inbox/${threadId}`
}

type EventItem = { email: Email; analysis: Analysis }

export default function CalendarPage() {
  const { emails, syncing, analyzing, userEmail, userInitial, handleSync, handleAnalyze } = useNudgeData()

  const events: EventItem[] = emails
  .map((email) => ({ email, analysis: email.email_analysis }))
  .filter((e): e is EventItem => Boolean(e.analysis?.deadline_at))
  .filter((e) => new Date(e.analysis.deadline_at as string) >= new Date())
  .sort((a, b) => (a.analysis.deadline_at as string).localeCompare(b.analysis.deadline_at as string))
  
  const grouped = events.reduce((acc, item) => {
    const date = new Date(item.analysis.deadline_at as string)
    const key = date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, EventItem[]>)

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
        <main className="mx-auto w-full max-w-3xl px-6 py-10">
          <h1 className="font-display text-4xl italic text-ink">Calendar</h1>
          <p className="mt-2 text-ink-soft">Meetings and deadlines Nudge found in your inbox.</p>

          <div className="mt-8 space-y-8">
            {Object.keys(grouped).length === 0 && (
              <div className="rounded-2xl border border-glass-border bg-glass py-16 text-center backdrop-blur-xl">
                <p className="text-sm text-ink-soft">No upcoming meetings or deadlines found yet.</p>
              </div>
            )}
            {Object.entries(grouped).map(([day, items]) => (
              <section key={day}>
                <h3 className="mb-3 text-sm font-medium text-ink-soft">{day}</h3>
                <div className="divide-y divide-glass-border rounded-2xl border border-glass-border bg-glass backdrop-blur-xl">
                  {items.map(({ email, analysis }) => (
                    <a
                      key={email.id}
                      href={gmailLink(email.message_id, email.gmail_thread_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-white/[0.03]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{email.subject ?? '(no subject)'}</p>
                        <p className="mt-0.5 text-xs text-ink-soft">{analysis.summary}</p>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-upcoming">
                        {new Date(analysis.deadline_at as string).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}