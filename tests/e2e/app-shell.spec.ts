import { expect, test } from '@playwright/test';
test('production build starts without browser errors and applies Editorial tokens', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle('TaskFlow');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('font-size', '42px');
  await expect(page.locator('.editorial')).toHaveCSS('background-color', 'rgb(248, 244, 239)');
  expect(errors).toEqual([]);
});
