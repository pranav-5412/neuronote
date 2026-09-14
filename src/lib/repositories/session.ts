import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { PublicError } from "@/lib/result";
export const getSessionContext = cache(async () => {
  if (!supabaseConfigured())
    throw new PublicError("Connect your Supabase project to continue.", 503);
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user)
    throw new PublicError("Please sign in to continue.", 401);
  return { client, user: data.user };
});
