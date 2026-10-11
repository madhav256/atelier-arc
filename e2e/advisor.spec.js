import { test, expect } from "@playwright/test";
import { expectAccessible } from "./helpers";

test("Private Advisor answers from the catalogue and links to the works", async ({ page }) => {
  await page.goto("/advisor");
  await expect(page.getByRole("heading", { name: /Tell us about the wall/ })).toBeVisible();
  await expectAccessible(page, "private advisor");

  const box = page.getByLabel("Describe what you are looking for");
  await box.fill("A quiet warm piece for a study, under 5 lakh");
  await page.getByRole("button", { name: "Send" }).click();

  const log = page.getByRole("list", { name: "Conversation" });
  await expect(log.getByText("A quiet warm piece for a study, under 5 lakh")).toBeVisible();
  const first = log.locator(".advisor-pick h3 a").first();
  await expect(first).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(1200); // let the entrance fade finish before measuring contrast
  await expectAccessible(page, "private advisor with picks");

  // Every suggestion is a real work in the collection, within budget.
  const prices = await log.locator(".advisor-pick-price").allInnerTexts();
  expect(prices.length).toBeGreaterThan(0);
  for (const p of prices) {
    const n = Number(p.replace(/[^\d]/g, ""));
    if (n) expect(n).toBeLessThanOrEqual(500000);
  }
  await first.click();
  await expect(page).toHaveURL(/\/artworks\//);
});

test("an opener starts the conversation and the footer links to the advisor", async ({ page }) => {
  await page.goto("/advisor");
  await page.getByRole("button", { name: /Cool blues for a bedroom/ }).click();
  await expect(page.locator(".advisor-turn.is-assistant").first()).toBeVisible({ timeout: 10000 });
  await expect(page.locator(".site-footer").getByRole("link", { name: "Private Advisor", exact: true })).toBeVisible();
});
