// lib/supabase-server.ts
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export function createServerClient() {
  // Używamy tych samych helperów co middleware i /auth/callback,
  // dzięki czemu SSR dostaje tę samą sesję (ciasteczka).
  return createServerComponentClient({ cookies });
}

export async function getCurrentUserWithRole() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  return { user, role: profile?.role ?? "uczen", full_name: profile?.full_name ?? null };
}

export async function getCurrentUserWithRole() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('rola, id_szkola, id_nauczyciel, id_uczen')
    .eq('id', user.id)
    .single();

  return { id: user.id, ...profile };
}

