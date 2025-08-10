// app/app/page.tsx
import Link from "next/link";
import { getCurrentUserWithRole } from "../../lib/supabase-server";

export default async function AppHome() {
  const me = await getCurrentUserWithRole();

  return (
    <main className="p-6 space-y-4">
      <header className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Panel</h1>
        {me && (
          <span className="rounded-full border px-2 py-1 text-xs">
            Rola: {me.role}
          </span>
        )}
        <form action="/auth/signout" method="post" className="ml-auto">
          <button className="border rounded px-3 py-1">Wyloguj</button>
        </form>
      </header>

      <Link href="/app/students" className="underline">Uczniowie</Link>
    </main>
  );
}
