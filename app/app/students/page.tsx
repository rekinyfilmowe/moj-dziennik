import Link from "next/link";
import { createServerClient } from "../../lib/supabase-server"; // Uwaga: ścieżka względna!

export default async function StudentsPage() {
  const supabase = createServerClient();
  const { data: students, error } = await supabase
    .from("students")
    .select("id, first_name, last_name")
    .order("id", { ascending: false });

  if (error) {
    // przy RLS bez created_by zwróci błąd
    console.error(error);
  }

  return (
    <main className="p-6">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Uczniowie</h1>
        <Link href="/app/students/new" className="rounded-md border px-3 py-2 hover:bg-gray-50">
          + Dodaj ucznia
        </Link>
      </header>

      {!students?.length ? (
        <p className="text-gray-600">Brak uczniów. Dodaj pierwszego 🙂</p>
      ) : (
        <ul className="divide-y rounded-lg border bg-white">
          {students.map((s) => (
            <li key={s.id} className="p-3 flex items-center justify-between">
              <span>{s.first_name} {s.last_name}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
