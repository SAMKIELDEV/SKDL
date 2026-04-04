import { createClient } from '@supabase/supabase-js'

let cachedClient: ReturnType<typeof createClient> | null = null

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are missing.')
  }

  return { supabaseUrl, supabaseKey }
}

export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PHASE) {
        throw new Error('Supabase environment variables are missing.')
    }
    // Return a dummy client or throw during action if needed
    // During build or dev without vars, we might not want to crash everything
    return createClient(supabaseUrl || 'http://localhost', supabaseKey || 'placeholder')
  }

  if (cachedClient) return cachedClient
  cachedClient = createClient(supabaseUrl, supabaseKey)
  return cachedClient
}

// Still export a default one for legacy imports, but it's now safer
export const supabase = createClient(
  process.env.SUPABASE_URL || 'http://localhost',
  process.env.SUPABASE_KEY || 'placeholder'
)
