// lib/lekcje.ts
// TODO: podmień implementację na realny fetch z Twojej bazy (Supabase/SQL)

import type { LekcjaRaw } from "@/lib/normalizeLekcje";

/**
 * Zwraca dzisiejsze lekcje.
 * Teraz: stub zwracający pustą listę (żeby build przechodził).
 * Później: zaimplementuj realne pobieranie danych.
 */
export async function getDzisiejszeLekcje(): Promise<LekcjaRaw[] | null> {
  // przykład (do wstawienia później):
  // const { data, error } = await supabase
  //   .from("lekcje")
  //   .select("id, data_lekcji, temat, numer, przedmiot(nazwa), klasa(nazwa), frekwencja_counts(*)")
  //   .eq("data_lekcji", new Date().toISOString().slice(0,10));
  // if (error) throw error;
  // return data as LekcjaRaw[];

  return []; // stub
}
