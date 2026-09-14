export interface ExtractedPage {
  pageNumber: number | null;
  text: string;
}
export interface ExtractedDocument {
  format: "PDF" | "TXT" | "Markdown";
  pages: ExtractedPage[];
  warnings: string[];
}
export interface ExtractedSection {
  content: string;
  kind: "heading" | "paragraph" | "list" | "code" | "blockquote";
  headingPath: string[];
  pageNumber: number | null;
}
export interface DocumentChunkInput {
  ordinal: number;
  content: string;
  page_start: number | null;
  page_end: number | null;
  section_title: string | null;
  heading_path: string[];
  character_count: number;
  token_count: number;
}
export class ExtractionError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ExtractionError";
  }
}
