import type { FileType } from "@/types/workspace";
export const MAX_FILE_SIZE = 25 * 1024 * 1024;
export const fileAccept =
  ".pdf,.docx,.pptx,.txt,.md,.markdown,.png,.jpg,.jpeg,.webp,.gif";
export function fileType(name: string): FileType | null {
  const ext = name.split(".").pop()?.toLowerCase();
  return (
    (
      {
        pdf: "PDF",
        docx: "DOCX",
        pptx: "PPTX",
        txt: "TXT",
        md: "Markdown",
        markdown: "Markdown",
        png: "Image",
        jpg: "Image",
        jpeg: "Image",
        webp: "Image",
        gif: "Image",
      } as Record<string, FileType>
    )[ext ?? ""] ?? null
  );
}
export function formatSize(bytes: number) {
  return bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
