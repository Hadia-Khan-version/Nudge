import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { emailId, senderEmail, direction } = await request.json()
  if (!emailId || !direction) {
    return NextResponse.json({ error: 'Missing emailId or direction' }, { status: 400 })
  }

  const newPriority = direction === 'up' ? 'urgent' : 'low'

  const { error: updateError } = await supabase
    .from('email_analysis')
    .update({ priority_override: newPriority })
    .eq('email_id', emailId)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  await supabase.from('user_signals').insert({
    user_id: user.id,
    email_id: emailId,
    action: direction === 'up' ? 'corrected_up' : 'corrected_down',
  })

  if (senderEmail) {
    const { data: existing } = await supabase
      .from('sender_preferences')
      .select('important_count, unimportant_count')
      .eq('user_id', user.id)
      .eq('sender_email', senderEmail)
      .single()

    await supabase.from('sender_preferences').upsert({
      user_id: user.id,
      sender_email: senderEmail,
      important_count: (existing?.important_count ?? 0) + (direction === 'up' ? 1 : 0),
      unimportant_count: (existing?.unimportant_count ?? 0) + (direction === 'down' ? 1 : 0),
      updated_at: new Date().toISOString(),
    })
  }

  return NextResponse.json({ ok: true, newPriority })
}