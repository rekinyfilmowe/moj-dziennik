"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ResetPasswordPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const disabled = !password || password !== password2;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      return;
    }
    setOk(true);
    // opcjonalnie: po 1–2 s przenieś na login lub dashboard
    setTimeout(() => router.push("/dashboard"), 1200);
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-lg border p-6 bg-white space-y-4">
        <h1 className="text-2xl font-semibold text-center">Ustaw nowe hasło</h1>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Nowe hasło</label>
          <input
            type="password"
            className="w-full rounded border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Powtórz hasło</label>
          <input
            type="password"
            className="w-full rounded border px-3 py-2"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            minLength={8}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {ok && <p className="text-sm text-green-600">Hasło zapisane! Przenoszę…</p>}

        <button
          type="submit"
          disabled={disabled}
          className="w-full rounded bg-black text-white py-2 disabled:opacity-50"
        >
          Zapisz nowe hasło
        </button>
      </form>
    </div>
  );
}
