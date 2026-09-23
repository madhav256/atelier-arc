import { test, expect } from '@playwright/test';
import { login, expectAccessible } from './helpers';

test('a collector books a private viewing from an artwork, sees it in the account, and staff see it', async ({ page, browser }) => {
  await login(page, 'collector@atelierarc.example');
  await page.goto('/artworks/night-orchard');
  await page.getByRole('link', { name: 'Book a private viewing' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/in person/i);
  await expect(page.getByText('Night Orchard').first()).toBeVisible();
  await page.getByRole('radio', { name: /New Delhi/ }).check({ force: true });
  await page.locator('.viewing-times button:not([disabled])').first().click();
  await expectAccessible(page, '/viewings/book');
  await page.getByRole('button', { name: 'Confirm viewing' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/look forward/i);
  const ref = (await page.locator('.eyebrow').first().innerText()).match(/VW-\d{5}/)[0];

  await page.goto('/account/viewings');
  await expect(page.getByText(ref)).toBeVisible();
  await expectAccessible(page, '/account/viewings');

  const staffContext = await browser.newContext();
  const staff = await staffContext.newPage();
  await login(staff, 'admin@atelierarc.example');
  await staff.goto('/admin/viewings');
  await expect(staff.getByText(ref)).toBeVisible();
  await expectAccessible(staff, '/admin/viewings');
  await staffContext.close();

  await page.getByRole('button', { name: `Cancel viewing ${ref}` }).click();
  await expect(page.locator('li', { hasText: ref }).getByText('cancelled')).toBeVisible();
});

test('signed-out visitors are asked to sign in before confirming', async ({ page }) => {
  await page.goto('/viewings/book');
  await expect(page.getByRole('link', { name: 'Sign in to confirm' })).toHaveAttribute('href', /\/login\?next=/);
});
