/**
 * Mobile smoke — Chromium viewport 375×667 (no WebKit required).
 * Asserts no horizontal overflow + copiloto full-bleed + touch targets.
 */
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const expressFixture = readFileSync(
  join(__dirname, 'fixtures/copilot-express.json'),
  'utf8',
);

async function dismissOverlays(page) {
  for (const sel of [
    '#auth-gate:not(.hidden)',
    '#gemini-key-banner:not(.hidden)',
    '#first-product-wizard:not(.hidden)',
  ]) {
    const el = page.locator(sel);
    if ((await el.count()) === 0) continue;
    if (!(await el.isVisible().catch(() => false))) continue;
    if (sel.includes('auth-gate')) await page.locator('#auth-gate-dismiss-btn').click();
    else if (sel.includes('gemini')) await page.locator('#gemini-banner-dismiss-btn').click();
    else await page.locator('#wizard-dismiss-btn').click();
  }
}

async function hasHorizontalOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 1;
  });
}

test.use({
  viewport: { width: 375, height: 667 },
  isMobile: true,
  hasTouch: true,
});

test.describe('Móvil 375×667', () => {
  test('home sin scroll horizontal; nav y CTA táctiles', async ({ page }) => {
    await page.goto('./');
    await dismissOverlays(page);

    expect(await hasHorizontalOverflow(page)).toBe(false);

    // Inactive report view must not stay display:flex (overflow bug)
    const reportDisplay = await page.locator('#report-view').evaluate(
      (el) => getComputedStyle(el).display,
    );
    expect(reportDisplay).toBe('none');

    const nav = page.locator('.nav-link').first();
    const box = await nav.boundingBox();
    expect(box).toBeTruthy();
    expect(box.height).toBeGreaterThanOrEqual(44);

    const primary = page.locator('#search-form .search-btn-primary');
    const pBox = await primary.boundingBox();
    expect(pBox.height).toBeGreaterThanOrEqual(44);
  });

  test('copiloto full-bleed + botones ≥44px + sin overflow', async ({ page }) => {
    await page.goto('./');
    await dismissOverlays(page);

    await page.locator('[data-research-path="copilot"]').click();
    await page.locator('[data-research-mode="express"]').click();
    await page.locator('#search-input').fill('Botella UV');
    await page.locator('#search-form .search-btn-primary').click();

    const modal = page.locator('#copilot-modal');
    await expect(modal).toBeVisible();
    // Esperar fin de fadeIn; CSP bloquea waitForFunction(eval)
    await page.waitForTimeout(250);

    const container = modal.locator('.copilot-container, .terminal-container').first();
    await expect
      .poll(async () => {
        const box = await container.boundingBox();
        const vp = page.viewportSize();
        if (!box || !vp) return false;
        return box.width >= vp.width - 4 && box.height >= vp.height - 4;
      })
      .toBeTruthy();

    const cBox = await container.boundingBox();
    const vp = page.viewportSize();
    expect(cBox).toBeTruthy();
    expect(cBox.width).toBeGreaterThanOrEqual(vp.width - 4);
    expect(cBox.height).toBeGreaterThanOrEqual(vp.height - 4);

    const processBtn = page.locator('#copilot-process-btn');
    const b = await processBtn.boundingBox();
    expect(b.height).toBeGreaterThanOrEqual(44);

    const textarea = page.locator('#copilot-paste-input');
    const fontSize = await textarea.evaluate((el) => getComputedStyle(el).fontSize);
    expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(16);

    expect(await hasHorizontalOverflow(page)).toBe(false);

    await textarea.fill(expressFixture);
    await processBtn.click();
    await expect(page.locator('#report-view')).toBeVisible({ timeout: 15_000 });
    expect(await hasHorizontalOverflow(page)).toBe(false);

    const actions = page.locator('.report-header-actions');
    await expect(actions).toBeVisible();
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});
