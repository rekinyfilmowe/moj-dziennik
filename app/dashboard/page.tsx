// app/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase-server';
import { getCurrentUserWithRole } from '@/lib/supabase-server';
import { StatCard } from '@/components/Dashboard/StatCard';
import Table from '@/components/Dashboard/Table';

export default async function DashboardPage() {
  const supabase = createServerClient();
  const me = await getCurrentUserWithRole();

  // 1) Dzisiejsze lekcje z licznikami frekwencji
 const { data: lekcje } = await supabase
  .from('lekcje')
  .select(`
    id, data_lekcji, temat, numer,
    przedmiot:przedmioty!lekcje_id_przedmiot_fkey(nazwa),
    klasa:klasy!lekcje_id_klasa_fkey(nazwa),
    frekwencja_counts:lekcje_frekwencja_counts(obecni, nieobecni, spoznieni, zwolnieni, usprawiedliwieni)
  `)
  .eq('data_lekcji', new Date().toISOString().split('T')[0])
  .order('numer', { ascending: true });


  // 2) Ostatnie oceny (5 najnowszych)
  const { data: oceny } = await supabase
    .from('oceny')
    .select(`
      id,
      data,
      ocena,
      typ,
      uczen:uczniowie(imie, nazwisko),
      przedmiot:przedmioty(nazwa)
    `)
    .order('data', { ascending: false })
    .limit(5);

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Panel</h1>
        {me && (
          <span className="rounded-full border px-2 py-1 text-xs">
            Rola: {me.role}
          </span>
        )}
      </header>

      {/* Sekcja z tabelami */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* Dzisiejsze lekcje */}
        <div>
          <h2 className="font-semibold mb-2">Dzisiejsze lekcje</h2>
          <Table
            rows={lekcje?.map(l => ({
              title: `${l.przedmiot?.nazwa} — ${l.temat || 'Brak tematu'}`,
              date: l.data_lekcji,
              tag: `Obecni: ${l.frekwencja_counts?.obecni || 0}`
            })) || []}
          />
        </div>

        {/* Ostatnie oceny */}
        <div>
          <h2 className="font-semibold mb-2">Ostatnie oceny</h2>
          <Table
            rows={oceny?.map(o => ({
              title: `${o.uczen?.imie} ${o.uczen?.nazwisko} — ${o.ocena}`,
              date: o.data,
              tag: o.przedmiot?.nazwa || ''
            })) || []}
          />
        </div>
      </section>
    </main>
  );
}
