import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const directory = fileURLToPath(new URL('.', import.meta.url));
const output = path.join(directory, 'screenshots');
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1296, height: 1200 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const report = { fixtureChecks: 0, layoutChecks: 0, interactionChecks: 0, emptyStateChecks: 0, contrast: [], fonts: [], errors };

async function configure(design, theme, scenario = 'Quadro completo', mobileColumn = 'A fazer') {
  await frame.evaluate(({ design, theme, scenario, mobileColumn }) => {
    document.querySelectorAll('[data-variant]').forEach(section => {
      section.hidden = !section.querySelector(`[data-design="${design}"]`);
    });
    window.taskflowPrototype.configure({ theme, scenario, mobileColumn });
  }, { design, theme, scenario, mobileColumn });
  await frame.evaluate(() => document.fonts.ready);
  await frame.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
  return frame.locator(`[data-design="${design}"]`);
}

async function captureState(task, filename) {
  const bounds = await task.boundingBox();
  await page.screenshot({ path: path.join(output, filename), clip: { x: bounds.x - 10, y: bounds.y - 10, width: bounds.width + 20, height: bounds.height + 20 } });
}

try {
  await page.goto(pathToFileURL(path.join(directory, 'index.html')).href);
  const frameLocator = page.frameLocator('iframe');
  await frameLocator.locator('.tf-task').first().waitFor();
  var frame = page.frames().find(candidate => candidate.parentFrame());
  const fixtures = await frame.evaluate(() => window.taskflowPrototype.tasks);
  assert.equal(fixtures.length, 6);
  assert.equal(new Set(fixtures.map(task => task.priority)).size, 3);

  for (const design of ['serene', 'editorial', 'technical']) {
    for (const theme of ['Claro', 'Escuro']) {
      const suffix = theme === 'Claro' ? 'light' : 'dark';
      for (const width of [1280, 1024, 768, 390, 320]) {
        await page.setViewportSize({ width: width + 32, height: 1400 });
        const window = await configure(design, theme);
        const ids = await window.locator('.tf-task').evaluateAll(cards => cards.map(card => card.dataset.task));
        assert.deepEqual(ids, fixtures.map(task => task.id));
        const titles = await window.locator('.tf-task-title').allTextContents();
        assert.deepEqual(titles, fixtures.map(task => task.title));
        assert.deepEqual(await window.locator('.tf-priority').evaluateAll(badges => badges.map(badge => badge.dataset.priority)), fixtures.map(task => task.priority));
        report.fixtureChecks++;
        const layout = await window.evaluate(root => {
          const bounds = root.getBoundingClientRect();
          const outside = [...root.querySelectorAll('*')].filter(element => {
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && (rect.left < bounds.left - 1 || rect.right > bounds.right + 1);
          });
          return { overflow: root.scrollWidth > root.clientWidth, outside: outside.length, actualWidth: bounds.width };
        });
        assert.equal(layout.overflow, false, `${design}/${theme}/${width}: overflow`);
        assert.equal(layout.outside, 0, `${design}/${theme}/${width}: clipped content`);
        report.layoutChecks++;
        if (width === 1280 || width === 390) {
          await window.screenshot({ path: path.join(output, `${design}-${suffix}-${width === 1280 ? 'desktop' : 'mobile'}.png`) });
        }
      }

      await page.setViewportSize({ width: 1312, height: 1400 });
      const window = await configure(design, theme);
      const task = window.locator('.tf-task').first();
      const button = task.locator('button');
      const normalBorder = await task.evaluate(element => getComputedStyle(element).borderColor);
      await button.hover();
      assert.notEqual(await task.evaluate(element => getComputedStyle(element).borderColor), normalBorder);
      await captureState(task, `${design}-${suffix}-hover.png`);
      report.interactionChecks++;
      await page.mouse.move(1, 1);
      await window.locator('.tf-primary').focus();
      await page.keyboard.press('Tab');
      assert.equal(await window.locator('input[type="search"]').evaluate(element => element === document.activeElement), true);
      await button.focus();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Tab');
      assert.equal(await button.evaluate(element => element.matches(':focus-visible')), true);
      assert.equal(await button.evaluate(element => getComputedStyle(element).outlineWidth), '3px');
      await captureState(task, `${design}-${suffix}-focus.png`);
      report.interactionChecks++;
      await page.keyboard.press('Space');
      assert.equal(await button.getAttribute('aria-pressed'), 'true');
      await window.locator('input[type="search"]').focus();
      await captureState(task, `${design}-${suffix}-selected.png`);
      report.interactionChecks++;

      const contrast = await window.evaluate(root => {
        const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
        const luminance = color => {
          const c = rgb(color).map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
          return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
        };
        const ratio = (a, b) => { const values = [luminance(a), luminance(b)].sort((a, b) => b - a); return (values[0] + .05) / (values[1] + .05); };
        const card = getComputedStyle(root.querySelector('.tf-task'));
        const title = getComputedStyle(root.querySelector('.tf-task-title'));
        const primary = getComputedStyle(root.querySelector('.tf-primary'));
        const priorities = [...root.querySelectorAll('.tf-priority')].map(element => {
          const style = getComputedStyle(element);
          return { name: element.dataset.priority, ratio: ratio(style.color, style.backgroundColor) };
        });
        return { title: ratio(title.color, card.backgroundColor), primary: ratio(primary.color, primary.backgroundColor), priorities };
      });
      assert.ok(contrast.title >= 4.5 && contrast.primary >= 4.5);
      assert.ok(contrast.priorities.every(item => item.ratio >= 4.5));
      report.contrast.push({ design, theme, ...contrast });

      for (const scenario of ['Coluna vazia', 'Quadro vazio', 'Sem resultados']) {
        const window = await configure(design, theme, scenario, 'Concluído');
        assert.equal(await window.locator('.tf-empty').count(), scenario === 'Coluna vazia' ? 1 : 3);
        assert.equal(await window.locator('.tf-task').count(), scenario === 'Coluna vazia' ? 5 : 0);
        report.emptyStateChecks++;
        if (scenario === 'Coluna vazia') {
          await window.screenshot({ path: path.join(output, `${design}-${suffix}-empty-desktop.png`) });
          await page.setViewportSize({ width: 422, height: 1400 });
          await window.screenshot({ path: path.join(output, `${design}-${suffix}-empty-mobile.png`) });
          await page.setViewportSize({ width: 1312, height: 1400 });
        }
      }
    }
  }
  for (const design of ['serene', 'editorial', 'technical']) {
    const window = await configure(design, 'Claro');
    report.fonts.push({ design, family: await window.evaluate(element => getComputedStyle(element).fontFamily) });
  }
  assert.equal(errors.length, 0, 'Prototype script errors');
  await writeFile(path.join(output, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  await page.goto(pathToFileURL(path.join(directory, 'gallery.html')).href);
  await page.setViewportSize({ width: 1328, height: 2000 });
  for (const theme of ['light', 'dark']) {
    for (const view of ['mobile', 'states']) {
      await page.selectOption('#theme', theme);
      await page.selectOption('#view', view);
      await page.locator('#sheet img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
      await page.locator('#sheet').screenshot({ path: path.join(output, `comparison-${view}-${theme}.png`) });
    }
  }
  console.log(JSON.stringify({ fixtureChecks: report.fixtureChecks, layoutChecks: report.layoutChecks, interactionChecks: report.interactionChecks, emptyStateChecks: report.emptyStateChecks, contrastPairs: report.contrast.reduce((total, result) => total + 2 + result.priorities.length, 0), errors }));
} finally {
  await browser.close();
}
