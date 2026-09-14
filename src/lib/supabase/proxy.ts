import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { supabaseConfigured, supabaseConfig } from "./config";
import { safeNext } from "@/lib/auth-paths";
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const isAuth = path === "/login" || path === "/signup";
  const publicRoute =
    isAuth || path.startsWith("/auth/") || path.startsWith("/api/");
  function redirect(path: string) {
    const result = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((cookie) => result.cookies.set(cookie));
    result.headers.set("Cache-Control", "private, no-store");
    return result;
  }
  if (!supabaseConfigured()) return publicRoute ? response : redirect("/login");
  const { url, key } = supabaseConfig();
  const client = createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  try {
    const { data, error } = await client.auth.getClaims();
    const authenticated = !error && !!data?.claims.sub;
    if (!authenticated && !publicRoute)
      return redirect(
        `/login?next=${encodeURIComponent(safeNext(path + request.nextUrl.search))}`,
      );
    if (authenticated && isAuth) {
      const identity = await client.auth.getUser();
      if (!identity.error && identity.data.user)
        return redirect(safeNext(request.nextUrl.searchParams.get("next")));
    }
  } catch {
    if (!publicRoute) return redirect("/login?error=unavailable");
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
