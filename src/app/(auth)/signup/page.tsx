import { AuthForm } from "@/components/auth/auth-form";
import { supabaseConfigured } from "@/lib/supabase/config";
export const metadata = { title: "Create an account" };
export default function Signup() {
  return <AuthForm mode="signup" configured={supabaseConfigured()} next="/" />;
}
