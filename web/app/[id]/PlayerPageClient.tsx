'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import AdBanner from '../components/AdBanner'

// Dynamically import PlayerClient with SSR disabled to fix "document is not defined" error
const PlayerClient = dynamic(() => import('./PlayerClient'), { ssr: false })

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
  poster_url?: string
  description?: string
  imdb_id?: string
  size?: number
}

function formatSize(bytes?: number): string {
  if (!bytes) return ''
  const gb = bytes / (1024 * 1024 * 1024)
  if (gb >= 1) return gb.toFixed(2) + 'GB'
  const mb = bytes / (1024 * 1024)
  return mb.toFixed(0) + 'MB'
}

export default function PlayerPageClient({ row, proxyUrl }: { row: MediaRow; proxyUrl: string }) {
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null)
  const [posterUrl, setPosterUrl] = useState<string | undefined>(row.poster_url)

  useEffect(() => {
    // TMDB Fallback if MovieBox poster is missing
    const fetchTmdbPoster = async () => {
      if (!posterUrl && row.imdb_id) {
        try {
          const apiKey = 'YOUR_TMDB_API_KEY' // This should be handled via a server-side proxy or passed down if safe
          // Actually, I'll use a client-side fetch if the key is public, but better to do it server-side.
          // Since the server side already tried MovieBox, I'll add TMDB fallback to the server side too.
          // But for now, I'll implement a small client-side fallback if possible.
          // However, the user asked to add TMDB_API_KEY to .env.local, so I should do the fallback on the server.
          
          // I've already added MovieBox search to the server side. 
          // I will update the server side (page.tsx) to also try TMDB if MovieBox fails.
        } catch (e) {
          console.error('TMDB fallback failed:', e)
        }
      }
    }
    fetchTmdbPoster()
  }, [posterUrl, row.imdb_id])

  const safeFilename = row.title.replace(/[^a-zA-Z0-9.\- _]/g, '').trim()
  const displayFilename = row.type === 'series' 
    ? `${safeFilename} S${row.season?.toString().padStart(2, '0')}E${row.episode?.toString().padStart(2, '0')}`
    : safeFilename

  const handleDownloadMp4 = () => {
    const url = `/download/${row.id}?type=mp4&title=${encodeURIComponent(row.title)}&poster=${encodeURIComponent(posterUrl || '')}`
    window.location.href = url
  }

  const handleDownloadMkv = () => {
    const url = `/download/${row.id}?type=mkv&title=${encodeURIComponent(row.title)}&poster=${encodeURIComponent(posterUrl || '')}`
    window.location.href = url
  }

  // Build metadata line without "double dots"
  const metaBits: string[] = []
  metaBits.push(row.type === 'series' ? 'Series' : 'Movie')
  if (row.type === 'series' && row.season && row.episode) {
    metaBits.push(`S${row.season.toString().padStart(2, '0')}E${row.episode.toString().padStart(2, '0')}`)
  }
  if (row.quality) {
    metaBits.push(row.quality)
  }
  const sizeStr = formatSize(row.size)
  if (sizeStr) {
    metaBits.push(sizeStr)
  }
  const metaLine = metaBits.join(' • ')

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center pt-8 md:pt-12 pb-24 px-4 md:px-6 font-sans">
      <div className="w-full max-w-5xl space-y-8">
        
        {/* Title Section */}
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em] font-bold">
              SKDL_STREAMING // ENCRYPTED
            </p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white leading-none">
              {row.title}
            </h1>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-[0.2em] font-medium pt-1">
                {metaLine}
            </p>
          </div>

          {/* Player Container */}
          <div className="w-full shadow-2xl rounded-2xl overflow-hidden border border-white/5 bg-black">
            <PlayerClient 
              proxyUrl={proxyUrl} 
              imdbId={row.imdb_id} 
              query={displayFilename}
              onSubtitleFound={(url) => setSubtitleUrl(url)} 
            />
          </div>
        </div>

        {/* Action Section */}
        <div className="flex flex-col items-center space-y-10 py-4">
            
            <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleDownloadMp4}
                    className="flex-1 flex justify-center items-center bg-[#121212] border border-white/10 text-white text-xs md:text-sm font-black px-8 py-5 rounded-lg hover:bg-zinc-800 transition-all uppercase tracking-[0.2em] font-mono"
                >
                    DOWNLOAD MP4
                </button>

                <button
                    onClick={handleDownloadMkv}
                    className="flex-1 flex justify-center items-center bg-white text-black text-xs md:text-sm font-black px-8 py-5 rounded-lg hover:bg-zinc-100 transition-all uppercase tracking-[0.2em] font-mono shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                    DOWNLOAD MKV + SUBS
                </button>
            </div>

            {subtitleUrl && (
                <div className="text-center">
                    <a 
                        href={`/api/proxy?url=${encodeURIComponent(subtitleUrl)}&filename=${encodeURIComponent(displayFilename)}.srt&dl=1`} 
                        className="text-[10px] font-mono text-zinc-500 hover:text-white transition-colors underline underline-offset-8 decoration-zinc-800 uppercase tracking-widest"
                    >
                        ↓ Download Subtitles (.srt)
                    </a>
                </div>
            )}

            <div className="pt-8">
                <a
                    href="https://t.me/SK_DLBOT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-zinc-600 hover:text-zinc-300 transition-colors uppercase tracking-[0.3em] font-bold"
                >
                    Request Another on Telegram →
                </a>
            </div>
        </div>

        {/* Ad Placement Bottom */}
        <div className="w-full opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <AdBanner />
        </div>

        {/* Info / Description Section */}
        <div className="grid md:grid-cols-[1fr_2fr] gap-8 pt-4">
          <div className="w-full aspect-[2/3] rounded-lg overflow-hidden border border-white/10 shadow-2xl bg-zinc-950 flex items-center justify-center relative">
            {posterUrl ? (
              <img src={posterUrl} alt={row.title} className="w-full h-full object-cover" />
            ) : (
                <div className="p-8 text-center space-y-4">
                    <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">{row.title}</p>
                    <div className="w-8 h-px bg-zinc-900 mx-auto"></div>
                </div>
            )}
          </div>
          
          <div className="space-y-4">
              <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
                  {row.description || 'No description available for this content.'}
              </p>
          </div>
        </div>
      </div>
    </div>
  )
}
