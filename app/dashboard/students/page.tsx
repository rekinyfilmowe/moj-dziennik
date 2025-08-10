// app/dashboard/students/page.tsx
import Link from "next/link";
import { createServerClient, getCurrentUserWithRole } from "../../../lib/supabase-server";
import { revalidatePath } from "next/cache";

type Role = "uczen" | "nauczyciel" | "admin" | string;

// Dopuszczamy oba spotykane kształty `me`:
type Me =
  | { user?: { id?: string | number | null } | null; role?: Role; id?: string | number | null }
  | null;

export default async function StudentsPage() {
  const supabase = createServerClient();

  // może zwrócić { user, role } lub { id, role, ... } – typujemy elastycznie
  const me = (await getCurrentUserWithRole()) as Me;

  // Ujednolicamy identyfikator użytkownika do stringa
  const meId = me && (me as any)?.user?.id != null ? (me as any).user.id : (me as any)?.id ?? null;
  const meIdStr = meId == null ? "" : String(meId);
  const meRole = (me as any)?.role as Role | undefined;

  const { data: students, error } = await supabase
    .from("students")
    .select("id, first_name, last_name, created_by")
    .order("id", { ascending: false });

  async function onDelete(id: number) {
    "use server";
    const s = createServerClient();
    await s.from("students").delete().eq("id", id);
    revalidatePath("/dashboard/students");
  }

  return (
    <main className="p-6 max-w-2xl space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Uczniowie</h1>
        <Link href="/dashboard/students/new" className="border rounded px-3 py-2">
          + Nowy
        </Link>
      </header>

      {error && <p className="text-red-600">{error.message}</p>}

      {!students?.length ? (
        <p>Brak uczniów.</p>
      ) : (
        <ul className="divide-y rounded border bg-white">
          {students.map((s) => {
            // Porównujemy po stringach, bo created_by może być number/uuid
            const createdByStr = s?.created_by == null ? "" : String(s.created_by);

            const canEdit =
              meRole === "nauczyciel" ||
              meRole === "admin" ||
              meIdStr !== "" && meIdStr === createdByStr;

            return (
              <li key={s.id} className="p-3 flex items-center justify-between gap-3">
                <span>
                  {s.first_name} {s.last_name}
                </span>
                {canEdit && (
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/students/${s.id}/edit`} className="text-sm underline">
                      Edytuj
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await onDelete(s.id);
                      }}
                    >
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
