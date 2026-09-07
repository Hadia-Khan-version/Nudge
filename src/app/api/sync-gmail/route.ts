import { createClient } from '@/lib/supabase/server'
import { fetchRecentEmails } from '@/lib/gmail'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('gmail_refresh_token')
    .eq('id', user.id)
    .single()

  if (!profile?.gmail_refresh_token) {
    return NextResponse.json({ error: 'No Gmail access — sign out and back in' }, { status: 400 })
  }

  const emails = await fetchRecentEmails(profile.gmail_refresh_token)

  const { error: insertError } = await supabase
  .from('emails')
  .upsert(
    emails.map((e) => ({ ...e, user_id: user.id })),
    { onConflict: 'user_id,gmail_message_id', ignoreDuplicates: false }
  )

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  await supabase.from('profiles').update({ last_synced_at: new Date().toISOString() }).eq('id', user.id)

  return NextResponse.json({ synced: emails.length })
}