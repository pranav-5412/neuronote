import { AuthForm } from "@/components/auth/auth-form";
import { supabaseConfigured } from "@/lib/supabase/config";
import { safeNext } from "@/lib/auth-paths";
export const metadata = { title: "Sign in" };
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthForm
      mode="login"
      configured={supabaseConfigured()}
      next={safeNext(params.next)}
      error={
        params.error === "confirmation"
          ? "That confirmation link is invalid or has expired. Request a new signup email."
          : params.error === "unavailable"
            ? "Sign-in is temporarily unavailable. Please try again."
            : undefined
      }
    />
  );
}
