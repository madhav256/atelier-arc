import { test, expect } from '@playwright/test';
import { expectAccessible } from './helpers';

test('AR dialog loads the true-scale model with a room-view fallback', async ({ page }) => {
  await page.goto('/artworks/night-orchard');
  const model = page.waitForResponse((r) => r.url().includes('/artworks/night-orchard/model.glb'));
  await page.getByRole('button', { name: /See it on your wall/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Night Orchard' });
  await expect(dialog).toBeVisible();
  expect((await model).status()).toBe(200);
  await expect(dialog.locator('model-viewer')).toHaveAttribute('ar-placement', 'wall');
  await expectAccessible(page, 'AR dialog');
  await dialog.getByRole('button', { name: 'Use the room view instead' }).click();
  await expect(page.locator('.room-view')).toBeVisible();
});

test('sculptural works offer no AR', async ({ page }) => {
  await page.goto('/artworks/quiet-geometry');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.detail-info .eyebrow').first()).toHaveText(/sculptures/i);
  await expect(page.getByRole('button', { name: /See it on your wall/ })).toHaveCount(0);
});
