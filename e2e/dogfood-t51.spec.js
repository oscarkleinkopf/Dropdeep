/**
 * T51 dogfood: 3 productos Descubrir → Copiloto Express → informe → feedback T35.
 * Chromium viewport; sin Gemini live (fixture JSON).
 */
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseFixture = JSON.parse(
  readFileSync(join(__dirname, 'fixtures/copilot-express.json'), 'utf8'),
);

const PRODUCTS = [
  {
    label: 'Botella UV sensor',
    input: 'https://www.aliexpress.com/item/1005006123456789.html',
    cost: '9.5',
    title: 'Botella UV sensor',
  },
  {
    label: 'Masajeador cuello',
    input: '1005006987654321',
    cost: '12',
    title: 'Masajeador cuello',
  },
  {
    label: 'Organizador cables magnetico',
    input: 'https://www.aliexpress.com/item/Magnetic-Cable-Organizer-1005007111222333.html',
    cost: '4.2',
    title: 'Organizador cables magnetico',
  },
];

async function dismissOverlays(page) {
  for (const sel of [
    '#auth-gate-dismiss-btn',
    '#gemini-banner-dismiss-btn',
    '#wizard-dismiss-btn',
  ]) {
    const btn = page.locator(sel);
    if ((await btn.count()) && (await btn.isVisible().catch(() => false))) {
      await btn.click().catch(() => {});
    }
  }
  // Discard prior copiloto session if modal asks
  const discard = page.getByRole('button', { name: /Descartar|continuar|Nueva/i });
  if ((await discard.count()) && (await discard.first().isVisible().catch(() => false))) {
    await discard.first().click().catch(() => {});
  }
}

function fixtureFor(name) {
  return JSON.stringify({ ...baseFixture, name }, null, 2);
}

test.describe('T51 dogfood 3 productos', () => {
  for (const product of PRODUCTS) {
    test(`${product.label}: Descubrir → informe → feedback`, async ({ page }) => {
      await page.goto('./');
      await dismissOverlays(page);

      await page.locator('#nav-discover').click();
      await expect(page.locator('#discover-view')).toBeVisible();

      await page.locator('#discover-url-input').fill(product.input);
      await page.locator('#discover-parse-btn').click();
      await expect(page.locator('#discover-candidate')).toBeVisible();

      // Campos limpios tras parse (salvo titleHint de slug)
      const costVal = await page.locator('#discover-cost-input').inputValue();
      expect(costVal).toBe('');

      await page.locator('#discover-title-input').fill(product.title);
      await page.locator('#discover-cost-input').fill(product.cost);
      await expect(page.locator('#discover-prefilter')).toBeVisible();
      await expect(page.locator('.discover-prefilter-legend')).toBeVisible();

      await page.locator('#discover-investigate-btn').click();

      page.once('dialog', (dialog) => dialog.accept());

      const modal = page.locator('#copilot-modal');
      await expect(modal).toBeVisible({ timeout: 10_000 });

      await page.locator('#copilot-paste-input').fill(fixtureFor(product.title));
      await page.locator('#copilot-process-btn').click();

      await expect(page.locator('#report-view')).toBeVisible({ timeout: 20_000 });
      await expect(page.locator('#report-feedback-panel')).toBeVisible();

      await page.locator('.report-feedback-choice').first().click();
      await page.locator('#report-feedback-note').fill(`T51 dogfood: ${product.label}`);
      await page.locator('#report-feedback-save-btn').click();
      await expect(page.locator('#report-feedback-status')).toContainText(/Guardado/i);
    });
  }
});
