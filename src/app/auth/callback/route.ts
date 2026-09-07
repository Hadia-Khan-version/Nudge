import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const { user, provider_refresh_token } = data.session

      // Upsert the profile row, saving the Gmail refresh token if Google gave us one
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email!,
        ...(provider_refresh_token ? { gmail_refresh_token: provider_refresh_token } : {}),
      })
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}