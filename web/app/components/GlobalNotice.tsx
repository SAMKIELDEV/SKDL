'use client'

import { useState, useEffect } from 'react'
import { Info, X } from 'lucide-react'

export default function GlobalNotice() {
  const [notice, setNotice] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await fetch('/api/lighthouse/settings')
        const data = await res.json()
        if (data.app_notice) {
          setNotice(data.app_notice)
        }
      } catch (e) {
        console.error('Failed to fetch global notice:', e)
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
