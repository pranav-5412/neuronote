"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { authInput, profileInput } from "@/lib/validation/input";
import { safeNext } from "@/lib/auth-paths";
export interface AuthState {
  error?: string;
  message?: string;
}
export async function signIn(
  _previous: AuthState,
  form: FormData,
): Promise<AuthState> {
  if (!supabaseConfigured())
    return { error: "Connect your Supabase project before signing in." };
  const input = authInput.safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  if (!input.success)
    return {
      error: "Enter a valid email and a password with at least 8 characters.",
    };
  try {
    const client = await createClient();
    const { error } = await client.auth.signInWithPassword(input.data);
    if (error)
      return {
        error:
          error.code === "email_not_confirmed"
            ? "Check your inbox and confirm your email before signing in."
            : "We couldn’t sign you in. Check your email and password, then try again.",
      };
  } catch {
    return { error: "Sign-in is temporarily unavailable. Please try again." };
  }
  redirect(safeNext(form.get("next")));
}
export async function signUp(
  _previous: AuthState,
  form: FormData,
): Promise<AuthState> {
  if (!supabaseConfigured())
    return {
      error: "Connect your Supabase project before creating an account.",
    };
  const input = authInput.safeParse({
    email: form.get("email"),
    password: form.get("password"),
  });
  const profile = profileInput.safeParse({
    displayName: form.get("displayName"),
  });
  if (!input.success || !profile.success)
    return {
      error:
        "Enter your name, a valid email, and a password with at least 8 characters.",
    };
  let active = false;
  try {
    const client = await createClient();
    const origin = process.env.NEXT_PUBLIC_SITE_URL;
    if (!origin)
      return {
        error:
          "Account setup is not configured yet. Please contact the workspace owner.",
      };
    const { data, error } = await client.auth.signUp({
      ...input.data,
      options: {
        data: { display_name: profile.data.displayName },
        emailRedirectTo: new URL("/auth/confirm", origin).toString(),
      },
    });
    if (error && error.code !== "user_already_exists")
      return {
        error:
          error.code === "over_email_send_rate_limit"
            ? "Please wait a moment before requesting another email."
            : "We couldn’t create your account. Please try again shortly.",
      };
    active = !!data?.session;
  } catch {
    return {
      error: "Account creation is temporarily unavailable. Please try again.",
    };
  }
  if (active) redirect("/");
  return {
    message:
      "Check your inbox to confirm your email. If you already have an account, sign in instead.",
  };
}
export async function signOut() {
  if (supabaseConfigured()) {
    const client = await createClient();
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error)
      return {
        ok: false as const,
        error: "We couldn’t sign you out. Please try again.",
      };
  }
  redirect("/login");
}
