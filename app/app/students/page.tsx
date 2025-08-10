// app/app/students/page.tsx
import Link from "next/link";
import { createServerClient, getCurrentUserWithRole } from "../../../lib/supabase-server";
import { revalidatePath } from "next/cache";

export default async function StudentsPage() {
  const supabase = createServerClient();
  const me = await getCurrentUserWithRole(); // { user, role }

  console.log("SSR user check:", me);

  const { data: students, error } = await supabase
    .from("students")
    .select("id, first_name, last_name, created_by")
    .order("id", { ascending: false });

  async function onDelete(id: number) {
    "use server";
    const s = createServerClient();
    await s.from("students").delete().eq("id", id);
    revalidatePath("/app/students");
  }

  return (
    <main className="p-6 max-w-2xl space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Uczniowie</h1>
        <Link href="/app/students/new" className="border rounded px-3 py-2">+ Nowy</Link>
      </header>

      {error && <p className="text-red-600">{error.message}</p>}

      {!students?.length ? (
        <p>Brak uczniów.</p>
      ) : (
        <ul className="divide-y rounded border bg-white">
          {students.map((s) => {
            const canEdit =
              me?.role === "nauczyciel" || me?.role === "admin" || me?.user?.id === s.created_by;

            return (
              <li key={s.id} className="p-3 flex items-center justify-between gap-3">
                <span>{s.first_name} {s.last_name}</span>
                {canEdit && (
                  <div className="flex items-center gap-2">
                    <Link href={`/app/students/${s.id}/edit`} className="text-sm underline">Edytuj</Link>
                    <form action={async () => { "use server"; await onDelete(s.id); }}>
                      <button className="text-sm text-red-600 underline">Usuń</button>
                    </form>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
