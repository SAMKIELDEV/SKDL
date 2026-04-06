import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { media_id, title, media_type, format } = await req.json()

    const { error } = await supabase
      .from('download_events')
      .insert({
        media_id,
        title,
        media_type,
        format
      })

    if (error) {
      console.error('Error tracking download:', error)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Track download exception:', err)
    return NextResponse.json({ ok: true }) // Silent fail
  }
}
