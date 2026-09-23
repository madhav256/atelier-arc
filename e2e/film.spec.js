import { test, expect } from '@playwright/test';
import { expectAccessible } from './helpers';

test('an artwork film plays only on request', async ({ page }) => {
  await page.goto('/artworks/night-orchard');
  const filmButton = page.getByRole('button', { name: /Film/ });
  await expect(filmButton).toHaveAttribute('aria-pressed', 'false');
  await filmButton.click();
  const video = page.locator('.detail-film video');
  await expect(video).toBeVisible();
  await expect(filmButton).toHaveAttribute('aria-pressed', 'true');
  expect(await video.evaluate((v) => v.paused && v.hasAttribute('controls') && !v.autoplay)).toBe(true);
  await expectAccessible(page, '/artworks/night-orchard (film)');
  await page.getByRole('button', { name: 'The work' }).click();
  await expect(video).toHaveCount(0);
});

test('works without a film show no media switch', async ({ page }) => {
  await page.goto('/artworks/blue-interval');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.media-switch')).toHaveCount(0);
});
