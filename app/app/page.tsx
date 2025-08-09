import { createServerClient } from "@/lib/supabase-server";

export default async function AppHome() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">
          Dzień dobry{user?.email ? `, ${user.email}` : ""}! 👋
        </h1>
        <form action="/auth/signout" method="post">
          <button className="rounded-md border px-4 py-2 hover:bg-gray-50" type="submit">
            Wyloguj
          </button>
        </form>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <a href="/app/students" className="rounded-lg border p-4 hover:bg-gray-50">👨‍🎓 Uczniowie</a>
        <a href="/app/grades" className="rounded-lg border p-4 hover:bg-gray-50">📝 Oceny</a>
      </section>
    </main>
  );
}
