"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((ev) => {
      if (ev === "SIGNED_IN") router.push("/app");
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
          providers={[]}
          view="magic_link"
          showLinks={false}
          localization={{
            variables: {
              magic_link: {
                email_input_label: "Email",
                button_label: "Wyślij link logowania",
              },
            },
          }}
          redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/app`}
        />
        <p className="text-sm text-gray-500 mt-4">
          Magic link = zero haseł, zero dramatu ✨
        </p>
      </div>
    </div>
  );
}
