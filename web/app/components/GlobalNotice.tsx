'use client'

import { useState, useEffect } from 'react'
import { Info, X } from 'lucide-react'

// Simple global cache to avoid multiple components fetching the same settings
let cachedNotice: string | null = null;
let isFetchingNotice = false;
const noticeSubscribers: ((notice: string | null) => void)[] = [];

export default function GlobalNotice() {
  const [notice, setNotice] = useState<string | null>(cachedNotice)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (cachedNotice !== null) {
      setNotice(cachedNotice);
      return;
    }

    if (isFetchingNotice) {
      noticeSubscribers.push((n) => setNotice(n));
      return;
    }

    const fetchNotice = async () => {
      isFetchingNotice = true;
      try {
        const res = await fetch('/api/lighthouse/settings')
        if (!res.ok) throw new Error('API failed')
        const data = await res.json()
        
        cachedNotice = data.app_notice || ""; // use empty string to indicate "fetched but empty"
        setNotice(data.app_notice || null);
        
        noticeSubscribers.forEach(sub => sub(data.app_notice || null));
        noticeSubscribers.length = 0;
      } catch (e) {
        console.error('Failed to fetch global notice:', e)
      } finally {
        isFetchingNotice = false;
      }
    }
    fetchNotice()
  }, [])

  if (!notice || !isVisible) return null

  return (
    <div className="w-full bg-white text-black font-mono text-[10px] py-2 px-4 flex items-center justify-between uppercase tracking-widest font-bold">
      <div className="flex items-center gap-2">
        <Info className="w-3 h-3" />
        <span>NOTICE // {notice}</span>
      </div>
      <button onClick={() => setIsVisible(false)} className="hover:opacity-50 transition-opacity">
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}
