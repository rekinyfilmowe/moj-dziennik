// components/grades/GradeModal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getSubjectNameAction,
  listGradesAction,
  upsertGradeAction,
  deleteGradeAction,
} from "../lesson/actions";
import type { GradeRow } from "../lesson/actions";

const TYPE_OPTIONS = [
  { label: "Sprawdzian", value: "spr" },
  { label: "Kartkówka", value: "kart" },
  { label: "Odpowiedź ustna", value: "odp" },
  { label: "Zadanie domowe", value: "PD" },
  { label: "Inne", value: "inne" },
];

function validGrade(v: string) {
  return /^[1-6]([+-])?$/.test(v.trim());
}

export default function GradeModal(props: {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  studentId: string;
  studentName: string;
  subjectId: string;
  semester: 1 | 2;
}) {
  const { open, onClose, studentId, studentName, subjectId, semester } = props;

  const [subjectName, setSubjectName] = useState<string>("");
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [mode, setMode] = useState<"add" | "edit" | "improve">("add");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [vGrade, setVGrade] = useState("");
  const [vType, setVType] = useState("spr");
  const [vReason, setVReason] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    (async () => {
      setErr("");
      setMode("add");
      setEditingId(null);
      setVGrade("");
      setVType("spr");
      setVReason("");

      const [nazwa, list] = await Promise.all([
        getSubjectNameAction(subjectId),
        listGradesAction({ studentId, subjectId, semester }),
      ]);
      setSubjectName(nazwa);
      setGrades(list);
    })();
  }, [open, studentId, subjectId, semester]);

  async function handleSave() {
    try {
      setErr("");
      if (mode === "add" || mode === "edit") {
        if (!validGrade(vGrade)) {
          setErr("Nieprawidłowa wartość oceny (dozwolone 1–6 z opcjonalnym +/−).");
          return;
        }
      }
      if (mode === "add") {
        await upsertGradeAction({
          mode: "add",
          studentId,
          subjectId,
          semester,
          ocena: vGrade.trim(),
          typ_oceny: vType,
          za_co: vReason || null,
        });
      } else if (mode === "edit" && editingId) {
        await upsertGradeAction({
          mode: "edit",
          gradeId: editingId,
          ocena: vGrade.trim(),
          typ_oceny: vType,
          za_co: vReason || null,
        });
      } else if (mode === "improve" && editingId) {
        if (!validGrade(vGrade)) {
          setErr("Nieprawidłowa wartość poprawy.");
          return;
        }
        await upsertGradeAction({
          mode: "improve",
          gradeId: editingId,
          poprawa_ocena: vGrade.trim(),
        });
      }

      const list = await listGradesAction({ studentId, subjectId, semester });
      setGrades(list);
      // reset form
      setMode("add");
      setEditingId(null);
      setVGrade("");
      setVType("spr");
      setVReason("");
    } catch (e: any) {
      setErr(e?.message ?? "Błąd zapisu oceny.");
    }
  }

  function startEdit(g: GradeRow) {
    setMode("edit");
    setEditingId(g.id);
    setVGrade(g.ocena ?? "");
    setVType(g.typ_oceny ?? "spr");
    setVReason(g.za_co ?? "");
    setErr("");
  }

  function startImprove(g: GradeRow) {
    setMode("improve");
    setEditingId(g.id);
    setVGrade(""); // nowa wartość poprawy
    setVType(g.typ_oceny ?? "spr");
    setVReason(g.za_co ?? "");
    setErr("");
  }

  async function handleDelete(id: string) {
    try {
      await deleteGradeAction(id);
      const list = await listGradesAction({ studentId, subjectId, semester });
      setGrades(list);
    } catch (e: any) {
      setErr(e?.message ?? "Nie udało się usunąć oceny.");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => onClose(false)} />
      <div className="relative w-[94vw] max-w-3xl max-h-[90vh] overflow-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-2xl md:text-3xl font-bold">
            Oceny dla: {studentName} — {subjectName}
          </h2>
          <button
            onClick={() => onClose(true)}
            className="rounded bg-black text-white px-3 py-2"
            aria-label="Zamknij"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          {/* lista ocen */}
          <div className="overflow-hidden rounded-lg border mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-purple-100 text-left">
                  <th className="p-2">Ocena</th>
                  <th className="p-2">Poprawa</th>
                  <th className="p-2">Typ</th>
                  <th className="p-2">Za co</th>
                  <th className="p-2">Data</th>
                  <th className="p-2 w-36">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => (
                  <tr key={g.id} className="border-t">
                    <td className="p-2">{g.ocena ?? "-"}</td>
                    <td className="p-2">{g.poprawa_ocena ?? ""}</td>
                    <td className="p-2">
                      {{
                        spr: "Sprawdzian",
                        kart: "Kartkówka",
                        odp: "Odpowiedź ustna",
                        PD: "Zadanie domowe",
                        inne: "Inne",
                      }[g.typ_oceny ?? ""] ?? "-"}
                    </td>
                    <td className="p-2">{g.za_co ?? "-"}</td>
                    <td className="p-2">
                      {g.data ? new Date(g.data).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startImprove(g)}
                          className="px-2 py-1 rounded bg-gray-200"
                          title="Dodaj poprawę"
                        >
                          ♻️
                        </button>
                        <button
                          onClick={() => startEdit(g)}
                          className="px-2 py-1 rounded bg-gray-200"
                          title="Edytuj"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(g.id)}
                          className="px-2 py-1 rounded bg-gray-200"
                          title="Usuń"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!grades.length && (
                  <tr>
                    <td className="p-3 text-center text-gray-500" colSpan={6}>
                      Brak ocen w tym semestrze.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* formularz */}
          <div className="rounded-2xl p-4 bg-lime-100">
            <div className="mb-2 font-semibold">
              {mode === "add"
                ? "➕ Dodaj nową ocenę"
                : mode === "edit"
                ? "✏️ Edytuj ocenę"
                : "♻️ Dodaj poprawę oceny"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
              <div>
                <label className="block text-sm mb-1">
                  {mode === "improve" ? "Poprawa (ocena)" : "Ocena"}
                </label>
                <input
                  value={vGrade}
                  onChange={(e) => setVGrade(e.target.value)}
                  placeholder="np. 4+"
                  className="w-full rounded border p-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Typ</label>
                <select
                  className="w-full rounded border p-2"
                  disabled={mode === "improve"}
                  value={vType}
                  onChange={(e) => setVType(e.target.value)}
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Za co</label>
                <input
                  value={vReason}
                  onChange={(e) => setVReason(e.target.value)}
                  disabled={mode === "improve"}
                  placeholder="np. Sprawdzian"
                  className="w-full rounded border p-2"
                />
              </div>
            </div>

            {!!err && (
              <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
                {err}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <button
                onClick={handleSave}
                className="rounded bg-black text-white px-4 py-2"
              >
                Zapisz
              </button>
              <button
                onClick={() => {
                  setMode("add");
                  setEditingId(null);
                  setVGrade("");
                  setVType("spr");
                  setVReason("");
                  setErr("");
                }}
                className="rounded bg-gray-200 px-4 py-2"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            onClick={() => onClose(true)}
            className="rounded bg-black text-white px-4 py-2"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
