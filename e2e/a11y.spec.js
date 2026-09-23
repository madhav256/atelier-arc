import { test, expect } from '@playwright/test';
import { login, expectAccessible } from './helpers';

const PUBLIC = ['/', '/artworks', '/artworks/soft-architecture', '/artists', '/artists/mira-khanna', '/collections', '/collections/works-on-paper', '/journal', '/journal/inside-the-studio-of-leela-iyer', '/advisory', '/login', '/register', '/order-status', '/verify', '/guarantee', '/viewings/book', '/cart', '/does-not-exist'];

for (const path of PUBLIC) {
  test(`public page ${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('h1').first()).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expectAccessible(page, path);
    expect(await page.title()).toMatch(/Atelier Arc/);
    if (path !== '/does-not-exist') await expect(page.locator('meta[name="description"]')).toHaveCount(1);
  });
}

test('collector account pages are accessible and noindexed', async ({ page }) => {
  await login(page, 'collector@atelierarc.example');
  for (const path of ['/account', '/account/orders', '/account/inquiries', '/account/notifications', '/account/recommendations', '/account/settings', '/my-collection']) {
    await page.goto(path);
    await expect(page.locator('h1').first()).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expectAccessible(page, path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  }
});

test('admin screens are accessible', async ({ page }) => {
  await login(page, 'admin@atelierarc.example');
  for (const path of ['/admin', '/admin/artworks', '/admin/inquiries', '/admin/orders', '/admin/customers', '/admin/audit']) {
    await page.goto(path);
    await expect(page.locator('main h1').first()).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expectAccessible(page, path);
  }
  await page.goto('/admin/artworks');
  await page.locator('table tbody a').first().click();
  await expect(page.locator('form.admin-form')).toBeVisible();
  await expectAccessible(page, 'artwork editor');
});
