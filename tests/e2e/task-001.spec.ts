import { expect, test } from '@playwright/test';
for (const theme of ['light', 'dark']) {
  for (const width of [320, 390, 768, 1280]) {
    test(`TASK-001 create, validate and recover: ${theme} ${width}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 }); await page.goto('/');
      if (theme === 'dark') await page.getByRole('button', { name: 'Tema escuro' }).click();
      if (width <= 700) await page.getByRole('tab', { name: 'Concluído' }).click();
      const trigger = page.getByRole('button', { name: 'Nova tarefa', exact: true });
      await trigger.click();
      const input = page.getByRole('textbox', { name: 'Título da tarefa' });
      await expect(input).toBeFocused();
      for (const blank of ['', '   ']) {
        await input.fill(blank); await page.getByRole('button', { name: 'Criar tarefa' }).click();
        await expect(page.getByRole('alert')).toHaveText('Digite um título para a tarefa.');
        await expect(input).toHaveAttribute('aria-invalid', 'true');
        await expect(input).toHaveAttribute('aria-describedby', 'title-help title-error');
        await expect(input).toBeFocused(); await expect(input).toHaveValue(blank);
        await expect(page.locator('.task-card')).toHaveCount(0);
      }
      await page.screenshot({ path: testInfo.outputPath('validation.png'), fullPage: true });
      await input.fill('  Preparar roteiro  '); await input.press('Enter');
      await expect(page.getByRole('dialog')).not.toBeVisible(); await expect(trigger).toBeFocused();
      await expect(page.locator('#panel-todo').getByRole('heading', { name: 'Preparar roteiro', exact: true })).toBeVisible();
      await expect(page.locator('#heading-todo')).toContainText('1');
      await expect(page.locator('#panel-in_progress .task-card')).toHaveCount(0);
      await expect(page.locator('#panel-done .task-card')).toHaveCount(0);
      await expect(page.getByRole('status')).toContainText('criada em A fazer');
      if (width <= 700) await expect(page.getByRole('tab', { name: 'A fazer 1' })).toHaveAttribute('aria-selected', 'true');
      await trigger.click(); await input.fill('Segundo passo ' + 'longo'.repeat(50)); await input.press('Enter');
      await expect(page.locator('#panel-todo .task-card')).toHaveCount(2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('created.png'), fullPage: true });
      await page.reload(); await expect(page.locator('.task-card')).toHaveCount(0);
    });
  }
}
test('TASK-001 modal traps keyboard focus, cancels with Escape and creates nothing', async ({ page }) => {
  await page.goto('/'); const trigger = page.getByRole('button', { name: 'Nova tarefa', exact: true }); await trigger.click();
  const input = page.getByRole('textbox'); await input.fill('Rascunho');
  await input.press('Shift+Tab'); await expect(page.getByRole('button', { name: 'Criar tarefa' })).toBeFocused();
  await page.keyboard.press('Tab'); await expect(input).toBeFocused();
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused(); await expect(page.locator('.task-card')).toHaveCount(0);
  await trigger.click(); await expect(input).toHaveValue('');
  await page.getByRole('button', { name: 'Cancelar' }).click(); await expect(trigger).toBeFocused();
});
test('TASK-001 mobile tabs support arrows, Home, End and breakpoint focus in all columns', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 }); await page.goto('/');
  const tabs = page.getByRole('tab'); await tabs.nth(0).focus();
  await page.keyboard.press('ArrowLeft'); await expect(tabs.nth(2)).toBeFocused();
  await page.keyboard.press('ArrowRight'); await expect(tabs.nth(0)).toBeFocused();
  await page.keyboard.press('End'); await expect(tabs.nth(2)).toBeFocused();
  await page.keyboard.press('Home'); await expect(tabs.nth(0)).toBeFocused();
  for (const [index, status] of ['todo', 'in_progress', 'done'].entries()) {
    await tabs.nth(index).click(); await page.keyboard.press('Tab');
    await expect(page.locator(`#panel-${status}`)).toBeFocused();
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator(`#panel-${status}`)).toBeFocused();
    await page.setViewportSize({ width: 390, height: 900 });
    await expect(page.locator(`#panel-${status}`)).toBeFocused();
    await expect(tabs.nth(index)).toHaveAttribute('aria-selected', 'true');
    await tabs.nth(index).focus(); await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator(`#panel-${status}`)).toBeFocused();
    await page.setViewportSize({ width: 390, height: 900 });
  }
});
for (const dark of [false, true]) {
  test(`TASK-001 rendered contrast and control targets: ${dark ? 'dark' : 'light'}`, async ({ page }) => {
    await page.goto('/');
    if (dark) await page.getByRole('button', { name: 'Tema escuro' }).click();
    await page.getByRole('button', { name: 'Nova tarefa', exact: true }).click();
    await page.getByRole('button', { name: 'Criar tarefa' }).click();
    const ratios = await page.evaluate(() => {
      const luminance = (color: string) => {
        const values = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(n => n / 255).map(n => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4);
        return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
      };
      const contrast = (a: string, b: string) => { const x = luminance(a); const y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
      const style = (selector: string) => getComputedStyle(document.querySelector(selector)!);
      const modal = style('dialog'); const field = style('input'); const button = style('dialog .primary'); const error = style('.error');
      const fieldRect = document.querySelector('input')!.getBoundingClientRect();
      return {
        text: [contrast(modal.color, modal.backgroundColor), contrast(style('#title-help').color, modal.backgroundColor), contrast(button.color, button.backgroundColor), contrast(error.color, error.backgroundColor)],
        controls: [contrast(field.borderTopColor, field.backgroundColor), contrast(field.outlineColor, field.backgroundColor)],
        fieldHeight: fieldRect.height,
        buttons: Array.from(document.querySelectorAll('dialog button')).map(node => node.getBoundingClientRect().height),
      };
    });
    for (const ratio of ratios.text) expect(ratio).toBeGreaterThanOrEqual(4.5);
    for (const ratio of ratios.controls) expect(ratio).toBeGreaterThanOrEqual(3);
    expect(ratios.fieldHeight).toBeGreaterThanOrEqual(44);
    for (const height of ratios.buttons) expect(height).toBeGreaterThanOrEqual(44);
    await expect(page.getByRole('textbox')).toHaveCSS('outline-width', '3px');
  });
}
