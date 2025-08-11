'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login'); // przekierowanie na stronę logowania
  };

  return (
    <header className="h-14 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="h-full px-4 flex items-center gap-3">
        <input
          aria-label="Szukaj"
          placeholder="Szukaj..."
          className="w-full max-w-md px-3 py-2 rounded-md border bg-background"
        />
        <button className="px-3 py-2 rounded-md border">Nowa notatka</button>
        <button className="px-3 py-2 rounded-md border" aria-label="Ustawienia">
          ⚙️
        </button>
        <div className="size-8 rounded-full bg-muted border" aria-hidden />

        {/* Przycisk wylogowania */}
        <button
          onClick={handleSignOut}
          className="px-3 py-2 rounded-md border bg-red-500 text-white hover:bg-red-600"
        >
          Wyloguj
        </button>
      </div>
    </header>
  );
}
