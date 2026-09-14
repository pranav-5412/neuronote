import "server-only";
import { getSessionContext } from "@/lib/repositories/session";
import { PublicError } from "@/lib/result";
import { uuid } from "@/lib/validation/input";
import { validateFile } from "@/lib/validation/files";
const bucket = "study-documents";
export async function uploadDocument(
  file: File,
  brainId: string,
  pasted = false,
) {
  const parsed = uuid.safeParse(brainId);
  if (!parsed.success) throw new PublicError("Choose a valid brain.");
  const checked = await validateFile(file);
  if (pasted && checked.type !== "TXT")
    throw new PublicError("Pasted material must be plain text.");
  const { client, user } = await getSessionContext();
  const { data: brain, error: brainError } = await client
    .from("brains")
    .select("id")
    .eq("id", brainId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (brainError || !brain)
    throw new PublicError("This brain is no longer available.", 404);
  const id = crypto.randomUUID();
  const storagePath = `${user.id}/${id}/${crypto.randomUUID()}.${checked.extension}`;
  const { error: insertError } = await client.from("documents").insert({
    id,
    user_id: user.id,
    brain_id: brainId,
    original_filename: checked.name,
    display_name: checked.name.slice(0, 180),
    file_type: pasted ? "Pasted text" : checked.type,
    mime_type: checked.mime,
    file_size: file.size,
    storage_path: storagePath,
    processing_status: "uploading",
  });
  if (insertError)
    throw new PublicError(
      "We couldn’t prepare this document for upload. Please try again.",
      503,
    );
  // Metadata stays visible on every failure; never silently lose track of an object.
  try {
    const { error: uploadError } = await client.storage
      .from(bucket)
      .upload(storagePath, file, {
        contentType: checked.mime,
        upsert: false,
        cacheControl: "0",
      });
    if (uploadError) throw new Error("storage-upload");
    const { error: finalizeError } = await client
      .from("documents")
      .update({
        processing_status: "uploaded",
        processing_progress: 0,
        processing_error: null,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("processing_status", "uploading")
      .select("id")
      .single();
    if (finalizeError) throw new Error("metadata-finalize");
    return id;
  } catch {
    await client
      .from("documents")
      .update({
        processing_status: "upload_failed",
        processing_error:
          "Upload interrupted. Remove this document and upload again.",
      })
      .eq("id", id)
      .eq("user_id", user.id);
    const { error: cleanupError } = await client.storage
      .from(bucket)
      .remove([storagePath]);
    const message = cleanupError
      ? "The upload could not finish. Delete this incomplete document to clean up its private file, then upload again."
      : "The upload did not finish. Delete this incomplete document and upload again.";
    await client
      .from("documents")
      .update({ processing_status: "upload_failed", processing_error: message })
      .eq("id", id)
      .eq("user_id", user.id);
    throw new PublicError(message, 503);
  }
}
export async function deleteDocument(input: unknown) {
  const parsed = uuid.safeParse(input);
  if (!parsed.success)
    throw new PublicError("This document is not available.", 404);
  const { client, user } = await getSessionContext();
  const { data: doc, error } = await client
    .from("documents")
    .select("*")
    .eq("id", parsed.data)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error)
    throw new PublicError("We couldn’t load this document. Try again.", 503);
  if (!doc) return;
  // Interrupted uploads remain recoverable; do not race an active upload request.
  if (
    doc.processing_status === "uploading" &&
    Date.now() - Date.parse(doc.updated_at) < 120000
  )
    throw new PublicError(
      "This upload is still in progress. Wait two minutes before removing an interrupted upload.",
    );
  const { error: markError } = await client
    .from("documents")
    .update({ processing_status: "deleting", processing_error: null })
    .eq("id", doc.id)
    .eq("user_id", user.id)
    .eq("updated_at", doc.updated_at)
    .select("id")
    .single();
  if (markError)
    throw new PublicError(
      "This document changed while you were working. Refresh and try again.",
    );
  try {
    const { error: storageError } = await client.storage
      .from(bucket)
      .remove([doc.storage_path]);
    if (storageError) throw new Error("storage-delete");
    const { error: deleteError } = await client
      .from("documents")
      .delete()
      .eq("id", doc.id)
      .eq("user_id", user.id)
      .select("id")
      .single();
    if (deleteError) throw new Error("metadata-delete");
  } catch {
    await client
      .from("documents")
      .update({
        processing_status: "delete_failed",
        processing_error:
          "Deletion did not finish. Retry deletion to safely finish cleanup.",
      })
      .eq("id", doc.id)
      .eq("user_id", user.id);
    throw new PublicError(
      "Deletion did not finish. Your document is still listed so you can retry safely.",
      503,
    );
  }
}
export async function documentDownload(id: string) {
  if (!uuid.safeParse(id).success)
    throw new PublicError("This document is not available.", 404);
  const { client, user } = await getSessionContext();
  const { data: doc, error } = await client
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !doc)
    throw new PublicError("This document is not available.", 404);
  if (
    !["uploaded", "queued", "processing", "complete", "failed"].includes(
      doc.processing_status,
    )
  )
    throw new PublicError("This file is not ready to download.");
  const { data, error: storageError } = await client.storage
    .from(bucket)
    .createSignedUrl(doc.storage_path, 60, { download: doc.original_filename });
  if (storageError || !data)
    throw new PublicError(
      "We couldn’t open this private file. Please try again.",
      503,
    );
  return data.signedUrl;
}
