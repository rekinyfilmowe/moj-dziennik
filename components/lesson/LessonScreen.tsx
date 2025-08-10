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
import type { AttendanceRow, SubjectOption, StudentRow } from "./types";

type Summary = {
  obecni: number; spoznieni: number; nieobecni: number; usprawiedliwieni: number; zwolnieni: number;
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
  const [planEntryId, setPlanEntryId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");
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

  // tło (jak w Wix – z kolekcji "tlo")
  useEffect(() => {
    (async () => {
      try {
        const { url } = await (await fetch("/api/background")).json();
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

  // za każdym razem gdy zmienia się data/klasa – ładujemy możliwe wpisy (przedmiot+nr)
  useEffect(() => {
    (async () => {
      setSubjects([]);
      setPlanEntryId("");
      setSubjectId("");
      if (!date || !classId) return;

      const subs = await getSubjectsForDateAction({ date: ymd(date), classId });
      setSubjects(subs);
    })();
  }, [date, classId]);

  // po wyborze wpisu – sprawdź przedmiot i czy lekcja istnieje
  useEffect(() => {
    (async () => {
      if (!date || !classId || !planEntryId) return;

      const check = await checkExistingLessonAction({
        date: ymd(date),
        classId,
        planEntryId,
      });
      setSubjectId(check.subjectId ?? "");
      setLessonId(check.lessonId);
      if (check.lessonTopic) setTopic(check.lessonTopic);
      if (check.summaryText) setMsg(check.summaryText);
    })();
  }, [date, classId, planEntryId]);

  // zapis/wczytanie lekcji
  async function handleSaveLesson() {
    if (!date || !classId || !planEntryId || !topic) {
      setMsg("⚠️ Uzupełnij datę, klasę, wpis planu i temat.");
      return;
    }
    setSavingLesson(true);
    const res = await saveLessonAction({
      date: ymd(date),
      classId,
      planEntryId,
      topic,
    });
    setSavingLesson(false);
    if (res.error) {
      setMsg(res.error);
      return;
    }
    setLessonId(res.lessonId!);
    setSubjectId(res.subjectId!);
    setMsg(res.message ?? "Zapisano lekcję!");
    // załaduj uczniów + obecności + oceny
    const data = await loadStudentsWithDataAction({
      classId,
      subjectId: res.subjectId!,
      lessonId: res.lessonId!,
      semester: sem,
    });
    setRows(data.rows);
  }

  async function handleSaveAttendance() {
    if (!lessonId) {
      setMsg("⚠️ Najpierw zapisz/wczytaj lekcję.");
      return;
    }
    setSavingAttendance(true);
    const res = await saveAttendanceAction({ lessonId, rows });
    setSavingAttendance(false);
    setMsg(res.message);
  }

  function recomputeSummary(current: AttendanceRow[]): Summary {
    const init: Summary = { obecni: 0, spoznieni: 0, nieobecni: 0, usprawiedliwieni: 0, zwolnieni: 0 };
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

  const summary = useMemo(() => recomputeSummary(rows.filter(r => !r.isHeader)), [rows]);
  const filteredRows = useMemo(() => {
    if (!onlyCurrentSemester) return rows;
    // w tym MVP oceny pokazujemy jako tekst scalony – filtrowanie dotyczy tekstu z semestru
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
            disabled={!subjects.length}
            value={planEntryId}
            onChange={(e) => setPlanEntryId(e.target.value)}
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
            {savingLesson ? "Zapisuję lekcję..." : (lessonId ? "Zapisz i wczytaj lekcję »" : "Rozpocznij lekcję")}
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
