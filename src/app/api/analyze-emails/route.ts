import { createClient } from '@/lib/supabase/server'
import { triageEmail } from '@/lib/gemini'
import { runWithConcurrencyLimit } from '@/lib/concurrency'
import { NextResponse } from 'next/server'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: emails } = await supabase
    .from('emails')
    .select('id, subject, sender_name, sender_email, snippet, received_at')
    .eq('user_id', user.id)

  const { data: alreadyAnalyzed } = await supabase.from('email_analysis').select('email_id')
  const { data: prefs } = await supabase
    .from('sender_preferences')
    .select('sender_email, important_count, unimportant_count')
    .eq('user_id', user.id)

  const prefMap = new Map((prefs ?? []).map((p) => [p.sender_email, p]))
  const analyzedIds = new Set((alreadyAnalyzed ?? []).map((a) => a.email_id))
  const pending = (emails ?? []).filter((e) => !analyzedIds.has(e.id))

  const errors: string[] = []

  const tasks = pending.map((email) => async () => {
    const pref = email.sender_email ? prefMap.get(email.sender_email) : undefined
    const preference = pref ? { importantCount: pref.important_count, unimportantCount: pref.unimportant_count } : undefined

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await triageEmail(email, preference)

        await supabase.from('email_analysis').insert({
          email_id: email.id,
          category: result.category,
          priority: result.priority,
          deadline_at: result.deadline_at,
          summary: result.summary,
          reasoning: result.reasoning,
          model_used: 'gemini-3.5-flash-lite',
        })
        return
      } catch (err) {
        const message = err instanceof Error ? err.message : 'unknown error'
        const isRateLimit = message.includes('429') || message.toLowerCase().includes('rate limit')

        if (isRateLimit && attempt === 0) {
          await sleep(5000) // back off and retry once
          continue
        }
        errors.push(`${email.id}: ${message}`)
        return
      }
    }
  })

  await runWithConcurrencyLimit(tasks, 3)

  return NextResponse.json({ analyzed: pending.length - errors.length, total: pending.length, errors })
}