import { Worker } from "node:worker_threads";
import path from "node:path";
import { INGESTION } from "./config";
import { ExtractionError, type ExtractedDocument } from "./types";
let workers = 0;
export async function extractDocument(
  bytes: Uint8Array,
  format: "PDF" | "TXT" | "Markdown",
  signal?: AbortSignal,
): Promise<ExtractedDocument> {
  if (bytes.byteLength > INGESTION.maxFileBytes)
    throw new ExtractionError("file_too_large", "Choose a file up to 25 MB.");
  if (format !== "PDF") {
    let text: string;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      throw new ExtractionError(
        "encoding",
        "Save this text file as UTF-8 and upload it again.",
      );
    }
    if (text.length > INGESTION.maxCharacters)
      throw new ExtractionError(
        "text_too_large",
        "This document contains too much text. Split it into smaller files.",
      );
    return { format, pages: [{ pageNumber: null, text }], warnings: [] };
  }
  if (workers >= INGESTION.maxWorkers)
    throw new ExtractionError(
      "busy",
      "The extractor is busy. Try processing this document again shortly.",
    );
  if (signal?.aborted)
    throw new ExtractionError(
      "timeout",
      "Processing took too long. Try a smaller document.",
    );
  workers++;
  try {
    return await new Promise<ExtractedDocument>((resolve, reject) => {
      const worker = new Worker(
        path.join(process.cwd(), "scripts/pdf-extract-worker.mjs"),
        {
          workerData: {
            bytes,
            maxPages: INGESTION.maxPages,
            maxCharacters: INGESTION.maxCharacters,
          },
          resourceLimits: { maxOldGenerationSizeMb: 256 },
        },
      );
      let settled = false;
      const done = (error?: Error, result?: ExtractedDocument) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal?.removeEventListener("abort", abort);
        void worker.terminate();
        if (error) reject(error);
        else resolve(result!);
      };
      const abort = () =>
        done(
          new ExtractionError(
            "timeout",
            "Processing took too long. Try a smaller document.",
          ),
        );
      const timer = setTimeout(abort, INGESTION.timeoutMs);
      signal?.addEventListener("abort", abort, { once: true });
      worker.on(
        "message",
        (message: { result?: ExtractedDocument; code?: string }) =>
          message.result
            ? done(undefined, message.result)
            : done(
                new ExtractionError(
                  message.code || "invalid_pdf",
                  message.code === "encrypted"
                    ? "This PDF is password-protected. Upload an unlocked copy."
                    : message.code === "page_limit"
                      ? "This PDF exceeds the 300-page limit. Split it into smaller files."
                      : message.code === "text_limit"
                        ? "This PDF contains too much text. Split it into smaller files."
                        : "This PDF could not be read. Try exporting a new copy.",
                ),
              ),
      );
      worker.on("error", () =>
        done(
          new ExtractionError(
            "invalid_pdf",
            "This PDF could not be read. Try exporting a new copy.",
          ),
        ),
      );
      worker.on("exit", (code) => {
        if (!settled)
          done(
            new ExtractionError(
              "worker_exit",
              `The PDF extractor stopped (${code}). Try a smaller file.`,
            ),
          );
      });
    });
  } finally {
    workers--;
  }
}
