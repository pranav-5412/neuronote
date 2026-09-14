import { INGESTION } from "./config";
import {
  ExtractionError,
  type DocumentChunkInput,
  type ExtractedSection,
} from "./types";
export const estimateTokens = (text: string) =>
  Math.ceil(new TextEncoder().encode(text).byteLength / 4);
const sentenceSegmenter = new Intl.Segmenter("en", { granularity: "sentence" });
function splitLarge(content: string, max: number): string[] {
  if (estimateTokens(content) <= max) return [content];
  const parts: string[] = [];
  let current = "";
  const sentences = Array.from(
    sentenceSegmenter.segment(content),
    (item) => item.segment,
  );
  for (const sentence of sentences) {
    if (estimateTokens(sentence) > max) {
      if (current.trim()) parts.push(current.trim());
      current = "";
      // Exceptional oversized sentences/code lines: prefer whitespace, then
      // Unicode character boundaries as a final bounded fallback.
      let segment = "";
      for (const word of sentence.split(/(?<=\s)/u)) {
        if (estimateTokens(segment + word) > max && segment.trim()) {
          parts.push(segment.trim());
          segment = "";
        }
        if (estimateTokens(word) > max) {
          for (const char of word) {
            if (estimateTokens(segment + char) > max) {
              parts.push(segment);
              segment = "";
            }
            segment += char;
          }
        } else segment += word;
      }
      if (segment.trim()) parts.push(segment.trim());
    } else {
      if (estimateTokens(current + sentence) > max && current.trim()) {
        parts.push(current.trim());
        current = "";
      }
      current += sentence;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}
export function chunkDocument(
  sections: ExtractedSection[],
): DocumentChunkInput[] {
  const chunks: DocumentChunkInput[] = [];
  let group: ExtractedSection[] = [];
  const contentOf = (items: ExtractedSection[]) =>
    items.map((item) => item.content).join("\n\n");
  function flush() {
    if (!group.length) return;
    const content = contentOf(group);
    const pages = group.flatMap((item) =>
      item.pageNumber === null ? [] : [item.pageNumber],
    );
    const path = group[0].headingPath;
    chunks.push({
      ordinal: chunks.length,
      content,
      page_start: pages.length ? Math.min(...pages) : null,
      page_end: pages.length ? Math.max(...pages) : null,
      section_title: path.at(-1) || null,
      heading_path: path,
      character_count: content.length,
      token_count: estimateTokens(content),
    });
    if (chunks.length > INGESTION.maxChunks)
      throw new ExtractionError(
        "too_many_chunks",
        "This document has too many passages. Split it into smaller files.",
      );
  }
  for (const section of sections) {
    for (const content of splitLarge(section.content, INGESTION.maxTokens)) {
      const item = { ...section, content };
      const same =
        group.length &&
        JSON.stringify(group[0].headingPath) ===
          JSON.stringify(item.headingPath);
      if (
        group.length &&
        (!same ||
          estimateTokens(contentOf([...group, item])) > INGESTION.targetTokens)
      ) {
        const tail = group.at(-1)!;
        flush();
        group = [];
        if (same && tail.kind !== "heading") {
          const sentences = Array.from(
            sentenceSegmenter.segment(tail.content),
            (s) => s.segment.trim(),
          ).filter(Boolean);
          let overlap = "";
          for (const sentence of sentences.reverse()) {
            const next = sentence + (overlap ? " " + overlap : "");
            if (estimateTokens(next) > INGESTION.overlapTokens) break;
            overlap = next;
          }
          if (
            overlap &&
            estimateTokens(overlap + "\n\n" + content) <= INGESTION.maxTokens
          )
            group.push({ ...tail, content: overlap });
        }
      }
      group.push(item);
    }
  }
  flush();
  return chunks;
}
