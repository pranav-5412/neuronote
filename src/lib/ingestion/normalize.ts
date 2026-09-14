import type { ExtractedDocument } from "./types";
// Keep indentation, mathematical symbols and paragraph boundaries intact.
export function normalizeText(text: string) {
  return text
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\ufeff]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .replace(/^\n+|\n+$/g, "");
}
export function normalizeDocument(
  document: ExtractedDocument,
): ExtractedDocument {
  const pages = document.pages.map((page) => ({
    ...page,
    text: normalizeText(page.text),
  }));
  // Only remove repeated, explicit page-number footers. Repeated educational
  // headers are deliberately retained: repetition alone is insufficient evidence.
  if (document.format === "PDF" && pages.length >= 3) {
    const footer = /^page\s+\d+\s+(?:of|\/)\s+\d+$/i;
    if (
      pages.filter((page) => footer.test(page.text.split("\n").at(-1) || ""))
        .length >= Math.ceil(pages.length * 0.8)
    ) {
      for (const page of pages) {
        const lines = page.text.split("\n");
        if (footer.test(lines.at(-1) || ""))
          page.text = lines.slice(0, -1).join("\n").trimEnd();
      }
    }
  }
  return { ...document, pages };
}
