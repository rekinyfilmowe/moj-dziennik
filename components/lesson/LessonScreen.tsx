// components/lesson/LessonScreen.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getClassesAction,
  getSubjectsForDateAction,
  checkExistingLessonAction,
  saveLessonAction,
  loadStudentsWithDataAction,
  saveAttendanceAction,
} from "./actions";
import type { AttendanceRow, SubjectOption } from "./types";
import GradeModal from "../grades/GradeModal"; // <— import modala

type Summary = {
  obecni: number;
  spoznieni: number;
  nieobecni: number;
  usprawiedliwieni: number;
  zwolnieni: number;
};

const STATUS_OPTIONS = [
  { label: "😀 Obecny", value: "Obecny" },
  { label: "😔 Nieobecny", value: "Nieobecny" },
  { label: "😅 Spóźniony", value: "Spóźniony" },
  { label: "😊 Usprawiedliwiony", value: "Usprawiedliwiony" },
  { label: "🫣 Zwolniony", value: "Zwolniony" },
];

function ymd(d: Date) {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function currentSemester(date: Date) {
  const m = date.getMonth() + 1; // 1-12
  return m >= 9 || m <= 1 ? 1 : 2;
}

export default function LessonScreen() {
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [classId, setClassId] = useState<string>("");
  const [planEntryId, setPlanEntryId] = useState<string>(""); // s.value (uuid wpisu planu)
  const [subjectId, setSubjectId] = useState<string>(""); // uuid przedmiotu
  const [topic, setTopic] = useState("");
  const [classes, setClasses] = useState<{ label: string; value: string }[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [onlyCurrentSemester, setOnlyCurrentSemester] = useState(true);
  const sem = useMemo(() => currentSemester(date), [date]);

  const [savingLesson, setSavingLesson] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [msg, setMsg] = useState<string>("");

  // modal ocen
  const [gradesOpen, setGradesOpen] = useState(false);
  const [pickedStudent, setPickedStudent] = useState<{ id: string; name: string } | null>(null);

  // tło
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch("/api/background");
        const { url } = await resp.json();
        if (url) setBgUrl(url);
      } catch {}
    })();
  }, []);

  // klasy
  useEffect(() => {
    (async () => {
      const list = await getClassesAction();
      setClasses(list);
    })();
  }, []);

  // zmiana data/klasa -> ładuj wpisy
  useEffect(() => {
    (async () => {
      setSubjects([]);
      setPlanEntryId("");
      setSubjectId("");
      setLessonId(null);
      setRows([]);
      setMsg("");

      if (!date || !classId) return;

      const subs = await getSubjectsForDateAction({ dateISO: ymd(date), classId });
      setSubjects(subs);
      if (subs.length === 0) {
        setMsg("Brak przedmiotów w tym dniu dla wybranej klasy.");
      }
    })();
  }, [date, classId]);

  // po wyborze wpisu – ustaw subjectId i sprawdź, czy lekcja istnieje
  useEffect(() => {
    (async () => {
      setLessonId(null);
      if (!date || !classId || !planEntryId) return;

      const chosen = subjects.find((s) => s.value === planEntryId);
      setSubjectId((chosen as any)?.subjectId ?? "");

      const res = await checkExistingLessonAction({ planEntryId, dateISO: ymd(date) });
      setLessonId(res.lessonId ?? null);
    })();
  }, [date, classId, planEntryId, subjects]);

  // zapis/wczytanie lekcji
  async function handleSaveLesson() {
    setMsg("");
    if (!date || !classId || !planEntryId || !topic) {
      setMsg("⚠️ Uzupełnij datę, klasę, wpis planu i temat.");
      return;
    }

    try {
      setSavingLesson(true);
      const res = await saveLessonAction({
        planEntryId,
        classId,
        dateISO: ymd(date),
        topic,
      });
      setSavingLesson(false);

      if (!res.ok) {
        setMsg(res.reason || "Nie udało się zapisać lekcji.");
        return;
      }

      setLessonId(res.lessonId);
      setMsg("Zapisano lekcję!");

      await refreshRows(res.lessonId);
    } catch (e: any) {
      setSavingLesson(false);
      setMsg(e?.message ?? "Błąd zapisu lekcji.");
    }
  }

  async function refreshRows(lessonIdToUse?: string) {
    const chosen = subjects.find((s) => s.value === planEntryId);
    const subjId = (chosen as any)?.subjectId ?? subjectId;
    if (!classId || !subjId) return;

    const data = await loadStudentsWithDataAction({
      classId,
      subjectId: subjId,
      lessonId: lessonIdToUse ?? (lessonId ?? ""),
      semester: sem,
    });
    setRows(data.rows);
  }

  async function handleSaveAttendance() {
    if (!lessonId) {
      setMsg("⚠️ Najpierw zapisz/wczytaj lekcję.");
      return;
    }
    try {
      setSavingAttendance(true);
      const res = await saveAttendanceAction({ lessonId, rows });
      setSavingAttendance(false);
      setMsg(res.message);
    } catch (e: any) {
      setSavingAttendance(false);
      setMsg(e?.message ?? "Błąd zapisu frekwencji.");
    }
  }

  function recomputeSummary(current: AttendanceRow[]): Summary {
    const init: Summary = {
      obecni: 0,
      spoznieni: 0,
      nieobecni: 0,
      usprawiedliwieni: 0,
      zwolnieni: 0,
    };
    return current.reduce((acc, r) => {
      switch (r.status) {
        case "Obecny": acc.obecni++; break;
        case "Spóźniony": acc.spoznieni++; break;
        case "Nieobecny": acc.nieobecni++; break;
        case "Usprawiedliwiony": acc.usprawiedliwieni++; break;
        case "Zwolniony": acc.zwolnieni++; break;
      }
      return acc;
    }, init);
  }

  const summary = useMemo(() => recomputeSummary(rows.filter((r) => !r.isHeader)), [rows]);

  const filteredRows = useMemo(() => {
    if (!onlyCurrentSemester) return rows;
    return rows;
  }, [rows, onlyCurrentSemester]);

  return (
    <div
      className="rounded-2xl p-4 md:p-6"
      style={bgUrl ? { backgroundImage: `url(${bgUrl})`, backgroundSize: "cover" } : {}}
    >
      {/* Formularz */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/85 p-4 rounded-xl">
        <div>
          <label className="block text-sm mb-1">Klasa</label>
          <select
            className="w-full rounded border p-2"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value="">-- wybierz --</option>
            {classes.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Data</label>
          <input
            type="date"
            className="w-full rounded border p-2"
            value={ymd(date)}
            onChange={(e) => setDate(new Date(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Przedmiot / lekcja (wpis planu)</label>
          <select
            className="w-full rounded border p-2"
            disabled={!classId || !date || subjects.length === 0}
            value={planEntryId}
            onChange={(e) => {
              const id = e.target.value;
              setPlanEntryId(id);
              const chosen2 = subjects.find((s) => s.value === id);
              setSubjectId((chosen2 as any)?.subjectId ?? "");
            }}
          >
            <option value="">-- wybierz --</option>
            {subjects.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm mb-1">Temat lekcji</label>
          <input
            className="w-full rounded border p-2"
            placeholder="np. informatyka"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="md:col-span-3 flex items-center justify-between">
          <div className="text-sm">
            Obecni: {summary.obecni} | Spóźnieni: {summary.spoznieni} | Nieobecni: {summary.nieobecni} | Usprawiedliwieni: {summary.usprawiedliwieni} | Zwolnieni: {summary.zwolnieni}
          </div>
          <button
            onClick={handleSaveLesson}
            className="rounded bg-lime-500 text-black px-4 py-2 font-semibold"
            disabled={savingLesson}
          >
            {savingLesson ? "Zapisuję lekcję..." : lessonId ? "Zapisz i wczytaj lekcję »" : "Rozpocznij lekcję"}
          </button>
        </div>
      </div>

      {msg && (
        <div className="mt-3 rounded bg-yellow-50 border border-yellow-200 p-3 text-sm">{msg}</div>
      )}

      {/* Lista obecności */}
      {!!filteredRows.length && (
        <div className="mt-4 rounded-xl border bg-white">
          <div className="flex items-center justify-between p-3">
            <div className="text-sm flex items-center gap-3">
              <strong>Okres (semestr) {sem}</strong>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={onlyCurrentSemester}
                  onChange={(e) => setOnlyCurrentSemester(e.target.checked)}
                />
                Pokaż tylko aktualny okres (semestr)
              </label>
            </div>
            <button
              onClick={handleSaveAttendance}
              className="rounded bg-lime-500 text-black px-4 py-2 font-semibold"
              disabled={savingAttendance}
            >
              {savingAttendance ? "Zapisuję..." : "Zapisz obecność"}
            </button>
          </div>

          <ul className="divide-y">
            {filteredRows.map((r, idx) =>
              r.isHeader ? (
                <li key="hdr" className="px-4 py-2 grid grid-cols-12 gap-2 bg-gray-50 text-sm font-medium">
                  <div className="col-span-1">Lp.</div>
                  <div className="col-span-3">Imię i nazwisko</div>
                  <div className="col-span-3">Obecność</div>
                  <div className="col-span-2">Okres (semestr) 1</div>
                  <div className="col-span-2">Okres (semestr) 2</div>
                  <div className="col-span-1 text-right">Ocena roczna</div>
                </li>
              ) : (
                <li key={r.idUczen} className="px-4 py-3 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1">{idx}.</div>
                  <div className="col-span-3 flex items-center gap-2">
                    {r.imieNazwisko}
                    <button
                      className="rounded border px-2 py-1 text-xs"
                      onClick={() => {
                        setPickedStudent({ id: r.idUczen, name: r.imieNazwisko });
                        setGradesOpen(true);
                      }}
                    >
                      Oceny
                    </button>
                  </div>
                  <div className="col-span-3">
                    <select
                      className="rounded border p-2 w-full"
                      value={r.status}
                      onChange={(e) => {
                        const next = [...rows];
                        const i = next.findIndex((x) => x.idUczen === r.idUczen);
                        next[i] = { ...next[i], status: e.target.value as AttendanceRow["status"] };
                        setRows(next);
                      }}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 text-sm" dangerouslySetInnerHTML={{ __html: r.ocenySem1Html }} />
                  <div className="col-span-2 text-sm" dangerouslySetInnerHTML={{ __html: r.ocenySem2Html }} />
                  <div className="col-span-1 text-right">{r.sredniaRoczna ?? "-"}</div>
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {/* Modal ocen */}
      {gradesOpen && pickedStudent && (
        <GradeModal
          open={gradesOpen}
          onClose={async (refresh) => {
            setGradesOpen(false);
            if (refresh && lessonId) await refreshRows();
          }}
          studentId={pickedStudent.id}
          studentName={pickedStudent.name}
          subjectId={subjectId}
          semester={sem}
        />
      )}
    </div>
  );
}
