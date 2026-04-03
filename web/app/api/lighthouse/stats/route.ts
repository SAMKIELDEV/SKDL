import { NextResponse } from 'next/server'
import { getDashboardStats, getBotAnalytics } from '@/lib/admin-data'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('lighthouse_auth')
  
  if (!auth || auth.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dashboardStats = await getDashboardStats()
    const botStats = await getBotAnalytics()
    
    return NextResponse.json({
      ...dashboardStats,
      ...botStats
    })
  } catch (error) {
    console.error('API Error /api/lighthouse/stats:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
