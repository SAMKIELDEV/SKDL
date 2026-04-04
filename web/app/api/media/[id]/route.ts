import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
import { getFreshCdnUrl } from '@/lib/moviebox'

interface MediaRow {
  id: string
  title: string
  cdn_url: string
  type: 'movie' | 'series'
  quality: string
  season: number | null
  episode: number | null
  subject_id?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = (await params) as { id: string }
  
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    const row = data as MediaRow
    let finalUrl = row.cdn_url

    if (row.subject_id) {
      try {
        finalUrl = await getFreshCdnUrl(
          row.subject_id,
          row.type,
          row.season || 0,
          row.episode || 0
        )
      } catch (e) {
        console.error('Failed to refresh CDN URL for download page:', e)
        // fallback to row.cdn_url
      }
    }

    return NextResponse.json({ 
      url: finalUrl,
      title: row.title,
      type: row.type,
      season: row.season,
      episode: row.episode
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
