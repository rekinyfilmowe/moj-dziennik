"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteUrl = raw.replace(/\/+$/, "");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((ev) => {
      if (ev === "SIGNED_IN") router.push("/dashboard");
    });
    return () => sub.subscription.unsubscribe();
  }, [router, supabase]);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md rounded-lg border p-6 shadow-sm bg-white">
        <h1 className="text-2xl font-semibold mb-4 text-center">Zaloguj się</h1>

        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          // <-- dodaj Google jeśli chcesz (najpierw włącz w panelu Supabase)
          providers={["google"]} 
          // <-- kluczowe: przełącz z magic_link na klasyczne logowanie
          view="sign_in"
          showLinks={true}   // pokaże link do "Zarejestruj się" i "Reset hasła"
          redirectTo={`${siteUrl}/auth/callback`} // potrzebne m.in. dla Google/resetu
          localization={{
            variables: {
              sign_in: {
                email_label: "Email",
                password_label: "Haslo",
                button_label: "Zaloguj",
              },
              sign_up: {
                email_label: "Email",
                password_label: "Haslo",
                button_label: "Zarejestruj",
              },
              forgotten_password: {
                email_label: "Email",
                button_label: "Wyślij link do resetu",
              },
            },
          }}
        />

        <p className="text-sm text-gray-500 mt-4">
          Logowanie: email + haslo (opcjonalnie Google). Reset hasla dostępny pod linkiem.
        </p>
      </div>
    </div>
  );
}
