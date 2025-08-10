import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { user } } = await supabase.auth.getUser();

  const isAppPath = req.nextUrl.pathname.startsWith("/dashboard");
  const isLoginPath = req.nextUrl.pathname.startsWith("/login");

  if (!user && isAppPath) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && isLoginPath) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = { matcher: ["/dashboard/:path*", "/login"] };
