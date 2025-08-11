// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type"); // 'recovery' | 'signup' | 'magiclink' | 'invite' | 'reauthentication' | 'email_change'

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    // tworzy sesję w oparciu o token z maila
    await supabase.auth.exchangeCodeForSession(code);
  }

  // jeśli to reset hasła → wyślij na stronę ustawiania nowego hasła
  if (type === "recovery") {
    return NextResponse.redirect(new URL("/auth/reset-password", url.origin));
  }

  // w pozostałych przypadkach (login, oauth, magic link)
  return NextResponse.redirect(new URL("/dashboard", url.origin));
}
