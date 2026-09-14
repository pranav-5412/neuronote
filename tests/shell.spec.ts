import { expect, test } from "@playwright/test";
test("protected routes redirect to a usable login screen", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/my-brain?brain=biology");
  await expect(page).toHaveURL(/\/login/);
  await expect(
    page.getByRole("heading", { name: "Good to have you back." }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeEnabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  await page.screenshot({
    path: `test-results/login-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("signup navigation, fields and dark theme fit the viewport", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Create an account" }).click();
  await expect(page).toHaveURL(/\/signup/);
  await page.getByLabel("Your name").fill("Ada Lovelace");
  await page.getByLabel("Email address").fill("ada@example.com");
  await page.getByLabel("Password", { exact: true }).fill("example-password");
  await page.evaluate(() => {
    localStorage.setItem("theme", "dark");
  });
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(
    page.getByRole("button", { name: "Create your account" }),
  ).toBeEnabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/signup-dark-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("invalid email confirmation stays local and shows a useful error", async ({
  page,
}) => {
  await page.goto(
    "/auth/confirm?token_hash=invalid&type=email&next=https://evil.test",
  );
  await expect(page).toHaveURL(/\/login\?error=confirmation/);
  await expect(
    page.getByRole("alert").filter({ hasText: "confirmation link" }),
  ).toBeVisible();
});
