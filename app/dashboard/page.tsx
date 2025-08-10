// app/dashboard/page.tsx
import React from "react";
import { normalizeLekcje, type LekcjaRaw, type LekcjaRow } from "@/lib/normalizeLekcje";

// ------------------------
// 1) Dynamiczny import Table z fallbackami (różne ścieżki i nazwy eksportów)
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
      // @ts-ignore – dynamiczna ścieżka, TS tego nie zrozumie, ale runtime tak
      const mod = await import(p);
      const TableComp =
        (mod && (mod.default || (mod.Table as any))) as React.ComponentType<{ rows: LekcjaRow[] }>;
      if (TableComp) return TableComp;
    } catch {
      // próbujemy kolejny wariant
    }
  }

  // Jeśli nic nie znaleziono, podrzucamy minimalny fallback, żeby build nie padł
  return (({ rows }) => (
    <pre style={{ whiteSpace: "pre-wrap" }}>
      {`[Brak komponentu Table – wrzuć go do components/table.tsx lub components/ui/table.tsx]
Wiersze (podgląd):\n${JSON.stringify(rows, null, 2)}`}
    </pre>
  )) as React.ComponentType<{ rows: LekcjaRow[] }>;
}

// ------------------------
// 2) Pobranie dzisiejszych lekcji – miękki import Twojej funkcji, fallback = []
// ------------------------
async function getDzisiejszeLekcje(): Promise<LekcjaRaw[] | null> {
  try {
    const mod = await import("@/lib/lekcje").catch(() => null);
    if (mod?.getDzisiejszeLekcje) {
      const data = await mod.getDzisiejszeLekcje();
      return data as LekcjaRaw[] | null;
    }
  } catch {
    // ignorujemy – polecimy z pustą listą
  }
  return [];
}

// Dane zmienne (Supabase itp.) – unikamy twardego cache w czasie builda
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // rozwiąż komponent Table (raz, przed renderem)
  const Table = await resolveTable();

  // pobierz surowe rekordy i znormalizuj do kształtu dla Table
  const lekcjeRaw = await getDzisiejszeLekcje();
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
