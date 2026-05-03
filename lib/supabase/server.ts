import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client for server-side usage.
 * Note: This is a simplified version without cookie management.
 * For full SSR support with session persistence, use @supabase/ssr.
 */
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
