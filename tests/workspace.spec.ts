import { expect, test } from "@playwright/test";
test("file endpoints reject unconfigured/unauthenticated requests", async ({
  request,
}) => {
  const download = await request.get(
    "/api/documents/11111111-1111-4111-8111-111111111111/download",
  );
  expect([401, 503]).toContain(download.status());
  expect((await download.json()).ok).toBe(false);
  const upload = await request.post("/api/documents/upload", {
    headers: { origin: "http://127.0.0.1:3100" },
  });
  expect([401, 503]).toContain(upload.status());
  const crossOrigin = await request.post("/api/documents/upload", {
    headers: { origin: "https://evil.test" },
  });
  expect(crossOrigin.status()).toBe(403);
});
