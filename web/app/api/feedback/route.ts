import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { type, message, name } = await req.json()

    // Validation
    if (!type || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['bug', 'suggestion', 'general'].includes(type)) {
      return NextResponse.json({ error: 'Invalid feedback type' }, { status: 400 })
    }

    if (message.length > 1000) {
      return NextResponse.json({ error: 'Message too long (max 1000 chars)' }, { status: 400 })
    }

    // Insert into Supabase
    const { error } = await supabase
      .from('feedback')
      .insert([
        {
          type,
          message,
          name: name?.trim() || null,
        }
      ])

    if (error) {
      console.error('Feedback insert error:', error)
      return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('API Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
