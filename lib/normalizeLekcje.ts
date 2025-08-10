// lib/normalizeLekcje.ts

export type LekcjaRaw = {
  id: string | number;
  data_lekcji: string | null;
  temat: string | null;
  numer: number | null;
  przedmiot: { nazwa: string | null }[] | null;
  klasa: { nazwa: string | null }[] | null;
  frekwencja_counts: {
    obecni: number | null;
    nieobecni: number | null;
    spoznieni: number | null;
    zwolnieni: number | null;
    usprawiedliwieni: number | null;
  }[] | null;
};

export type LekcjaRow = {
  id: string | number;
  data_lekcji: string | null;
  temat: string | null;
  numer: number | null;
  przedmiot: string | null; // pojedyncza nazwa
  klasa: string | null;     // pojedyncza nazwa
  frekwencja_counts: {
    obecni: number | null;
    nieobecni: number | null;
    spoznieni: number | null;
    zwolnieni: number | null;
    usprawiedliwieni: number | null;
  };
};

export function normalizeLekcje(
  lekcje: LekcjaRaw[] | null | undefined
): LekcjaRow[] {
  if (!Array.isArray(lekcje)) return [];
  return lekcje.map((l) => ({
    id: l.id,
    data_lekcji: l.data_lekcji ?? null,
    temat: l.temat ?? null,
    numer: l.numer ?? null,
    przedmiot: l.przedmiot?.[0]?.nazwa ?? null,
    klasa: l.klasa?.[0]?.nazwa ?? null,
    frekwencja_counts: {
      obecni: l.frekwencja_counts?.[0]?.obecni ?? 0,
      nieobecni: l.frekwencja_counts?.[0]?.nieobecni ?? 0,
      spoznieni: l.frekwencja_counts?.[0]?.spoznieni ?? 0,
      zwolnieni: l.frekwencja_counts?.[0]?.zwolnieni ?? 0,
      usprawiedliwieni: l.frekwencja_counts?.[0]?.usprawiedliwieni ?? 0,
    },
  }));
}
