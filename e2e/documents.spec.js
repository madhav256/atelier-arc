import { test, expect } from '@playwright/test';

test('the provenance dossier downloads as a PDF from the artwork page', async ({ page }) => {
  await page.goto('/artworks/night-orchard');
  const link = page.getByRole('link', { name: /Provenance dossier/ });
  await expect(link).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
  expect(download.suggestedFilename()).toBe('night-orchard-provenance.pdf');
});

test('an unknown certificate code is reported as not recognised', async ({ page }) => {
  await page.goto('/verify');
  await page.getByLabel('Certificate code').fill('AA-0000-0000.ABCDEF1234');
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page.getByText('NOT RECOGNISED')).toBeVisible();
});

test('the guarantee is linked from the artwork page and the footer', async ({ page }) => {
  await page.goto('/artworks/night-orchard');
  await page.getByRole('link', { name: 'Read the guarantee' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/certainty/i);
  await expect(page.locator('.site-footer').getByRole('link', { name: 'Returns and guarantee' })).toHaveAttribute('href', '/guarantee');
});
