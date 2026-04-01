import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return new NextResponse('Missing URL', { status: 400 })
  }

  try {
    const headers = new Headers()
    // Using the exact referer that the MovieBox web app uses
    headers.set('Referer', 'https://h5.aoneroom.com/')
    headers.set('Origin', 'https://h5.aoneroom.com')
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    const response = await fetch(url, { 
      headers,
      method: 'GET',
      // For large video files, we should avoid full buffering
    })

    if (!response.ok) {
        // Log detailed error from CDN if possible for debugging
        const text = await response.text()
        console.error(`Proxy 403 details: ${text.slice(0, 500)}`)
        return new NextResponse(`Proxy error: ${response.status} ${response.statusText}`, { status: response.status })
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'video/mp4',
        'Content-Disposition': 'inline', 
        'Cache-Control': 'no-cache',
        'Accept-Ranges': 'bytes', // Enable seeking if the source supports it
      },
    })
  } catch (err: any) {
    return new NextResponse(`Proxy failed: ${err.message}`, { status: 500 })
  }
}
