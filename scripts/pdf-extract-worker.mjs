import { parentPort, workerData } from "node:worker_threads";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
// Parsing is isolated so timeout/memory failures can terminate the work.
let task;
try {
  task = getDocument({
    data: new Uint8Array(workerData.bytes),
    isEvalSupported: false,
    useSystemFonts: false,
    disableFontFace: true,
    verbosity: 0,
  });
  const pdf = await task.promise;
  if (pdf.numPages > workerData.maxPages) throw { code: "page_limit" };
  const pages = [];
  let characters = 0;
  for (let number = 1; number <= pdf.numPages; number++) {
    const page = await pdf.getPage(number);
    const result = await page.getTextContent();
    let text = "",
      previous = null;
    for (const item of result.items) {
      if (!("str" in item)) continue;
      if (previous) {
        const gap = Math.abs(item.transform[5] - previous.transform[5]);
        const height = Math.max(item.height, previous.height, 1);
        if (gap > height * 0.5 && !text.endsWith("\n")) text += "\n";
        if (gap > height * 1.7 && !text.endsWith("\n\n")) text += "\n";
        if (
          gap <= height * 0.5 &&
          !text.endsWith("\n") &&
          !/\s$/.test(text) &&
          item.transform[4] >
            previous.transform[4] + previous.width + height * 0.1
        )
          text += " ";
      }
      text += item.str;
      if (item.hasEOL) text += "\n";
      previous = item;
      if (text.length + characters > workerData.maxCharacters)
        throw { code: "text_limit" };
    }
    characters += text.length;
    pages.push({ pageNumber: number, text });
    page.cleanup();
  }
  parentPort.postMessage({
    result: {
      format: "PDF",
      pages,
      warnings: pages.some((page) => !page.text.trim())
        ? ["Some pages have no selectable text. OCR is not available yet."]
        : [],
    },
  });
} catch (error) {
  parentPort.postMessage({
    code:
      error?.name === "PasswordException"
        ? "encrypted"
        : error?.code || "invalid_pdf",
  });
} finally {
  await task?.destroy();
}
