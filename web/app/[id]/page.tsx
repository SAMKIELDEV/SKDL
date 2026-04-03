import { notFound } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { getFreshCdnUrl } from '@/lib/moviebox'

interface MediaRow {
  id: string
  title: string
  cdn_url: string
  type: 'movie' | 'series'
  quality: string
  season: number | null
  episode: number | null
  expires_at: string
  subject_id?: string
}

function ExpiredPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-4xl mb-4">⏳</div>
        <h1 className="text-xl font-semibold text-white mb-2">{title}</h1>
        <p className="text-gray-400 mb-6">This download link has expired.</p>
        <a
          href="https://t.me/SK_DLBOT"
          className="inline-block bg-white text-black font-medium px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Request again on Telegram
        </a>
      </div>
    </div>
  )
}

function mediaMetaLine(row: MediaRow): string {
  const bits: string[] = []
  bits.push(row.type === 'series' ? 'Series' : 'Movie')
  if (row.type === 'series' && row.season && row.episode) {
    bits.push(`S${row.season}E${row.episode}`)
  }
  if (row.quality) {
    bits.push(row.quality)
  }
  return bits.join(' • ')
}

function PlayerPage({ row, proxyUrl }: { row: MediaRow; proxyUrl: string }) {
  return (
    <main className="min-h-screen bg-[#0b1014] text-white px-4 py-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-[#0d1e22] via-[#12131b] to-[#1c1410] p-4 md:p-7">
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-teal-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-52 w-52 rounded-full bg-orange-400/10 blur-3xl" />

          <div className="relative z-10 mb-5 md:mb-7">
            <p className="text-[11px] uppercase tracking-[0.24em] text-teal-200/80">SKDL Private Screening</p>
            <h1 className="mt-2 text-2xl md:text-4xl font-bold text-white font-serif">
              {row.title}
            </h1>
            <p className="mt-2 text-sm md:text-base text-zinc-300">{mediaMetaLine(row)}</p>
          </div>

          <div className="relative z-10 overflow-hidden rounded-xl border border-white/15 bg-black/50 shadow-[0_15px_40px_rgba(0,0,0,0.35)]">
            <video
              controls
              preload="metadata"
              playsInline
              className="w-full aspect-video bg-black"
              src={proxyUrl}
            >
              Your browser does not support HTML5 video playback.
            </video>
          </div>

          <div className="relative z-10 mt-5 flex flex-wrap gap-3">
            <a
              href={proxyUrl}
              download
              className="inline-flex items-center rounded-lg bg-teal-400 px-5 py-2.5 text-sm font-semibold text-[#072227] hover:bg-teal-300"
            >
              Download File
            </a>
            <a
              href="https://t.me/SK_DLBOT"
              className="inline-flex items-center rounded-lg border border-zinc-500/60 bg-zinc-900/60 px-5 py-2.5 text-sm font-medium text-zinc-100 hover:bg-zinc-800"
            >
              Request Another on Telegram
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

export const dynamic = 'force-dynamic'

export default async function LinkPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let supabase
  try {
    supabase = getSupabaseClient()
  } catch (e) {
    console.error('Supabase client init failed:', e)
    notFound()
  }
  
  console.log('--- Redirecting Link:', id)

  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Supabase Error for id:', id, error)
  }
  
  if (!data) {
    console.log('Record not found in DB for id:', id)
    notFound()
  }

  const row = data as MediaRow
  const expiresAt = new Date(row.expires_at)
  const now = new Date()

  if (expiresAt < now) {
    return <ExpiredPage title={row.title} />
  }

  let finalUrl = row.cdn_url

  // If we have a subject_id, get a fresh IP-bound link for the current requester
  if (row.subject_id) {
    try {
      finalUrl = await getFreshCdnUrl(
        row.subject_id,
        row.type,
        row.season || 0,
        row.episode || 0
      )
    } catch (e) {
      console.error('Failed to refresh CDN URL, falling back to original:', e)
    }
  }

  const proxyUrl = `/api/proxy?url=${encodeURIComponent(finalUrl)}`

  return <PlayerPage row={row} proxyUrl={proxyUrl} />
}
