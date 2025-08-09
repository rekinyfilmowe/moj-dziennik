"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function NewStudentForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/app/students/new/action", {
      method: "POST",
      body: JSON.stringify({ firstName, lastName }),
    });
    if (res.ok) {
      startTransition(() => router.push("/app/students"));
    } else {
      const msg = await res.text();
      alert(msg || "Ups, nie udało się zapisać.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <input className="rounded-md border px-3 py-2" placeholder="Imię"
             value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      <input className="rounded-md border px-3 py-2" placeholder="Nazwisko"
             value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      <button className="rounded-md border px-4 py-2 hover:bg-gray-50 disabled:opacity-60"
              disabled={isPending} type="submit">
        {isPending ? "Zapisuję..." : "Zapisz"}
      </button>
    </form>
  );
}
