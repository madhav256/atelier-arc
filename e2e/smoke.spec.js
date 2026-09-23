import { test, expect } from '@playwright/test';

test('home, catalogue filters and artwork detail render from the API', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('.hero h1')).toBeVisible();
  await page.goto('/artworks');
  await expect(page.locator('.art-card').first()).toBeVisible();
  await page.locator('.art-card a').first().click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('private pages redirect to sign-in', async ({ page }) => {
  await page.goto('/account/orders');
  await expect(page).toHaveURL(/\/login\?next=/);
});
