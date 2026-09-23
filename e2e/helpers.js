import { expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export const PASSWORD = 'ChangeMe123!';

export async function login(page, email) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByLabel('Password').press('Enter');
  await page.waitForURL(/\/(account|admin)/);
}

// Fails on serious or critical WCAG 2.1 A/AA violations and prints what broke.
export async function expectAccessible(page, context = page.url()) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const bad = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  const summary = bad.map((v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.slice(0, 4).map((n) => `${n.target.join(' ')} [${(n.any[0]?.message || '').slice(0, 140)}]`).join(' | ')}`);
  expect(summary, `Accessibility violations on ${context}`).toEqual([]);
}

export async function fillAddress(page) {
  await page.getByLabel('Full name').fill('Asha Rao');
  await page.getByLabel(/^Address( line 1)?$/).fill('12 Carmichael Road');
  await page.getByLabel('City').fill('Mumbai');
  await page.getByLabel(/State/).fill('Maharashtra');
  await page.getByLabel('Postal code').fill('400026');
}
