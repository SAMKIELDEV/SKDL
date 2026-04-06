import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { path, referrer, user_agent } = await req.json()
    
    // Extract country from Cloudflare/Railway headers
    const country = req.headers.get('cf-ipcountry') || req.headers.get('x-forwarded-for')?.split(',')[0] || 'Unknown'

    const { error } = await supabase
      .from('page_views')
      .insert({
        path,
        referrer,
        user_agent,
        country
      })

    if (error) {
      console.error('Error tracking pageview:', error)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Track pageview exception:', err)
    return NextResponse.json({ ok: true }) // Silent fail
  }
}
