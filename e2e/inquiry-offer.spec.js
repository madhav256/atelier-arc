import { test, expect } from '@playwright/test';
import { login, fillAddress } from './helpers';

// Seed: artwork index 2 ("Memory of Stone") is available with a list price.
test('inquiry moves through the advisor pipeline and the collector accepts and pays a private offer', async ({ browser }) => {
  const collector = await (await browser.newContext()).newPage();
  await login(collector, 'collector@atelierarc.example');
  await collector.goto('/artworks/memory-of-stone');
  await collector.getByRole('button', { name: 'Speak with an advisor' }).click();
  const dialog = collector.getByRole('dialog');
  await dialog.getByLabel('Message').fill('I would love to see this work in person before deciding.');
  await dialog.getByRole('button', { name: 'Send inquiry' }).click();
  const reference = (await dialog.locator('.inquiry-sent b').textContent()).trim();
  expect(reference).toMatch(/\w+/);

  const admin = await (await browser.newContext()).newPage();
  await login(admin, 'admin@atelierarc.example');
  await admin.goto(`/admin/inquiries?q=${reference}`);
  await admin.getByRole('link', { name: reference }).click();
  await admin.getByLabel('Advisor').selectOption({ label: 'Anika Shah (advisor)' });
  await expect(admin.getByLabel('Advisor')).toHaveValue(/.+/);
  await admin.getByLabel(/Reply to collector/).fill('Happy to arrange a viewing at the gallery.');
  await admin.getByRole('button', { name: 'Send reply' }).click();
  await expect(admin.getByText('Happy to arrange a viewing at the gallery.')).toBeVisible();
  await admin.getByLabel(/private note/).fill('Serious buyer, flexible on timing.');
  await admin.getByRole('button', { name: 'Add note' }).click();
  await expect(admin.getByText('Serious buyer, flexible on timing.')).toBeVisible();
  const soon = new Date(Date.now() + 3 * 864e5);
  await admin.getByLabel('Proposed time').fill(`${soon.toISOString().slice(0, 10)}T11:00`);
  await admin.getByRole('button', { name: 'Propose viewing' }).click();
  await expect(admin.locator('.pill-proposed')).toBeVisible();
  await admin.getByLabel('Amount (INR)').fill('95000');
  await admin.getByRole('button', { name: 'Send offer' }).click();
  await expect(admin.getByRole('button', { name: 'Withdraw offer' })).toBeVisible();

  // Advisors see the inquiry once it is assigned to them, and never the admin-only screens.
  const advisor = await (await browser.newContext()).newPage();
  await login(advisor, 'advisor@atelierarc.example');
  await advisor.goto('/admin/inquiries');
  await expect(advisor.getByRole('link', { name: reference })).toBeVisible();
  await expect(advisor.getByRole('link', { name: 'Audit log' })).toHaveCount(0);

  await collector.goto('/account');
  await collector.getByRole('link', { name: 'Review the offer' }).first().click();
  await expect(collector.getByText('Happy to arrange a viewing at the gallery.')).toBeVisible();
  await expect(collector.getByText('Serious buyer')).toHaveCount(0); // internal notes stay internal
  await collector.getByRole('button', { name: 'Confirm' }).click();
  await expect(collector.locator('.pill-confirmed')).toBeVisible();
  await collector.getByRole('button', { name: 'Accept and pay' }).click();
  await fillAddress(collector);
  await collector.getByRole('button', { name: 'Continue to payment' }).click();
  await collector.getByRole('button', { name: 'Complete test payment' }).click();
  await collector.waitForURL(/\/checkout\/complete\//);
  await expect(collector.getByRole('heading', { name: 'Thank you.' })).toBeVisible();

  await collector.goto('/account/orders');
  await collector.getByRole('link', { name: /Memory of Stone/ }).first().click();
  await expect(collector.getByText(/95,000/).first()).toBeVisible(); // agreed offer price, not the list price

  await admin.goto('/admin/audit');
  await expect(admin.getByRole('cell', { name: 'offer' }).first()).toBeVisible();
});
