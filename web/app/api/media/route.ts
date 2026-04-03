import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { getFreshCdnUrl } from '@/lib/moviebox'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    let finalUrl = data.cdn_url

    if (data.subject_id) {
      try {
        finalUrl = await getFreshCdnUrl(
          data.subject_id,
          data.type,
          data.season || 0,
          data.episode || 0
        )
      } catch (e) {
        console.error('Failed to refresh CDN URL for download page:', e)
        // fallback to data.cdn_url
      }
    }

    return NextResponse.json({ 
      url: finalUrl,
      title: data.title,
      type: data.type,
      season: data.season,
      episode: data.episode
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
