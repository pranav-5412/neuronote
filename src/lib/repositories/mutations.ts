import "server-only";
import { getSessionContext } from "./session";
import { PublicError } from "@/lib/result";
import {
  brainInput,
  documentInput,
  profileInput,
  uuid,
} from "@/lib/validation/input";
function databaseFailure(code: string | undefined, message: string): never {
  if (code === "23505")
    throw new PublicError("A brain with that name already exists.");
  if (code === "23503")
    throw new PublicError(
      "Move or delete the documents in this brain before deleting it.",
    );
  console.error("[NeuroNote] Database mutation failed", { code });
  throw new PublicError(message, 503);
}
export async function saveBrain(input: unknown) {
  const parsed = brainInput.safeParse(input);
  if (!parsed.success)
    throw new PublicError(
      "Check the brain name, category, icon, and description.",
    );
  const { client, user } = await getSessionContext();
  const { id, ...fields } = parsed.data;
  const result = id
    ? await client
        .from("brains")
        .update(fields)
        .eq("id", id)
        .eq("user_id", user.id)
        .select("id")
        .single()
    : await client
        .from("brains")
        .insert({ ...fields, user_id: user.id })
        .select("id")
        .single();
  if (result.error)
    databaseFailure(
      result.error.code,
      "We couldn’t save this brain. It may have been deleted.",
    );
  return result.data.id;
}
export async function deleteBrain(input: unknown) {
  const id = uuid.safeParse(input);
  if (!id.success) throw new PublicError("This brain could not be found.", 404);
  const { client, user } = await getSessionContext();
  const { count, error } = await client
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("brain_id", id.data)
    .eq("user_id", user.id);
  if (error)
    databaseFailure(error.code, "We couldn’t check this brain’s documents.");
  if (count)
    throw new PublicError(
      "Move or delete every document in this brain first. Your files have not been deleted.",
    );
  const result = await client
    .from("brains")
    .delete()
    .eq("id", id.data)
    .eq("user_id", user.id)
    .select("id")
    .single();
  if (result.error)
    databaseFailure(
      result.error.code,
      "We couldn’t delete this brain. It may already be gone.",
    );
}
export async function updateDocument(input: unknown) {
  const parsed = documentInput.safeParse(input);
  if (!parsed.success)
    throw new PublicError("Check the document name and destination brain.");
  const { client, user } = await getSessionContext();
  const { id, name, brainId } = parsed.data;
  const { data: brain, error: brainError } = await client
    .from("brains")
    .select("id")
    .eq("id", brainId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (brainError || !brain)
    throw new PublicError("That destination brain is not available.", 404);
  const result = await client
    .from("documents")
    .update({ display_name: name, brain_id: brainId })
    .eq("id", id)
    .eq("user_id", user.id)
    .in("processing_status", [
      "uploaded",
      "upload_failed",
      "queued",
      "complete",
      "failed",
      "unsupported",
    ])
    .select("id")
    .single();
  if (result.error)
    databaseFailure(
      result.error.code,
      "This document is busy or no longer available. Please refresh and try again.",
    );
}
export async function updateProfile(input: unknown) {
  const parsed = profileInput.safeParse(input);
  if (!parsed.success)
    throw new PublicError("Enter a display name between 1 and 80 characters.");
  const { client, user } = await getSessionContext();
  const result = await client
    .from("profiles")
    .update({ display_name: parsed.data.displayName })
    .eq("id", user.id)
    .select("id")
    .single();
  if (result.error)
    databaseFailure(result.error.code, "We couldn’t update your profile.");
}
