// app/dashboard/page.tsx
import React from "react";
import { normalizeLekcje, type LekcjaRaw, type LekcjaRow } from "@/lib/normalizeLekcje";
import { getDzisiejszeLekcje } from "@/lib/lekcje";

// ------------------------
// Dynamiczny import Table z fallbackami (działa niezależnie od ścieżki/nazwy)
// ------------------------
async function resolveTable(): Promise<React.ComponentType<{ rows: LekcjaRow[] }>> {
  const tryPaths = [
    "@/components/table",
    "@/components/Table",
    "@/components/ui/table",
    "@/components/ui/Table",
  ] as const;

  for (const p of tryPaths) {
    try {
      // @ts-ignore – dynamiczna ścieżka
      const mod = await import(p);
      const TableComp =
        (mod && (mod.default || (mod.Table as any))) as React.ComponentType<{ rows: LekcjaRow[] }>;
      if (TableComp) return TableComp;
    } catch {
      // kolejny wariant
    }
  }

  // Minimalny fallback, żeby build nie padł, nawet jeśli nie ma komponentu Table
  return (({ rows }) => (
    <pre style={{ whiteSpace: "pre-wrap" }}>
      {`[Brak komponentu Table – dodaj go do components/table.tsx lub components/ui/table.tsx]
Wiersze (podgląd):\n${JSON.stringify(rows, null, 2)}`}
    </pre>
  )) as React.ComponentType<{ rows: LekcjaRow[] }>;
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const Table = await resolveTable();

  // 1) Pobierz surowe rekordy (teraz: stub z lib/lekcje.ts)
  const lekcjeRaw: LekcjaRaw[] | null = await getDzisiejszeLekcje();

  // 2) Znormalizuj do płaskich wierszy dla Table
  const rows: LekcjaRow[] = normalizeLekcje(lekcjeRaw);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Panel</h1>

      <section className="mb-8">
        <h2 className="font-semibold mb-2">Dzisiejsze lekcje</h2>
        <Table rows={rows} />
      </section>
    </main>
  );
}
