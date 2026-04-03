'use client'

import { usePathname } from 'next/navigation'

export default function ConditionalHeader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLighthouse = pathname?.startsWith('/lighthouse')
  
  if (isLighthouse) return null
  
  return <>{children}</>
}
