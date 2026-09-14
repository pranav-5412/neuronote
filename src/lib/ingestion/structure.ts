import { fromMarkdown } from "mdast-util-from-markdown";
import type { RootContent } from "mdast";
import type { ExtractedDocument, ExtractedSection } from "./types";
function plain(node: RootContent): string {
  if (node.type === "code")
    return `\`\`\`${node.lang || ""}\n${node.value}\n\`\`\``;
  if (node.type === "list")
    return node.children
      .map(
        (item, i) =>
          `${node.ordered ? `${(node.start || 1) + i}.` : "-"} ${plain(item)}`,
      )
      .join("\n");
  if (node.type === "blockquote")
    return node.children.map((child) => `> ${plain(child)}`).join("\n");
  if ("value" in node) return node.value;
  if ("children" in node)
    return node.children
      .map((child) => plain(child))
      .join(node.type === "listItem" ? "\n" : "");
  if (node.type === "image" || node.type === "imageReference")
    return node.alt || "";
  return "";
}
export function structureDocument(
  document: ExtractedDocument,
): ExtractedSection[] {
  const sections: ExtractedSection[] = [];
  let path: string[] = [];
  for (const page of document.pages) {
    if (document.format === "Markdown") {
      for (const node of fromMarkdown(page.text).children) {
        const content = plain(node).trim();
        if (!content) continue;
        if (node.type === "heading")
          path = [...path.slice(0, node.depth - 1), content];
        const kind = ["heading", "list", "code", "blockquote"].includes(
          node.type,
        )
          ? (node.type as ExtractedSection["kind"])
          : "paragraph";
        sections.push({
          content,
          kind,
          headingPath: [...path],
          pageNumber: null,
        });
      }
    } else {
      for (const block of page.text.split(/\n\s*\n/).filter(Boolean)) {
        const heading =
          !block.includes("\n") &&
          block.length <= 100 &&
          /^(?:(?:chapter|section|part)\s+[\dIVX]+\b|\d+(?:\.\d+)*\.?\s+\p{Lu})/iu.test(
            block,
          );
        if (heading) path = [block];
        sections.push({
          content: block,
          kind: heading
            ? "heading"
            : /^\s*(?:[-*•]|\d+[.)])\s/m.test(block)
              ? "list"
              : "paragraph",
          headingPath: [...path],
          pageNumber: page.pageNumber,
        });
      }
    }
  }
  return sections;
}
