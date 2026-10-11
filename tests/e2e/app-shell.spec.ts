import { expect, test } from '@playwright/test';

test('production build starts without browser errors and loads Tailwind styles', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto('/');

  await expect(page).toHaveTitle('TaskFlow');
  const heading = page.getByRole('heading', { level: 1, name: 'TaskFlow', exact: true });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveCSS('font-size', '36px');
  await expect(page.getByRole('main')).toBeVisible();
  expect(errors).toEqual([]);
});
