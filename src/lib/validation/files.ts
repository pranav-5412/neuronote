import { PublicError } from "@/lib/result";
import { MAX_FILE_SIZE } from "@/lib/document-utils";
import type { FileType } from "@/types/workspace";
const formats: Record<
  string,
  { mime: string; type: FileType; signature?: number[] }
> = {
  pdf: {
    mime: "application/pdf",
    type: "PDF",
    signature: [37, 80, 68, 70, 45],
  },
  docx: {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    type: "DOCX",
    signature: [80, 75, 3, 4],
  },
  pptx: {
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    type: "PPTX",
    signature: [80, 75, 3, 4],
  },
  txt: { mime: "text/plain", type: "TXT" },
  md: { mime: "text/markdown", type: "Markdown" },
  markdown: { mime: "text/markdown", type: "Markdown" },
  png: {
    mime: "image/png",
    type: "Image",
    signature: [137, 80, 78, 71, 13, 10, 26, 10],
  },
  jpg: { mime: "image/jpeg", type: "Image", signature: [255, 216, 255] },
  jpeg: { mime: "image/jpeg", type: "Image", signature: [255, 216, 255] },
  webp: { mime: "image/webp", type: "Image", signature: [82, 73, 70, 70] },
  gif: { mime: "image/gif", type: "Image", signature: [71, 73, 70, 56] },
};
export async function validateFile(file: File) {
  const name = file.name;
  if (
    !name ||
    name.length > 255 ||
    /[\\/\x00-\x1f\x7f]/.test(name) ||
    name === "." ||
    name === ".."
  )
    throw new PublicError(
      "Use a filename without slashes or control characters.",
    );
  const extension = name.split(".").at(-1)?.toLowerCase() ?? "";
  const format = formats[extension];
  if (!format) throw new PublicError("This file format is not supported.");
  if (!file.size || file.size > MAX_FILE_SIZE)
    throw new PublicError("Choose a non-empty file up to 25 MB.");
  const declared = file.type.toLowerCase().split(";")[0];
  const allowed = [format.mime, "", "application/octet-stream"];
  if (format.type === "Markdown") allowed.push("text/plain", "text/x-markdown");
  if (["DOCX", "PPTX"].includes(format.type))
    allowed.push("application/zip", "application/x-zip-compressed");
  if (!allowed.includes(declared))
    throw new PublicError("This file’s type does not match its extension.");
  const head = new Uint8Array(await file.slice(0, 4096).arrayBuffer());
  if (
    format.signature &&
    !format.signature.every((byte, index) => head[index] === byte)
  )
    throw new PublicError("The file contents do not match this format.");
  if (
    extension === "webp" &&
    String.fromCharCode(...head.slice(8, 12)) !== "WEBP"
  )
    throw new PublicError("This is not a valid WebP file.");
  if (["txt", "md", "markdown"].includes(extension) && head.includes(0))
    throw new PublicError("Choose a plain-text file, not a binary file.");
  return { ...format, extension, name };
}
export const MAX_REQUEST_BYTES = 26 * 1024 * 1024;
export async function boundedFormData(request: Request) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_REQUEST_BYTES)
    throw new PublicError("This upload is too large.", 413);
  if (!request.body) throw new PublicError("Choose a file to upload.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_REQUEST_BYTES) {
        await reader.cancel();
        throw new PublicError("This upload is too large.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    return await new Response(bytes, {
      headers: { "Content-Type": request.headers.get("content-type") ?? "" },
    }).formData();
  } catch {
    throw new PublicError("The upload request is invalid.");
  }
}
