import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return new NextResponse('Missing URL', { status: 400 })
  }

  try {
    const headers = new Headers()
    headers.set('Referer', 'https://h5.aoneroom.com/')
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    const response = await fetch(url, { headers })

    if (!response.ok) {
      return new NextResponse(`Proxy error: ${response.status} ${response.statusText}`, { status: response.status })
    }

    // Stream the response back to the client
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'video/mp4',
        'Content-Disposition': 'inline', // Attempt to play in browser
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err: any) {
    return new NextResponse(`Proxy failed: ${err.message}`, { status: 500 })
  }
}
