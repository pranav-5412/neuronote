import { expect, test } from "vitest";
import { safeNext } from "@/lib/auth-paths";
import {
  validateFile,
  boundedFormData,
  MAX_REQUEST_BYTES,
} from "@/lib/validation/files";
test.each([
  "https://evil.test",
  "//evil.test",
  "/\\evil.test",
  "/login",
  "/%2f%2fevil.test",
  "/documents\n",
])("rejects unsafe redirect %s", (value) => expect(safeNext(value)).toBe("/"));
test("preserves known internal destination", () =>
  expect(safeNext("/documents?document=abc")).toBe("/documents?document=abc"));
test("accepts plain text and canonicalizes its type", async () =>
  expect(
    await validateFile(
      new File(["Lecture notes"], "lecture.md", { type: "text/plain" }),
    ),
  ).toMatchObject({ mime: "text/markdown", type: "Markdown" }));
test.each([
  new File(["bad"], "bad.exe"),
  new File([], "empty.txt"),
  new File(["bad"], "fake.pdf", { type: "application/pdf" }),
  new File(["text"], "../notes.txt"),
  new File(["text"], "notes.txt", { type: "text/html" }),
  new File(["\0"], "binary.txt"),
])("rejects unsafe or invalid file $name", async (file) => {
  await expect(validateFile(file)).rejects.toThrow();
});
test("validates PDF signature", async () =>
  expect(
    await validateFile(
      new File(["%PDF-1.7\n"], "book.pdf", { type: "application/pdf" }),
    ),
  ).toMatchObject({ type: "PDF" }));
test("rejects oversized request header before reading", async () => {
  await expect(
    boundedFormData(
      new Request("http://localhost", {
        method: "POST",
        headers: { "content-length": String(MAX_REQUEST_BYTES + 1) },
        body: "x",
      }),
    ),
  ).rejects.toThrow(/large/);
});
test("rejects actual oversized body even with no length header", async () => {
  await expect(
    boundedFormData(
      new Request("http://localhost", {
        method: "POST",
        body: new Uint8Array(MAX_REQUEST_BYTES + 1),
      }),
    ),
  ).rejects.toThrow(/large/);
});
test("reads valid multipart material", async () => {
  const form = new FormData();
  form.set("file", new File(["notes"], "notes.txt"));
  expect(
    (
      await boundedFormData(
        new Request("http://localhost", { method: "POST", body: form }),
      )
    ).get("file"),
  ).toBeInstanceOf(File);
});

test("checks browser origin against request host rather than internal server hostname", async () => {
  const { sameOriginRequest } = await import("@/lib/validation/origin");
  expect(
    sameOriginRequest(
      new Request("http://localhost:3100", {
        headers: { origin: "http://127.0.0.1:3100", host: "127.0.0.1:3100" },
      }),
    ),
  ).toBe(true);
  for (const origin of [
    "https://evil.test",
    "null",
    "https://user@site.test",
    "http://site.test:88",
    "https://site.test/",
  ])
    expect(
      sameOriginRequest(
        new Request("https://site.test", {
          headers: { origin, host: "site.test" },
        }),
      ),
    ).toBe(false);
});
