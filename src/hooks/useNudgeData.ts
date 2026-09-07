'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getEffectivePriority } from '@/lib/priority'

export type Analysis = {
  category: string
  priority: 'urgent' | 'upcoming' | 'low'
  priority_override: 'urgent' | 'upcoming' | 'low' | null
  deadline_at: string | null
  summary: string | null
  reasoning: string | null
  snoozed_until: string | null
}

export type Email = {
  id: string
  subject: string | null
  sender_name: string | null
  sender_email: string | null
  received_at: string
  gmail_thread_id: string
  message_id: string | null
  email_analysis: Analysis | null
}

const SELECT =
  'id, subject, sender_name, sender_email, received_at, gmail_thread_id, message_id, email_analysis(category, priority, priority_override, deadline_at, summary, reasoning, snoozed_until)'

export function useNudgeData() {
  const [emails, setEmails] = useState<Email[]>([])
  const [syncing, setSyncing] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const supabase = createClient()

  const loadEmails = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: signals } = await supabase
      .from('user_signals')
      .select('email_id')
      .eq('user_id', user.id)
      .eq('action', 'archived')

    const archivedIds = new Set((signals ?? []).map((s) => s.email_id))

    const { data } = await supabase
  .from('emails')
  .select(SELECT)
  .order('received_at', { ascending: false })

const rows = data ?? []
const normalized: Email[] = rows.map((row) => ({
  ...row,
  email_analysis: Array.isArray(row.email_analysis) ? (row.email_analysis[0] ?? null) : row.email_analysis,
}))

const now = new Date()
const visible = normalized.filter((email) => {
      if (archivedIds.has(email.id)) return false
      const snoozedUntil = email.email_analysis?.snoozed_until
      if (snoozedUntil && new Date(snoozedUntil) > now) return false
      return true
    })

    setEmails(visible)
  }, [supabase])

  const loadUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserEmail(user.email ?? '')
    const fullName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? ''
    setFirstName(fullName.split(' ')[0])
    const { data: profile } = await supabase.from('profiles').select('last_synced_at').eq('id', user.id).single()
    setLastSyncedAt(profile?.last_synced_at ?? null)
  }, [supabase])

  useEffect(() => {
    loadUser()
    loadEmails()
  }, [loadUser, loadEmails])

  const handleSync = async () => {
    setSyncing(true)
    await fetch('/api/sync-gmail', { method: 'POST' })
    await loadEmails()
    await loadUser()
    setSyncing(false)
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    const pollInterval = setInterval(loadEmails, 1500)
    try {
      await fetch('/api/analyze-emails', { method: 'POST' })
    } finally {
      clearInterval(pollInterval)
      await loadEmails()
      setAnalyzing(false)
    }
  }

  const handleMarkDone = async (emailId: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== emailId))
    await fetch('/api/mark-done', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId }),
    })
  }

  const handleSnooze = async (emailId: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== emailId))
    await fetch('/api/snooze-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId }),
    })
  }

  const handleCorrectPriority = async (emailId: string, senderEmail: string | null, direction: 'up' | 'down') => {
    setEmails((prev) =>
      prev.map((e) =>
        e.id === emailId && e.email_analysis
          ? { ...e, email_analysis: { ...e.email_analysis, priority_override: direction === 'up' ? 'urgent' : 'low' } }
          : e
      )
    )
    await fetch('/api/correct-priority', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId, senderEmail, direction }),
    })
  }

  const counts = emails.reduce(
    (acc, e) => {
      if (e.email_analysis) acc[getEffectivePriority(e.email_analysis)]++
      return acc
    },
    { urgent: 0, upcoming: 0, low: 0 } as Record<'urgent' | 'upcoming' | 'low', number>
  )
  const needsAttention = counts.urgent + counts.upcoming
  const userInitial = (firstName || userEmail || '?').charAt(0).toUpperCase()

  return {
    emails, syncing, analyzing, userEmail, firstName, userInitial, lastSyncedAt,
    counts, needsAttention,
    handleSync, handleAnalyze, handleMarkDone, handleSnooze, handleCorrectPriority,
  }
}