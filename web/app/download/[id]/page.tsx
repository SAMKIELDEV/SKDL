'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AdBanner from '../../components/AdBanner'
import Link from 'next/link'

export default function DownloadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const title = searchParams.get('title') || 'Media'
  const poster = searchParams.get('poster') || ''

  const [counter, setCounter] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [counter])

  const handleGetLink = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/media/${id}`)
      const data = await res.json()
      
      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      // Safe filename construction
      let safeFilename = data.title.replace(/[^a-zA-Z0-9.\- _]/g, '').trim()
      if (data.type === 'series' && data.season && data.episode) {
        safeFilename += ` - S${data.season.toString().padStart(2, '0')}E${data.episode.toString().padStart(2, '0')}`
      }
      safeFilename += ' - SKDL(samkiel.online).mp4'

      const proxyUrl = `/api/proxy?url=${encodeURIComponent(data.url)}&filename=${encodeURIComponent(safeFilename)}&dl=1`
      
      // Redirect to proxy to trigger download
      window.location.href = proxyUrl
    } catch (err) {
      console.error('Download fetch error:', err)
      setError('Failed to generate secure link. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center pt-12 pb-24 px-4 font-sans">
      <div className="w-full max-w-2xl space-y-8 flex flex-col items-center">
        
        {/* Movie Info */}
        <div className="text-center space-y-4">
          {poster && (
            <div className="w-32 h-48 md:w-40 md:h-60 mx-auto rounded-lg overflow-hidden border border-white/10 shadow-2xl">
              <img src={poster} alt={title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest uppercase pb-1">
              DIRECT_DOWNLOAD_SERVER
            </p>
          </div>
        </div>

        {/* Ad Placement */}
        <AdBanner />

        {/* Action / Countdown */}
        <div className="w-full max-w-sm space-y-4">
          {counter > 0 ? (
            <div className="text-center py-6 border border-white/5 bg-white/5 rounded-xl space-y-2">
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Your link is being prepared...</p>
              <p className="text-4xl font-space font-bold text-white">{counter}</p>
            </div>
          ) : (
            <button
              onClick={handleGetLink}
              disabled={loading}
              className="w-full bg-white text-black text-sm font-bold px-6 py-4 rounded-md hover:bg-zinc-200 transition-colors uppercase tracking-widest disabled:opacity-50 disabled:cursor-wait"
            >
              {loading ? 'GENERATING SECURE LINK...' : 'GET DOWNLOAD LINK'}
            </button>
          )}

          {error && (
            <p className="text-red-500 text-xs font-mono text-center pt-2">
              ERROR: {error}
            </p>
          )}

          <Link
            href={`/${id}`}
            className="block text-center text-xs font-mono text-zinc-500 hover:text-white transition-colors"
          >
            ← CANCEL AND GO BACK
          </Link>
        </div>

      </div>
    </main>
  )
}
