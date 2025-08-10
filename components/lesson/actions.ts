// components/lesson/actions.ts
"use server";

import { createServerClient } from "@/lib/supabase-server";
import type { AttendanceRow, SubjectOption } from "./types";

/* =======================
   Typy dla akcji lekcji
======================= */
export type GetSubjectsParams = {
  classId: string;   // uuid
  dateISO: string;   // "YYYY-MM-DD"
};

export type CheckLessonParams = {
  planEntryId: string; // uuid
  dateISO: string;     // "YYYY-MM-DD"
};

export type SaveLessonParams = {
  planEntryId: string;       // uuid (plan_lekcji_wpisy.id)
  classId: string;           // uuid (klasy.id)
  dateISO: string;           // "YYYY-MM-DD"
  teacherId?: string | null; // opcjonalnie (uuid)
  topic?: string | null;     // temat lekcji
};

/* =======================
   POMOCNICZE
======================= */

function toIsoDateOnly(v: string | Date): string {
  if (typeof v === "string") return v.slice(0, 10);
  const y = v.getUTCFullYear();
  const m = String(v.getUTCMonth() + 1).padStart(2, "0");
  const d = String(v.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dow1to7(dateISO: string): number {
  const dt = new Date(dateISO + "T00:00:00Z");
  const js = dt.getUTCDay(); // 0..6, nd=0
  return js === 0 ? 7 : js;  // 1..7 (pn..nd)
}

// Stare utils – zostawiam, bo używasz niżej w frekwencji/ocenach:
function asNum(x: any) { return x == null ? null : Number(x); }

function ocenaNaLiczbe(s?: string | number | null) {
  if (s == null) return null;
  const str = String(s);
  const base = parseFloat(str);
  if (Number.isNaN(base)) return null;
  if (str.includes("+")) return base + 0.5;
  if (str.includes("-")) return base - 0.25;
  return base;
}

function srednia(nums: (number | null)[]) {
  const vals = nums.filter((v): v is number => v != null);
  if (!vals.length) return null;
  const sum = vals.reduce((a, b) => a + b, 0);
  return Number((sum / vals.length).toFixed(2));
}

/* =======================
   AKCJE
======================= */

// lib/actions.ts
export async function getClassesAction() {
  const s = createServerClient();
  const { data, error } = await s
    .from("klasy")
    .select("id, nazwa")
    .order("nazwa");

  if (error) {
    console.error("Błąd pobierania klas:", error);
    return [];
  }

  return data.map((k) => ({
    label: k.nazwa,
    value: String(k.id), // UI używa stringów
  }));
}

/** Wypełnia dropdown „Przedmiot” na podstawie klasy + daty */
/** Wypełnia dropdown „Przedmiot” na podstawie klasy + daty */
export async function getSubjectsForDateAction(params: GetSubjectsParams) {
  const supabase = createServerClient();

  const dateISO = toIsoDateOnly(params.dateISO);
  const dow = dow1to7(dateISO);

  // 1) plan dla klasy
  const { data: plans, error: planErr } = await supabase
    .from("plan_lekcji")
    .select("id, id_klasa, data_od, data_do")
    .eq("id_klasa", params.classId)
    .lte("data_od", dateISO)
    .gte("data_do", dateISO);

  if (planErr) throw planErr;
  if (!plans?.length) return [];

  const plan = plans[0];

  // 2) wpisy w danym dniu
  const { data: entries, error: entriesErr } = await supabase
    .from("plan_lekcji_wpisy")
    .select("id, id_przedmiot, numer_lekcji")
    .eq("id_plan", plan.id)
    .eq("dzien_tygodnia", dow)
    .order("numer_lekcji", { ascending: true });

  if (entriesErr) throw entriesErr;
  if (!entries?.length) return [];

  // 3) nazwy przedmiotów
  const subjectIds = [...new Set(entries.map((e) => e.id_przedmiot))];
  const { data: subjectsDict, error: subjErr } = await supabase
    .from("przedmioty")
    .select("id, nazwa")
    .in("id", subjectIds);

  if (subjErr) throw subjErr;

  const nameById = new Map<string, string>(
    (subjectsDict ?? []).map((s: any) => [String(s.id), s.nazwa])
  );

  // 4) budowa opcji
  const options: SubjectOption[] = entries.map((e: any) => ({
    value: String(e.id), // planEntryId w formie "value"
    label: `${e.numer_lekcji}. ${nameById.get(String(e.id_przedmiot)) ?? "(bez nazwy)"}`,
    subjectId: String(e.id_przedmiot),
    lessonNo: e.numer_lekcji,
  }));

  return options;
}


/** Sprawdza, czy lekcja już istnieje (po wpisie planu + dacie) */
export async function checkExistingLessonAction(
  params: CheckLessonParams
): Promise<{ exists: boolean; lessonId?: string }> {
  const supabase = createServerClient();
  const dateISO = toIsoDateOnly(params.dateISO);

  const { data, error } = await supabase
    .from("lekcje")
    .select("id")
    .eq("id_wpis_planu", params.planEntryId) // uuid
    .eq("data_lekcji", dateISO)
    .limit(1);

  if (error) throw error;

  const row = data?.[0];
  return { exists: !!row, lessonId: row?.id as string | undefined };
}

/** Zapisuje lekcję na podstawie wpisu planu (bez duplikatów) */
export async function saveLessonAction(
  params: SaveLessonParams
): Promise<{ ok: true; lessonId: string } | { ok: false; reason: string }> {
  const supabase = createServerClient();
  const dateISO = toIsoDateOnly(params.dateISO);

  // 0) idempotencja
  const already = await checkExistingLessonAction({
    planEntryId: params.planEntryId,
    dateISO,
  });
  if (already.exists && already.lessonId) {
    return { ok: true, lessonId: already.lessonId };
  }

  // 1) pobierz z wpisu planu: id_przedmiot + numer_lekcji
  const { data: entry, error: eErr } = await supabase
    .from("plan_lekcji_wpisy")
    .select("id_przedmiot, numer_lekcji")
    .eq("id", params.planEntryId)
    .single();

  if (eErr) return { ok: false, reason: eErr.message };

  const subjectId = entry!.id_przedmiot as string; // uuid
  const lessonNo = entry!.numer_lekcji as number;

  // 2) insert do 'lekcje' — nazwy kolumn wg Twojego schematu
  const payload: Record<string, any> = {
    id_wpis_planu: params.planEntryId,
    id_klasa: params.classId,
    id_przedmiot: subjectId,
    data_lekcji: dateISO,
    numer: lessonNo,
    temat: params.topic ?? null,
  };
  if (params.teacherId) payload.id_nauczyciel = params.teacherId;

  const { data: ins, error: insErr } = await supabase
    .from("lekcje")
    .insert(payload)
    .select("id")
    .single();

  if (insErr) return { ok: false, reason: insErr.message };
  return { ok: true, lessonId: ins!.id as string };
}

/* =======================
   Dane do tabeli frekwencji (zostawiam Twoje schematy)
======================= */

export async function loadStudentsWithDataAction(params: {
  classId: string; subjectId: string; lessonId: string; semester: 1 | 2;
}) {
  const s = createServerClient();

  // uczniowie
  const { data: students } = await s
    .from("uczniowie")
    .select("_id, imie, nazwisko")
    .eq("idKlasa", asNum(params.classId)) // jeśli tu też przejdziesz na UUID – daj znać, podmienię
    .order("nazwisko", { ascending: true });

  // frekwencja
  const { data: attendance } = await s
    .from("frekwencja")
    .select("_id, idUczen, status, uwagi")
    .eq("idLekcja", asNum(params.lessonId));

  // oceny
  const { data: grades } = await s
    .from("oceny")
    .select("_id, idUczen, idPrzedmiot, semestr, ocena, typOceny, zaCo")
    .eq("idPrzedmiot", asNum(params.subjectId));

  const header: AttendanceRow = {
    isHeader: true,
    idUczen: "hdr",
    imieNazwisko: "Imię i nazwisko",
    status: "Obecny",
    ocenySem1Html: "Oceny sem. 1",
    ocenySem2Html: "Oceny sem. 2",
    sredniaRoczna: null,
  };

  const rows: AttendanceRow[] = [
    header,
    ...(students ?? []).map((u: any) => {
      const att = (attendance ?? []).find((a: any) => a.idUczen === u._id);
      const g = (grades ?? []).filter((x: any) => x.idUczen === u._id);

      const g1 = g.filter((x: any) => String(x.semestr) === "1");
      const g2 = g.filter((x: any) => String(x.semestr) === "2");

      const toHtml = (arr: any[]) =>
        arr.length
          ? arr
              .map((o) => {
                const color = o.typOceny === "spr" ? "red" : "black";
                const tip = o.zaCo ? `title="${o.zaCo}"` : "";
                return `<span style="color:${color}; font-size:16px;" ${tip}>${o.ocena}${
                  o.typOceny ? " (" + o.typOceny + ")" : ""
                }</span>`;
              })
              .join(", ")
          : '<span style="font-size:16px;">Brak ocen</span>';

      const avg1 = srednia(g1.map((o) => ocenaNaLiczbe(o.ocena)));
      const avg2 = srednia(g2.map((o) => ocenaNaLiczbe(o.ocena)));
      const annual =
        avg1 != null && avg2 != null ? Number(((avg1 + avg2) / 2).toFixed(2)) : avg1 ?? avg2 ?? null;

      return {
        isHeader: false,
        idUczen: String(u._id), // UI pracuje na stringach
        imieNazwisko: `${u.imie} ${u.nazwisko}`,
        status: (att?.status as any) ?? "Obecny",
        ocenySem1Html: toHtml(g1),
        ocenySem2Html: toHtml(g2),
        sredniaRoczna: annual,
      } as AttendanceRow;
    }),
  ];

  return { rows };
}

export async function saveAttendanceAction(params: { lessonId: string; rows: AttendanceRow[] }) {
  const s = createServerClient();
  const rows = params.rows.filter((r) => !r.isHeader);

  // upsert frekwencji
  for (const r of rows) {
    const { data: exists } = await s
      .from("frekwencja")
      .select("_id")
      .eq("idLekcja", asNum(params.lessonId))
      .eq("idUczen", asNum(r.idUczen))
      .limit(1);

    const payload = {
      idLekcja: asNum(params.lessonId),
      idUczen: asNum(r.idUczen),
      status: r.status,
      uwagi: (r as any).uwagi ?? "",
    };

    if (exists?.length) {
      await s.from("frekwencja").update(payload).eq("_id", exists[0]._id);
    } else {
      await s.from("frekwencja").insert(payload);
    }
  }

  // policz zestawienie (zachowuję logikę wyłącznie do komunikatu)
  let obecni = 0, spoznieni = 0, nieobecni = 0, usprawiedliwieni = 0, zwolnieni = 0;
  for (const r of rows) {
    switch (r.status) {
      case "Obecny": obecni++; break;
      case "Spóźniony": spoznieni++; break;
      case "Nieobecny": nieobecni++; break;
      case "Usprawiedliwiony": usprawiedliwieni++; break;
      case "Zwolniony": zwolnieni++; break;
    }
  }

  // (opcjonalnie) update lekcji z agregatami – tylko jeśli masz takie kolumny;
  // zostawiam wyłączone, żeby nie wysypać się na Twoim schemacie:
  // try {
  //   await s.from("lekcje").update({
  //     obecni, spoznieni, nieobecni, usprawiedliwieni, zwolnieni
  //   }).eq("id", params.lessonId); // lekcje.id = uuid
  // } catch (_) {}

  return {
    message: `✅ Zapisano frekwencję: ${obecni} obecnych, ${spoznieni} spóźnionych, ${nieobecni} nieobecnych.`,
  };
}
