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

export async function getSubjectsForDateAction(params: { date: string; classId: string }): Promise<SubjectOption[]> {
  const s = createServerClient();

  // 1) znajdź plan dla klasy i daty
  const { data: plans, error: plansErr } = await s
    .from("planLekcji")
    .select("_id, od, do, idKlasa")
    .eq("idKlasa", asNum(params.classId));

  if (plansErr) {
    console.error("Błąd pobierania planów:", plansErr);
    return [];
  }

  const date = new Date(params.date);
  const plan = (plans ?? []).find((p: any) => new Date(p.od) <= date && new Date(p.do) >= date);
  if (!plan) return [];

  // 2) ustal dzień tygodnia: pn=1 ... nd=7
  const dow = (() => { const d = date.getDay(); return d === 0 ? 7 : d; })();

  // 3) pobierz wpisy z danego dnia
  const { data: entries, error: entriesErr } = await s
    .from("planLekcji_wpisy")
    .select("_id, idPlan, dzienTygodnia, numerLekcji, idPrzedmiot")
    .eq("idPlan", plan._id)
    .eq("dzienTygodnia", dow)
    .order("numerLekcji", { ascending: true });

  if (entriesErr || !entries?.length) return [];

  // 4) zmapuj do label/value (dociągamy nazwy przedmiotów)
  const ids = entries.map((e: any) => e.idPrzedmiot).filter(Boolean);
  const { data: subjects } = await s.from("Przedmioty").select("_id,nazwa").in("_id", ids);

  const byId = new Map((subjects ?? []).map((p: any) => [p._id, p.nazwa as string]));
  return entries.map((e: any) => ({
    value: String(e._id),             // id wpisu planu -> string do UI
    subjectId: String(e.idPrzedmiot), // id przedmiotu -> string do UI
    label: `${byId.get(e.idPrzedmiot) ?? "Lekcja"} – lekcja ${e.numerLekcji}`,
  }));
}

export async function checkExistingLessonAction(params: { date: string; classId: string; planEntryId: string; }) {
  const s = createServerClient();

  // 1) pobierz wpis planu (żeby znać idPrzedmiotu)
  const { data: entry } = await s
    .from("planLekcji_wpisy")
    .select("idPrzedmiot")
    .eq("_id", asNum(params.planEntryId))
    .single();

  const subjectId = entry?.idPrzedmiot ? String(entry.idPrzedmiot) : null;

  // 2) czy istnieje lekcja?
  const { data: lessons } = await s
    .from("lekcje")
    .select("_id, temat, obecni, spoznieni, nieobecni, usprawiedliwieni, zwolnieni")
    .eq("dataLekcji", toYMD(params.date))
    .eq("idKlasa", asNum(params.classId))
    .eq("idWpisPlanu", asNum(params.planEntryId))
    .limit(1);

  const lesson = lessons?.[0];
  let summaryText: string | undefined;
  if (lesson?.obecni != null) {
    summaryText = `Obecni: ${lesson.obecni} | Spóźnieni: ${lesson.spoznieni} | Nieobecni: ${lesson.nieobecni} | Usprawiedliwieni: ${lesson.usprawiedliwieni} | Zwolnieni: ${lesson.zwolnieni}`;
  }

  return {
    subjectId,
    lessonId: lesson?._id ? String(lesson._id) : null,
    lessonTopic: lesson?.temat ?? "",
    summaryText,
  };
}

export async function saveLessonAction(params: {
  date: string; classId: string; planEntryId: string; topic: string;
}) {
  const s = createServerClient();

  // 1) pobierz wpis planu -> idPrzedmiotu
  const { data: entry, error: e1 } = await s
    .from("planLekcji_wpisy")
    .select("idPrzedmiot")
    .eq("_id", asNum(params.planEntryId))
    .single();
  if (e1) return { error: "❌ Nie udało się pobrać wpisu planu." };

  const subjectIdNum = Number(entry!.idPrzedmiot);
  const subjectIdStr = String(entry!.idPrzedmiot);

  // 2) sprawdź czy istnieje lekcja
  const { data: existing } = await s
    .from("lekcje")
    .select("_id, temat")
    .eq("dataLekcji", params.date)
    .eq("idKlasa", asNum(params.classId))
    .eq("idWpisPlanu", asNum(params.planEntryId))
    .limit(1);

  if (existing?.length) {
    // update tylko tematu (i zostawiamy frekwencje)
    const { error } = await s.from("lekcje").update({ temat: params.topic }).eq("_id", existing[0]._id);
    if (error) return { error: "❌ Błąd aktualizacji lekcji." };
    return {
      lessonId: String(existing[0]._id),
      subjectId: subjectIdStr, // do UI zwracamy string
      message: "Zaktualizowano lekcję.",
    };
  }

  // 3) insert
  const { data: inserted, error } = await s
    .from("lekcje")
    .insert({
      dataLekcji: params.date,
      idKlasa: asNum(params.classId),
      idPrzedmiot: subjectIdNum,
      temat: params.topic,
      idWpisPlanu: asNum(params.planEntryId),
    })
    .select("_id")
    .single();

  if (error) return { error: "❌ Błąd zapisu lekcji." };

  return { lessonId: String(inserted!._id), subjectId: subjectIdStr, message: "Zapisano lekcję!" };
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
