import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { emailId } = await request.json()
  if (!emailId) {
    return NextResponse.json({ error: 'Missing emailId' }, { status: 400 })
  }

  const snoozedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('email_analysis')
    .update({ snoozed_until: snoozedUntil })
    .eq('email_id', emailId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, snoozedUntil })
}