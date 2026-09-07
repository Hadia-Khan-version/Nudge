'use client'

import { useState } from 'react'
import { getEffectivePriority } from '@/lib/priority'

type Analysis = {
  category: string
  priority: 'urgent' | 'upcoming' | 'low'
  priority_override: 'urgent' | 'upcoming' | 'low' | null
  deadline_at: string | null
  summary: string | null
  reasoning: string | null
}

type Email = {
  id: string
  subject: string | null
  sender_name: string | null
  sender_email: string | null
  received_at: string
  gmail_thread_id: string
  email_analysis: Analysis | null
}

function gmailLink(threadId: string) {
  return `https://mail.google.com/mail/u/0/#inbox/${threadId}`
}

function formatDeadline(iso: string | null) {
  if (!iso) return null
  const date = new Date(iso)
  if (isNaN(date.getTime())) return null
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const day =
    date.toDateString() === tomorrow.toDateString()
      ? 'Tomorrow'
      : date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  return `${day} · ${time}`
}

export function ActionCenter({
  emails,
  onMarkDone,
  onSnooze,
  onCorrectPriority,
}: {
  emails: Email[]
  onMarkDone: (emailId: string) => void
  onSnooze: (emailId: string) => void
  onCorrectPriority: (emailId: string, senderEmail: string | null, direction: 'up' | 'down') => void
}) {
  const analyzed = emails
    .map((email) => ({ email, analysis: email.email_analysis }))
    .filter((e): e is { email: Email; analysis: Analysis } => Boolean(e.analysis))
    .map((e) => ({ ...e, effective: getEffectivePriority(e.analysis) }))

  const urgent = analyzed.filter((e) => e.effective === 'urgent')
  const upcoming = analyzed
    .filter((e) => e.effective === 'upcoming')
    .sort((a, b) => (a.analysis.deadline_at ?? '9999').localeCompare(b.analysis.deadline_at ?? '9999'))
  const quiet = analyzed.filter((e) => e.effective === 'low')
  const unanalyzedCount = emails.length - analyzed.length
  const needsAttention = urgent.length + upcoming.length

  return (
    <div className="space-y-10">
      {emails.length === 0 ? (
        <div className="rounded-2xl border border-glass-border bg-glass py-20 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gradient-to-br from-cyan-400/30 to-emerald-400/30 shadow-[0_0_40px_rgba(52,228,193,0.25)]" />
          <p className="font-display text-2xl italic text-ink">Your inbox is waiting.</p>
          <p className="mt-2 text-sm text-ink-soft">Refresh to pull in your latest mail.</p>
        </div>
      ) : needsAttention === 0 ? (
        <div className="rounded-2xl border border-glass-border bg-glass py-16 text-center backdrop-blur-xl">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gradient-to-br from-cyan-400/30 to-emerald-400/30 shadow-[0_0_40px_rgba(52,228,193,0.3)]" />
          <p className="font-display text-2xl italic text-ink">You&apos;re all caught up.</p>
          <p className="mt-2 text-sm text-ink-soft">Nothing needs your attention right now.</p>
        </div>
      ) : null}

      {urgent.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-ink-soft">Needs attention</h3>
            <span className="font-mono text-xs text-ink-faint">
              {urgent.length} item{urgent.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-4">
            {urgent.map(({ email, analysis }) => (
              <div
                key={email.id}
                className="group rounded-2xl border border-urgent/20 bg-glass p-6 shadow-[0_0_40px_rgba(251,113,133,0.08)] backdrop-blur-xl transition-all duration-300 hover:border-urgent/40 hover:shadow-[0_0_50px_rgba(251,113,133,0.15)]"
              >
                <div
                  className="border-l-2 border-urgent pl-5"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(251,113,133,0.4))' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-ink-soft">
                      {email.sender_name ?? email.sender_email}
                    </span>
                    <span className="font-mono text-xs text-ink-faint">
                      {new Date(email.received_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="mt-1.5 text-lg font-medium text-ink">
                    {email.subject ?? '(no subject)'}
                  </p>
                  <p className="mt-1.5 text-sm text-ink-soft">{analysis.summary}</p>

                  {analysis.reasoning && (
                    <div className="mt-4 rounded-xl border border-urgent/20 bg-urgent/[0.06] px-4 py-3">
                      <p className="text-xs font-medium text-urgent">✦ Why this matters</p>
                      <p className="mt-1 text-xs text-ink-soft">{analysis.reasoning}</p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={gmailLink(email.gmail_thread_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-glass-border px-3.5 py-2 text-xs font-medium text-ink transition-all duration-200 hover:border-brand/40 hover:bg-white/[0.04]"
                    >
                      View in Gmail →
                    </a>
                    <button
                      onClick={() => onSnooze(email.id)}
                      className="rounded-lg px-3.5 py-2 text-xs font-medium text-ink-soft transition-all duration-200 hover:bg-white/[0.04] hover:text-ink"
                    >
                      Snooze
                    </button>
                    <button
                      onClick={() => onCorrectPriority(email.id, email.sender_email, 'down')}
                      className="rounded-lg px-3.5 py-2 text-xs font-medium text-ink-soft transition-all duration-200 hover:bg-white/[0.04] hover:text-ink"
                    >
                      Not urgent
                    </button>
                    <button
                      onClick={() => onMarkDone(email.id)}
                      className="rounded-lg px-3.5 py-2 text-xs font-medium text-ink-soft transition-all duration-200 hover:bg-white/[0.04] hover:text-ink"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-ink-soft">Up next</h3>
            <span className="font-mono text-xs text-ink-faint">
              {upcoming.length} item{upcoming.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="divide-y divide-glass-border rounded-2xl border border-glass-border bg-glass backdrop-blur-xl">
            {upcoming.map(({ email, analysis }) => {
              const deadline = formatDeadline(analysis.deadline_at)
              return (
                <div
                  key={email.id}
                  className="flex items-center justify-between gap-3 px-5 py-4 transition-colors duration-200 hover:bg-white/[0.03]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {email.subject ?? '(no subject)'}
                    </p>
                    {deadline && <p className="mt-0.5 font-mono text-xs text-upcoming">{deadline}</p>}
                  </div>
                  <a
                    href={gmailLink(email.gmail_thread_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs font-medium text-brand transition-opacity hover:opacity-70"
                  >
                    View →
                  </a>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {quiet.length > 0 && <QuietSection items={quiet} onCorrectPriority={onCorrectPriority} />}

      {unanalyzedCount > 0 && (
        <p className="text-center text-xs text-ink-faint">
          {unanalyzedCount} synced {unanalyzedCount === 1 ? "email hasn't" : "emails haven't"} been analyzed yet.
        </p>
      )}
    </div>
  )
}

function QuietSection({
  items,
  onCorrectPriority,
}: {
  items: { email: Email; analysis: Analysis }[]
  onCorrectPriority: (emailId: string, senderEmail: string | null, direction: 'up' | 'down') => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section>
      <h3 className="mb-4 text-sm font-medium text-ink-soft">Quiet</h3>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between rounded-2xl border border-glass-border bg-glass px-5 py-4 text-left backdrop-blur-xl transition-all duration-200 hover:border-brand/20 hover:bg-white/[0.03]"
      >
        <div>
          <p className="text-sm font-medium text-ink">{items.length} emails Nudge filtered out</p>
          <p className="text-xs text-ink-soft">Newsletters and low-priority notices</p>
        </div>
        <span
          className="font-mono text-xs text-ink-faint transition-transform duration-200"
          style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}
        >
          →
        </span>
      </button>
      {expanded && (
        <div className="mt-2 divide-y divide-glass-border rounded-2xl border border-glass-border backdrop-blur-xl">
          {items.map(({ email, analysis }) => (
            <div
              key={email.id}
              className="group flex items-center justify-between gap-2 px-5 py-3 text-sm transition-colors hover:bg-white/[0.03]"
            >
              <a
                href={gmailLink(email.gmail_thread_id)}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-ink-soft hover:text-ink"
              >
                {email.subject ?? '(no subject)'}
              </a>
              <button
                onClick={() => onCorrectPriority(email.id, email.sender_email, 'up')}
                className="shrink-0 text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100"
              >
                Mark important
              </button>
              <span className="shrink-0 font-mono text-xs text-ink-faint">{analysis.category}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}