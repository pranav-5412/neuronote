import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { extractDocument } from "../../src/lib/ingestion/extract";
import { normalizeText } from "../../src/lib/ingestion/normalize";
import { structureDocument } from "../../src/lib/ingestion/structure";
import { chunkDocument, estimateTokens } from "../../src/lib/ingestion/chunk";

describe("document ingestion", () => {
  it("normalizes line endings and controls while preserving indentation and symbols", () => {
    expect(
      normalizeText("  E = mc²\r\n\u0000\r\n\r\n\r\n\r\n  code()\t\r\n"),
    ).toBe("  E = mc²\n\n\n  code()");
  });

  it("retains Markdown headings, nested paths, lists, quotes, and code", () => {
    const sections = structureDocument({
      format: "Markdown",
      warnings: [],
      pages: [
        {
          pageNumber: null,
          text: "# Cells\n\n## Membranes\n\n- Lipid\n  - Protein\n\n> Remember this\n\n```ts\nconst x = 1\n```",
        },
      ],
    });
    expect(
      sections.find((item) => item.content === "Membranes")?.headingPath,
    ).toEqual(["Cells", "Membranes"]);
    expect(
      sections.some(
        (item) => item.kind === "list" && item.content.includes("Protein"),
      ),
    ).toBe(true);
    expect(sections.some((item) => item.kind === "blockquote")).toBe(true);
    expect(
      sections.some(
        (item) => item.kind === "code" && item.content.includes("const x"),
      ),
    ).toBe(true);
  });

  it("chunks long sections at sentence boundaries with bounded overlap", () => {
    const sentence =
      "Mitochondria release usable chemical energy for cellular work. ";
    const sections = [
      {
        content: "Cell respiration",
        kind: "heading" as const,
        headingPath: ["Cell respiration"],
        pageNumber: 4,
      },
      {
        content: sentence.repeat(100),
        kind: "paragraph" as const,
        headingPath: ["Cell respiration"],
        pageNumber: 4,
      },
    ];
    const chunks = chunkDocument(sections);
    expect(chunks.length).toBeGreaterThan(1);
    expect(
      chunks.every(
        (chunk) =>
          chunk.token_count <= 700 &&
          chunk.page_start === 4 &&
          chunk.page_end === 4,
      ),
    ).toBe(true);
    expect(chunks.map((chunk) => chunk.ordinal)).toEqual(
      chunks.map((_, index) => index),
    );
    expect(estimateTokens(chunks[1].content)).toBeGreaterThan(0);
  });

  it("never invents pages for TXT", async () => {
    const result = await extractDocument(
      new TextEncoder().encode("Heading\r\n\r\nA useful paragraph."),
      "TXT",
    );
    expect(result.pages).toEqual([
      { pageNumber: null, text: "Heading\r\n\r\nA useful paragraph." },
    ]);
  });

  it("rejects invalid UTF-8", async () => {
    await expect(
      extractDocument(new Uint8Array([0xc3, 0x28]), "TXT"),
    ).rejects.toMatchObject({ code: "encoding" });
  });

  it("extracts ordered text and page numbers from a multi-page PDF", async () => {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    pdf.addPage().drawText("Cell membrane page one", { x: 50, y: 700, font });
    pdf.addPage().drawText("Mitochondria page two", { x: 50, y: 700, font });
    const result = await extractDocument(await pdf.save(), "PDF");
    expect(result.pages.map((page) => page.pageNumber)).toEqual([1, 2]);
    expect(result.pages[0].text).toContain("Cell membrane");
    expect(result.pages[1].text).toContain("Mitochondria");
  });

  it("fails safely for corrupt PDFs", async () => {
    await expect(
      extractDocument(new TextEncoder().encode("not a pdf"), "PDF"),
    ).rejects.toMatchObject({ code: "invalid_pdf" });
  });
});
