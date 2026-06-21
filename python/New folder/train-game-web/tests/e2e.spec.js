const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('loads index and shows map container', async ({ page }) => {
  await expect(page.locator('#map')).toBeVisible();
});

test('home overlay is present', async ({ page }) => {
  await expect(page.locator('#homeOverlay')).toBeVisible();
});
