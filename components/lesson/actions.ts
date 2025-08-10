// components/lesson/actions.ts
"use server";

import { createServerClient } from "@/lib/supabase-server";
import type { AttendanceRow, SubjectOption } from "./types";

// --------------- POMOCNICZE ---------------
function toYMD(dateStr: string) { return dateStr; } // już dostajemy Y-M-D

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

// --------------- AKCJE ---------------

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

export async function getSubjectsForDateAction(params: {
  classId: string;   // uuid jako string!
  dateISO: string;   // "YYYY-MM-DD"
}) {
  const supabase = createClient();

  // DOW: 1=pn ... 7=nd (taki masz w DB)
  const dt = new Date(params.dateISO + "T00:00:00Z");
  const jsDow = dt.getUTCDay();         // 0..6 (nd=0)
  const dow = jsDow === 0 ? 7 : jsDow;  // 1..7

  // 1) plan dla klasy (uuid, bez Number())
  const { data: plans, error: planErr } = await supabase
    .from("plan_lekcji")
    .select("id, id_klasa, data_od, data_do")
    .eq("id_klasa", params.classId)
    .lte("data_od", params.dateISO)
    .gte("data_do", params.dateISO);

  if (planErr) throw planErr;
  if (!plans || plans.length === 0) return [];

  const plan = plans[0];

  // 2) wpisy w danym dniu (id_plan = uuid, dzien_tygodnia = 1..7)
  const { data: entries, error: entriesErr } = await supabase
    .from("plan_lekcji_wpisy")
    .select("id, id_przedmiot, numer_lekcji")
    .eq("id_plan", plan.id)
    .eq("dzien_tygodnia", dow)
    .order("numer_lekcji", { ascending: true });

  if (entriesErr) throw entriesErr;
  if (!entries || entries.length === 0) return [];

  // 3) (opcjonalnie) dociągamy nazwy przedmiotów przez IN(uuid)
  const subjectIds = [...new Set(entries.map(e => e.id_przedmiot))];
  const { data: subjectsDict, error: subjErr } = await supabase
    .from("przedmioty") // <- potwierdź nazwę tabeli z przedmiotami
    .select("id, nazwa")
    .in("id", subjectIds);

  if (subjErr) throw subjErr;

  const nameById = new Map(subjectsDict?.map(s => [s.id, s.nazwa]) ?? []);

  return entries.map(e => ({
    planEntryId: e.id,                 // uuid
    subjectId: e.id_przedmiot,         // uuid
    subjectName: nameById.get(e.id_przedmiot) ?? "(bez nazwy)",
    lessonNo: e.numer_lekcji,
  }));
}



export async function checkExistingLessonAction(
  params: CheckLessonParams
): Promise<{ exists: boolean; lessonId?: string }> {
  const supabase = createClient();
  const dateISO = toIsoDateOnly(params.dateISO);

  const { data, error } = await supabase
    .from("lekcje")
    .select("id")
    .eq("idWpisPlanu", params.planEntryId) // uuid, bez Number()
    .eq("data", dateISO)
    .limit(1);

  if (error) throw error;

  const row = data && data[0];
  return { exists: !!row, lessonId: row?.id };
}

/** Zapisuje lekcję dla wybranego wpisu planu */
export async function saveLessonAction(
  params: SaveLessonParams
): Promise<{ ok: true; lessonId: string } | { ok: false; reason: string }> {
  const supabase = createClient();
  const dateISO = toIsoDateOnly(params.dateISO);

  // 0) Idempotencja – jeśli już istnieje, nie duplikujemy
  const exists = await checkExistingLessonAction({
    planEntryId: params.planEntryId,
    dateISO,
  });
  if (exists.exists && exists.lessonId) {
    return { ok: true, lessonId: exists.lessonId };
  }

  // 1) Pobierz id_przedmiot z wpisu planu (uuid)
  const { data: entry, error: entryErr } = await supabase
    .from("plan_lekcji_wpisy")
    .select("id_przedmiot")
    .eq("id", params.planEntryId) // uuid
    .single();

  if (entryErr) return { ok: false, reason: entryErr.message };
  const subjectId: string = entry!.id_przedmiot;

  // 2) Insert do lekcje (wszystko jako uuid/stringi, bez Number())
  const insertPayload: Record<string, any> = {
    idWpisPlanu: params.planEntryId,
    idKlasa: params.classId,
    data: dateISO,
    notatki: params.notes ?? null,
  };

  // Jeśli masz kolumnę idPrzedmiot w lekcje — ustaw ją:
  if (subjectId) insertPayload.idPrzedmiot = subjectId;

  const { data: ins, error: insErr } = await supabase
    .from("lekcje")
    .insert(insertPayload)
    .select("id")
    .single();

  if (insErr) return { ok: false, reason: insErr.message };

  return { ok: true, lessonId: ins!.id as string };
}

export async function loadStudentsWithDataAction(params: {
  classId: string; subjectId: string; lessonId: string; semester: 1 | 2;
}) {
  const s = createServerClient();

  // uczniowie
  const { data: students } = await s
    .from("uczniowie")
    .select("_id, imie, nazwisko")
    .eq("idKlasa", asNum(params.classId))
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
    ...(students ?? []).map((u: any, idx: number) => {
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
      const annual = avg1 != null && avg2 != null ? Number(((avg1 + avg2) / 2).toFixed(2)) : avg1 ?? avg2 ?? null;

      return {
        isHeader: false,
        idUczen: String(u._id), // UI dalej pracuje na stringach
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

  // policz zestawienie
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

  // update lekcji
  await s.from("lekcje").update({
    obecni, spoznieni, nieobecni, usprawiedliwieni, zwolnieni
  }).eq("_id", asNum(params.lessonId));

  return { message: `✅ Zapisano frekwencję: ${obecni} obecnych, ${spoznieni} spóźnionych, ${nieobecni} nieobecnych.` };
}
