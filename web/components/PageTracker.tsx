'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Fire and forget pageview tracking
    fetch('/api/track/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer,
        user_agent: navigator.userAgent
      }),
      keepalive: true
    }).catch(err => console.debug('Page tracking failed (expected in some envs):', err))
  }, [pathname])

  return null
}
