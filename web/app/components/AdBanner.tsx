'use client'

import { useEffect, useRef, useState } from 'react'

interface AdBannerProps {
  adKey: string;       // unique key per placement to avoid conflicts
  width?: number;
  height?: number;
}

// Simple global cache to avoid multiple components fetching the same settings repeatedly
let cachedSettings: { ads_enabled: boolean } | null = null;
let isFetchingSettings = false;
const subscribers: ((settings: { ads_enabled: boolean }) => void)[] = [];

export default function AdBanner({ adKey, width = 300, height = 250 }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const injected = useRef(false)
  const [adsEnabled, setAdsEnabled] = useState<boolean>(cachedSettings?.ads_enabled ?? false)

  useEffect(() => {
    // If already cached, just use it
    if (cachedSettings) {
      setAdsEnabled(cachedSettings.ads_enabled);
      return;
    }

    // If already fetching, subscribe to the result
    if (isFetchingSettings) {
      subscribers.push((s) => setAdsEnabled(s.ads_enabled));
      return;
    }

    const fetchAdsStatus = async () => {
      isFetchingSettings = true;
      try {
        const res = await fetch('/api/lighthouse/settings')
        if (!res.ok) throw new Error('API failed')
        const data = await res.json()
        
        const enabled = data.ads_enabled === 'true' || data.ads_enabled === 'ON' || data.ads_enabled === true;
        cachedSettings = { ads_enabled: enabled };
        
        setAdsEnabled(enabled);
        subscribers.forEach(sub => sub(cachedSettings!));
        subscribers.length = 0;
      } catch (e) {
        console.error('Failed to fetch ads settings:', e)
        // Fallback to env var if API fails
        const envVal = (process.env.NEXT_PUBLIC_ADS || '').toUpperCase();
        const fallback = envVal === 'ON' || envVal === 'TRUE';
        cachedSettings = { ads_enabled: fallback };
        setAdsEnabled(fallback);
        subscribers.forEach(sub => sub(cachedSettings!));
        subscribers.length = 0;
      } finally {
        isFetchingSettings = false;
      }
    }

    fetchAdsStatus()
  }, [])

  useEffect(() => {
    // Defensive check: only proceed if we have a container, ads are enabled, and NOT already injected
    if (!adsEnabled || !containerRef.current || injected.current) return
    
    const scriptSrc = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_SRC
    if (!scriptSrc) return

    injected.current = true
    const container = containerRef.current

    // Clear any previous content and inject script
    container.innerHTML = ""
    const script = document.createElement("script")
    script.src = scriptSrc
    script.async = true
    script.setAttribute("data-cfasync", "false") // required by Adsterra

    // Append to container
    container.appendChild(script)
    
    // Cleanup function as a safety measure
    return () => {
        // We usually don't want to remove Adsterra scripts as they might leave global state
        // but it's good practice for React components
    }
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
