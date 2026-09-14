export function supabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return (
    !!url &&
    !!key &&
    key.startsWith("sb_publishable_") &&
    !url.includes("YOUR_PROJECT") &&
    !key.includes("REPLACE_ME")
  );
}
export function supabaseConfig() {
  if (!supabaseConfigured()) throw new Error("Supabase is not configured");
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  };
}
