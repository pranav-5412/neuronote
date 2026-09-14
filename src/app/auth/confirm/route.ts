import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth-paths";
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const code = params.get("code");
  try {
    const client = await createClient();
    const result =
      tokenHash && params.get("type") === "email"
        ? await client.auth.verifyOtp({ type: "email", token_hash: tokenHash })
        : code
          ? await client.auth.exchangeCodeForSession(code)
          : null;
    if (result && !result.error)
      return NextResponse.redirect(
        new URL(safeNext(params.get("next")), request.url),
        {
          headers: {
            "Cache-Control": "no-store",
            "Referrer-Policy": "no-referrer",
          },
        },
      );
  } catch {
    /* Expired or unconfigured confirmation. */
  }
  return NextResponse.redirect(
    new URL("/login?error=confirmation", request.url),
    {
      headers: {
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    },
  );
}
