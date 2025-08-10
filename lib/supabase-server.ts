// lib/supabase-server.ts
import { cookies } from 'next/headers'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'

export function createServerClient() {
  const cookieStore = cookies()

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // Na serwerze (SSR) zazwyczaj nie ustawiamy/nie usuwamy ciastek — ale metody muszą istnieć
        set() {},
        remove() {},
      },
    }
  )
}

export async function getCurrentUserWithRole() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  return { user, role: profile?.role ?? 'uczen', full_name: profile?.full_name ?? null }
}
