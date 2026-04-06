'use client'

import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'

export default function RelativeTime({ date }: { date: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span className="opacity-0">{date}</span>
  }

  return <span>{formatDistanceToNow(new Date(date), { addSuffix: true })}</span>
}
