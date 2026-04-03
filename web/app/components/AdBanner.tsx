'use client'

import { useEffect, useRef, useState } from 'react'

interface AdBannerProps {
  adKey: string;       // unique key per placement to avoid conflicts
  width?: number;
  height?: number;
}

export default function AdBanner({ adKey, width = 300, height = 250 }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const injected = useRef(false)
  const [adsEnabled, setAdsEnabled] = useState(false)

  useEffect(() => {
    const fetchAdsStatus = async () => {
      try {
        const res = await fetch('/api/lighthouse/settings')
        const data = await res.json()
        if (data.ads_enabled !== undefined) {
          setAdsEnabled(data.ads_enabled === 'true')
        }
      } catch (e) {
        console.error('Failed to fetch ads settings:', e)
        // Fallback to env var if API fails
        setAdsEnabled(process.env.NEXT_PUBLIC_ADS === 'ON')
      }
    }
    fetchAdsStatus()
  }, [])

  useEffect(() => {
    // Prevent double injection (React StrictMode)
    if (injected.current || !containerRef.current || !adsEnabled) return
    
    const container = containerRef.current
    const scriptSrc = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_SRC

    if (!scriptSrc) return
    injected.current = true

    // Clear any previous content
    container.innerHTML = ""

    // Create and append script element properly — innerHTML won't execute scripts
    const script = document.createElement("script")
    script.src = scriptSrc
    script.async = true
    script.setAttribute("data-cfasync", "false") // required by Adsterra

    container.appendChild(script)
  }, [adsEnabled])

  if (!adsEnabled) return null

  return (
    <div className="flex flex-col items-center gap-1 my-4">
      <div
        style={{ minWidth: width, minHeight: height, display: "flex", justifyContent: "center" }}
        aria-hidden="true"
      >
        <div ref={containerRef} id={`ad-container-${adKey}`} />
      </div>
      <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
        Ad helps keep this site free
      </p>
    </div>
  )
}
