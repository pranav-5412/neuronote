import { expect, test } from "@playwright/test";
test("dashboard fits viewport and all navigation routes render", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Good evening, Pranav" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-light.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-dark.png`,
    fullPage: true,
  });
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  for (const [route, title] of [
    ["my-brain", "My Brain"],
    ["documents", "Documents"],
    ["notes", "Notes"],
    ["knowledge-graph", "Knowledge Graph"],
    ["flashcards", "Flashcards"],
    ["quizzes", "Quizzes"],
    ["progress", "Progress"],
    ["ai-tutor", "AI Tutor"],
    ["settings", "Settings"],
  ]) {
    await page.goto(`/${route}`);
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});
test("search supports keyboard navigation and empty results", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole("combobox");
  await input.fill("xyz-not-a-subject");
  await expect(
    dialog.getByText("No matches. Try a subject or page name."),
  ).toBeVisible();
  await input.fill("Physics");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/my-brain\?brain=physics/);
  await expect(
    page.getByRole("heading", { name: "Physics", exact: true }),
  ).toBeVisible();
});
test("workspace creation validates and shows a useful empty brain", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "New brain", exact: true }).click();
  await page.getByRole("button", { name: "Create brain", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Give your brain a name");
  await page.getByLabel("Brain name").fill("Biology");
  await page.getByRole("button", { name: "Create brain", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("already exists");
  await page.getByLabel("Brain name").fill("Computer Science");
  await page.getByRole("button", { name: "Create brain", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("link")
    .filter({ has: page.getByRole("heading", { name: "Computer Science" }) })
    .click();
  await expect(
    page.getByText("A fresh brain, ready for ideas.", { exact: false }),
  ).toBeVisible();
});
test("responsive sidebar navigates and restores focus", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  if (testInfo.project.name === "mobile") {
    const trigger = page.getByRole("button", { name: "Open navigation" });
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "Documents", exact: true })
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page).toHaveURL(/documents/);
  } else {
    await page.getByRole("button", { name: "Collapse sidebar" }).click();
    await expect(
      page.getByRole("button", { name: "Expand sidebar" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Documents", exact: true }).click();
    await expect(page).toHaveURL(/documents/);
  }
});
test("continue studying is clearly a phase one placeholder", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Continue studying" }).click();
  await expect(page).toHaveURL(/flashcards\?topic=tissues/);
  await expect(
    page.getByText("Flashcard review is planned", { exact: false }),
  ).toBeVisible();
});
