import { expect, test, type Page } from "@playwright/test";
async function filters(page: Page) {
  const button = page.getByRole("button", { name: /^Filters/ });
  if (await button.isVisible()) await button.click();
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
test("brain edit and deletion remain consistent across client navigation", async ({
  page,
}) => {
  await page.goto("/my-brain");
  await page
    .getByRole("button", { name: "Rename Physics", exact: true })
    .click();
  await page.getByLabel("Brain name").fill("Physics · Mechanics");
  await page
    .getByLabel("Description")
    .fill("Motion, energy, and the rules of our universe.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("heading", { name: "Physics · Mechanics", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Search your brain" }).click();
  await page.getByRole("combobox").fill("Physics · Mechanics");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { level: 1, name: "Physics · Mechanics" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete brain", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Physics · Mechanics" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete brain", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Physics · Mechanics", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Search your brain" }).click();
  await page.getByRole("combobox").fill("Documents page");
  await page.keyboard.press("Enter");
  await expect(
    page.locator("article").filter({ hasText: "Laws of Motion.pdf" }),
  ).toHaveCount(0);
});
test("library filtering, sorting, views, and responsive workspaces", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/documents");
  await noOverflow(page);
  await page.screenshot({
    path: `test-results/phase2-${info.project.name}-library.png`,
    fullPage: true,
  });
  await filters(page);
  await page.getByLabel("Filter by brain").selectOption("biology");
  await page.getByLabel("Filter by file type").selectOption("PDF");
  await expect(page.locator("article")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.getByLabel("Filter by status").selectOption("Failed");
  await expect(page.locator("article")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.getByLabel("Sort documents").selectOption("name");
  await expect(page.locator("article").first()).toContainText("Cell Biology");
  await page.getByRole("button", { name: "Grid view", exact: true }).click();
  await expect(page.locator(".document-collection")).toHaveClass(/grid/);
  await noOverflow(page);
  await page.getByLabel("Search documents").fill("absent-xyz");
  await expect(
    page.getByRole("heading", { name: "No documents found." }),
  ).toBeVisible();
  await page.goto("/my-brain?brain=biology");
  await expect(
    page.getByRole("heading", { level: 1, name: "Biology" }),
  ).toBeVisible();
  await noOverflow(page);
  await page.screenshot({
    path: `test-results/phase2-${info.project.name}-brain.png`,
    fullPage: true,
  });
  for (const tab of [
    "Documents",
    "Notes",
    "Concepts",
    "Flashcards",
    "Quizzes",
    "Overview",
  ]) {
    await page
      .getByRole("tab", { name: tab, exact: tab !== "Documents" })
      .click();
    await expect(page.getByRole("tabpanel")).toBeVisible();
    await noOverflow(page);
  }
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await page.screenshot({
    path: `test-results/phase2-${info.project.name}-brain-dark.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("multi-file queue validates files, simulates a failure, and retries", async ({
  page,
}) => {
  await page.goto("/documents");
  await page.clock.install();
  await page
    .getByRole("button", { name: "Add documents", exact: true })
    .click();
  const picker = page.getByLabel("Choose study files");
  await picker.setInputFiles([
    {
      name: "unsupported.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("demo"),
    },
    { name: "Empty.txt", mimeType: "text/plain", buffer: Buffer.from("") },
  ]);
  await expect(page.getByRole("alert")).toContainText("not supported");
  await expect(page.getByRole("alert")).toContainText("non-empty");
  await picker.setInputFiles([
    {
      name: "Study chapter.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("mock file metadata only"),
    },
    {
      name: "Lecture.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Sample lecture"),
    },
    {
      name: "Remove me.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("Sample"),
    },
  ]);
  await page
    .getByRole("button", { name: "Remove Remove me.md", exact: true })
    .click();
  await page.getByLabel("Add to brain").selectOption("biology");
  await page
    .getByLabel("Simulate a failure on the first document", { exact: false })
    .check();
  await page
    .getByRole("button", { name: "Start demo processing · 2", exact: true })
    .click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  const chapter = page
    .locator("article")
    .filter({ hasText: "Study chapter.pdf" });
  await expect(chapter).toContainText("Waiting");
  await page.clock.runFor(1000);
  await expect(chapter).toContainText("Uploading");
  await page.clock.runFor(10000);
  await expect(chapter).toContainText("Failed");
  await expect(
    page.locator("article").filter({ hasText: "Lecture.txt" }),
  ).toContainText("Complete");
  await chapter
    .getByRole("button", { name: "Retry Study chapter.pdf", exact: true })
    .click();
  await page.clock.runFor(10000);
  await expect(chapter).toContainText("Complete");
  await chapter
    .getByRole("link", { name: "Study chapter.pdf", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Concepts 3" })).toBeVisible();
  await page
    .getByRole("button", { name: "Extracted text", exact: true })
    .click();
  await expect(page.locator("pre")).toContainText("predefined demo text");
});
test("pasted text, move, rename, viewer controls, reprocess and delete", async ({
  page,
}, info) => {
  await page.goto("/documents");
  await page.clock.install();
  await page
    .getByRole("button", { name: "Add documents", exact: true })
    .click();
  await page.getByRole("button", { name: "Paste text", exact: true }).click();
  await page.getByLabel("Text title").fill("Lecture reflections");
  await page
    .getByLabel("Your text", { exact: true })
    .fill("The mitochondrion is involved in aerobic respiration.");
  await page
    .getByRole("button", { name: "Add text to queue", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start demo processing · 1", exact: true })
    .click();
  await page.clock.runFor(10000);
  const row = page
    .locator("article")
    .filter({ hasText: "Lecture reflections" });
  await row
    .getByRole("button", {
      name: "Rename or move Lecture reflections",
      exact: true,
    })
    .click();
  await page.getByLabel("Document name").fill("Respiration reflections");
  await page.getByLabel("Move to brain").selectOption("chemistry");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page
    .locator("article")
    .filter({ hasText: "Respiration reflections" })
    .getByRole("link", { name: "Respiration reflections", exact: true })
    .click();
  await expect(page.locator(".viewer-sidebar")).toContainText("Chemistry");
  await page
    .getByRole("button", { name: "Extracted text", exact: true })
    .click();
  await expect(page.locator("pre")).toContainText("mitochondrion");
  await page
    .getByRole("button", {
      name: "Reprocess Respiration reflections",
      exact: true,
    })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reprocess", exact: true })
    .click();
  await page.clock.runFor(10000);
  await expect(page.locator("pre")).toContainText("mitochondrion");
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(page.getByLabel("Zoom level")).toHaveText("125%");
  await page
    .getByRole("button", { name: "Fullscreen preview", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Document preview" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Document preview" }),
  ).toHaveCount(0);
  await noOverflow(page);
  await page.screenshot({
    path: `test-results/phase2-${info.project.name}-viewer.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", {
      name: "Delete Respiration reflections",
      exact: true,
    })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page).toHaveURL(/\/documents$/);
  await expect(
    page.locator("article").filter({ hasText: "Respiration reflections" }),
  ).toHaveCount(0);
});
test("preview pagination and missing records behave safely", async ({
  page,
}) => {
  await page.goto("/documents?document=doc-1");
  await expect(page.getByLabel("Current page")).toHaveText("1 / 18");
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(page.getByLabel("Current page")).toHaveText("2 / 18");
  await page
    .getByRole("button", { name: "Previous page", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Previous page", exact: true }),
  ).toBeDisabled();
  await page.goto("/documents?document=missing");
  await expect(
    page.getByRole("heading", { name: "This document is no longer here." }),
  ).toBeVisible();
  await page.goto("/my-brain?brain=missing");
  await expect(
    page.getByRole("heading", { name: "This brain is no longer here." }),
  ).toBeVisible();
});
