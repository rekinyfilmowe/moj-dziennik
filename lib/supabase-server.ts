import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export function createServerClient() {
  return createServerComponentClient({ cookies });
}

export async function getCurrentUserWithRole() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('rola, id_szkola, id_nauczyciel, id_uczen, full_name')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    role: profile?.rola ?? 'uczen',       // <-- klucz 'role'
    id_szkola: profile?.id_szkola ?? null,
    id_nauczyciel: profile?.id_nauczyciel ?? null,
    id_uczen: profile?.id_uczen ?? null,
    full_name: profile?.full_name ?? null,
  };
}
