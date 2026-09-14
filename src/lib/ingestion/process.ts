import "server-only";
import { getSessionContext } from "@/lib/repositories/session";
import { PublicError } from "@/lib/result";
import { uuid } from "@/lib/validation/input";
import { INGESTION, activeStages, type ProcessingStage } from "./config";
import { extractDocument } from "./extract";
import { normalizeDocument } from "./normalize";
import { structureDocument } from "./structure";
import { chunkDocument } from "./chunk";
import { ExtractionError } from "./types";

export async function processDocument(id: string) {
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
  const { data: brain } = await client
    .from("brains")
    .select("id")
    .eq("id", doc.brain_id)
    .eq("user_id", user.id)
    .maybeSingle();
  const parts = doc.storage_path.split("/");
  if (
    !brain ||
    parts.length !== 3 ||
    parts[0] !== user.id ||
    parts[1] !== id ||
    !parts[2] ||
    [".", ".."].includes(parts[2]) ||
    doc.storage_path.includes("\\")
  )
    throw new PublicError(
      "This document’s private file could not be verified.",
      403,
    );
  if (
    ["uploading", "upload_failed", "deleting", "delete_failed"].includes(
      doc.processing_status,
    )
  )
    throw new PublicError(
      "Finish uploading or deleting this document first.",
      409,
    );
  if (
    doc.processing_run_id &&
    doc.processing_started_at &&
    Date.now() - Date.parse(doc.processing_started_at) < INGESTION.leaseMs
  )
    throw new PublicError("This document is already processing.", 409);
  const run = crypto.randomUUID(),
    started = Date.now();
  const { error: claim } = await client
    .from("documents")
    .update({
      processing_status: "validating",
      processing_run_id: run,
      processing_started_at: new Date(started).toISOString(),
      processing_error: null,
      processing_progress: 0,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("updated_at", doc.updated_at)
    .select("id")
    .single();
  if (claim)
    throw new PublicError("This document changed. Refresh and try again.", 409);
  let stage: ProcessingStage = "validating";
  const signal = AbortSignal.timeout(INGESTION.timeoutMs);
  const advance = async (next: ProcessingStage) => {
    signal.throwIfAborted();
    const { error } = await client
      .from("documents")
      .update({ processing_status: next })
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("processing_run_id", run)
      .eq("processing_status", stage)
      .select("id")
      .single();
    if (error)
      throw new ExtractionError(
        "status_save",
        "We couldn’t update processing. Please try again.",
      );
    stage = next;
  };
  console.info("[NeuroNote] Processing started", { documentId: id });
  try {
    if (!["PDF", "TXT", "Markdown", "Pasted text"].includes(doc.file_type)) {
      const message =
        "Extraction support coming soon for this format. Your original file is stored privately.";
      const { error } = await client
        .from("documents")
        .update({
          processing_status: "unsupported",
          processing_error: message,
          processing_run_id: null,
          processing_started_at: null,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .eq("processing_run_id", run)
        .select("id")
        .single();
      if (error)
        throw new ExtractionError(
          "status_save",
          "We couldn’t save the document status. Try again.",
        );
      return { status: "unsupported" as const, error: message };
    }
    if (doc.file_size > INGESTION.maxFileBytes)
      throw new ExtractionError("file_limit", "Choose a file up to 25 MB.");
    await advance("extracting");
    // Storage uses the user's session and RLS. No service-role key or public URL.
    const download = client.storage
      .from("study-documents")
      .download(doc.storage_path);
    const { data: file, error: downloadError } = await new Promise<
      Awaited<typeof download>
    >((resolve, reject) => {
      const abort = () =>
        reject(
          new ExtractionError(
            "timeout",
            "Processing took too long. Try a smaller file.",
          ),
        );
      signal.addEventListener("abort", abort, { once: true });
      Promise.resolve(download)
        .then(resolve, reject)
        .finally(() => signal.removeEventListener("abort", abort));
    });
    if (downloadError || !file)
      throw new ExtractionError(
        "download",
        "We couldn’t retrieve your private file. Try processing again.",
      );
    if (file.size !== doc.file_size)
      throw new ExtractionError(
        "file_changed",
        "The stored file does not match its document. Upload a new copy.",
      );
    const format =
      doc.file_type === "PDF"
        ? "PDF"
        : doc.file_type === "Markdown"
          ? "Markdown"
          : "TXT";
    const extracted = await extractDocument(
      new Uint8Array(await file.arrayBuffer()),
      format,
      signal,
    );
    await advance("cleaning");
    const normalized = normalizeDocument(extracted);
    if (!normalized.pages.some((page) => page.text.trim()))
      throw new ExtractionError(
        "empty",
        format === "PDF"
          ? "This PDF appears to contain scanned images or no text. OCR support is not available yet."
          : "This file contains no readable text. Add some content and upload it again.",
      );
    await advance("structuring");
    const sections = structureDocument(normalized);
    await advance("chunking");
    const chunks = chunkDocument(sections);
    if (!chunks.length)
      throw new ExtractionError(
        "empty",
        "No readable passages were found in this document.",
      );
    await advance("saving");
    const { error: saveError } = await client.rpc(
      "complete_document_extraction",
      {
        p_document_id: id,
        p_run_id: run,
        p_pages: normalized.pages.map((page) => ({ ...page })),
        p_chunks: chunks.map((chunk) => ({ ...chunk })),
        p_version: INGESTION.version,
        p_warnings: normalized.warnings,
      },
    );
    if (saveError)
      throw new ExtractionError(
        "save",
        "We couldn’t save the extracted text. Any previous extraction is safe. Try again.",
      );
    console.info("[NeuroNote] Extraction complete", {
      documentId: id,
      pages: format === "PDF" ? normalized.pages.length : null,
      characters: normalized.pages.reduce(
        (sum, page) => sum + page.text.length,
        0,
      ),
      chunks: chunks.length,
      durationMs: Date.now() - started,
    });
    return { status: "complete" as const };
  } catch (error) {
    const message = signal.aborted
      ? "Processing took too long. Try a smaller document."
      : error instanceof ExtractionError
        ? error.message
        : "This document could not be processed. Try again or upload a new copy.";
    const { error: failureError } = await client
      .from("documents")
      .update({
        processing_status: "failed",
        processing_error: message,
        processing_run_id: null,
        processing_started_at: null,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("processing_run_id", run)
      .in("processing_status", [...activeStages]);
    console.warn("[NeuroNote] Extraction failed", {
      documentId: id,
      stage,
      code: error instanceof ExtractionError ? error.code : "processing",
      durationMs: Date.now() - started,
      statusSaved: !failureError,
    });
    return { status: "failed" as const, error: message };
  }
}
