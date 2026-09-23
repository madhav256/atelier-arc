import { test, expect } from '@playwright/test';
import { login, fillAddress, expectAccessible } from './helpers';

// Seed: artwork index 1 ("Quiet Geometry") is an available original with a fixed price.
const WORK = '/artworks/quiet-geometry';

test('guest completes a full checkout with the test gateway, and staff see a confirmed order', async ({ page, browser }) => {
  await page.goto(WORK);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Quiet Geometry/);
  await page.getByRole('button', { name: 'Add to acquisition bag' }).click();
  await page.goto('/cart');
  await expect(page.getByText('Quiet Geometry').first()).toBeVisible();
  await expectAccessible(page, 'cart');
  await page.getByRole('link', { name: 'Continue to checkout' }).click();

  await page.getByLabel('Email').fill('asha.rao@example.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  await fillAddress(page);
  await expectAccessible(page, 'checkout address');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('radio').first().check();
  await page.getByRole('button', { name: 'Review total' }).click();
  await expect(page.getByText(/Total/).first()).toBeVisible();
  await page.getByLabel(/I have reviewed/).check();
  await page.getByRole('button', { name: 'Place order and pay' }).click();

  await page.getByRole('button', { name: 'Complete test payment' }).click();
  await page.waitForURL(/\/checkout\/complete\//);
  await expect(page.getByRole('heading', { name: 'Thank you.' })).toBeVisible();
  const number = page.url().match(/complete\/([^?]+)/)[1];

  // The work is now sold out and cannot be added again.
  await page.goto(WORK);
  await expect(page.getByRole('button', { name: 'Add to acquisition bag' })).toHaveCount(0);

  const staff = await browser.newPage();
  await login(staff, 'admin@atelierarc.example');
  await staff.goto(`/admin/orders?q=${number}`);
  await staff.getByRole('link', { name: number }).click();
  await expect(staff.getByRole('heading', { level: 1 })).toContainText(/confirmed/i);
  await staff.getByLabel('New status').selectOption('preparing');
  await staff.getByRole('button', { name: 'Update order' }).click();
  await expect(staff.getByRole('heading', { level: 1 })).toContainText(/preparing/i);
  await staff.getByLabel('New status').selectOption('shipped');
  await staff.getByLabel('Carrier').fill('BlueDart');
  await staff.getByLabel('Tracking number').fill('BD123456');
  await staff.getByRole('button', { name: 'Update order' }).click();
  await expect(staff.getByRole('heading', { level: 1 })).toContainText(/shipped/i);
});

test('a declined test card leaves the order unpaid and the work available', async ({ page }) => {
  await page.goto('/artworks/blue-interval');
  await page.getByRole('button', { name: 'Add to acquisition bag' }).click();
  await page.goto('/checkout');
  await page.getByLabel('Email').fill('declined@example.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  await fillAddress(page);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('radio').first().check();
  await page.getByRole('button', { name: 'Review total' }).click();
  await page.getByLabel(/I have reviewed/).check();
  await page.getByRole('button', { name: 'Place order and pay' }).click();
  await page.getByRole('button', { name: 'Simulate a declined card' }).click();
  await expect(page.getByText(/declined|not completed|failed/i).first()).toBeVisible();
  await page.goto('/artworks/blue-interval');
  await expect(page.getByText(/available/i).first()).toBeVisible();
});
