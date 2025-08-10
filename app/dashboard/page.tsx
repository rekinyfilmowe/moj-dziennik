// app/dashboard/page.tsx
import Link from 'next/link';
import { getCurrentUserWithRole } from '../../lib/supabase-server';
import { StatCard } from '@/components/Dashboard/StatCard';
import ActivityChart from '@/components/Dashboard/ActivityChart';
import Table from '@/components/Dashboard/Table';

export default async function DashboardPage() {
  const me = await getCurrentUserWithRole();

  const rows = [
    { title: 'Skończyć szkic artykułu', date: '2025-08-09', tag: 'Pisanie' },
    { title: 'Spotkanie — przegląd tygodnia', date: '2025-08-07', tag: 'Plan' },
    { title: 'Notatka z książki', date: '2025-08-05', tag: 'Nauka' },
  ];

  return (
    <>
      {/* Header strony */}
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

      {/* Metryki */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Dzisiejsze zadania" value={3} />
        <StatCard label="Notatki" value={128} />
        <StatCard label="Streak" value="12 dni" />
        <StatCard label="Czas skupienia (tydz.)" value="6h 20m" />
      </section>

      {/* Wykres + tabela + skróty */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityChart
            labels={['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']}
            data={[3, 4, 2, 5, 3, 1, 0]}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm text-muted-foreground mb-2">Szybkie skróty</div>
            <div className="flex flex-wrap gap-2">
              <a href="/dashboard/nowa-notatka" className="px-3 py-2 rounded-md border">✍️ Nowa notatka</a>
              <a href="/dashboard/nowe-zadanie" className="px-3 py-2 rounded-md border">✅ Nowe zadanie</a>
              <a href="/dashboard/import" className="px-3 py-2 rounded-md border">⬆️ Import</a>
            </div>
          </div>

          <Table rows={rows} />
        </div>
      </section>

      {/* Twoje istniejące linki */}
      <Link href="/dashboard/students" className="underline">Uczniowie</Link>
    </>
  );
}
