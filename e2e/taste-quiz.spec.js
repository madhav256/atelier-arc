import { test, expect } from "@playwright/test";
import { login, expectAccessible } from "./helpers";

async function takeQuiz(page) {
  await page.getByRole("button", { name: /The arch/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Indigo and sky/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /An intimate corner/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /1 – 5 lakh/ }).click();
  await page.getByRole("button", { name: "See my selection" }).click();
}

test("first-visit invitation leads to the quiz; guests see a tuned preview", async ({
  page,
}) => {
  await page.goto("/");
  const invite = page.getByRole("complementary", {
    name: "Taste profile invitation",
  });
  await expect(invite).toBeVisible({ timeout: 8000 });
  await invite.getByRole("link", { name: "Discover your eye" }).click();
  await expect(
    page.getByRole("heading", { name: "Which of these speaks to you?" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();
  await expectAccessible(page, "taste quiz");
  await takeQuiz(page);
  await expect(
    page.getByRole("heading", { name: /You are drawn to the arch/ }),
  ).toBeVisible();
  await expect(
    page.locator(".taste-result .art-card, .taste-result article").first(),
  ).toBeVisible();
  // The invitation does not come back once handled.
  await page.goto("/");
  await page.waitForTimeout(3500);
  await expect(invite).toHaveCount(0);
});

test("a signed-in collector saves their taste profile", async ({ page }) => {
  await login(page, "collector@atelierarc.example");
  await page.goto("/taste");
  await takeQuiz(page);
  await expect(page.getByText("Saved to your profile.")).toBeVisible();
  const profile = await page.evaluate(() =>
    fetch("/api/v1/me/profile", { credentials: "include" }).then((r) =>
      r.json(),
    ),
  );
  expect(profile.data.preferences).toMatchObject({
    styles: ["arch"],
    palettes: ["cool"],
    scale: "intimate",
    priceMin: 100000,
    priceMax: 500000,
  });
  await page.goto("/account/recommendations");
  await expect(
    page.getByRole("link", { name: "Refine your taste profile" }),
  ).toBeVisible();
});
