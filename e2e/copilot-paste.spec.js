import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => readFileSync(join(root, 'fixtures', name), 'utf8');

async function dismissBlockingOverlays(page) {
  // Onboarding / banners should not block; close auth gate if present
  const authGate = page.locator('#auth-gate:not(.hidden)');
  if (await authGate.count()) {
    await page.locator('#auth-gate-dismiss-btn, #auth-gate-skip-btn').first().click({ timeout: 2000 }).catch(() => {});
  }
  const geminiBanner = page.locator('#gemini-key-banner:not(.hidden)');
  if (await geminiBanner.count()) {
    await page.locator('#gemini-banner-dismiss-btn').click({ timeout: 2000 }).catch(() => {});
  }
  const wizard = page.locator('#first-product-wizard:not(.hidden)');
  if (await wizard.count()) {
    await page.locator('#wizard-dismiss-btn, #wizard-close-dot').first().click({ timeout: 2000 }).catch(() => {});
  }
}

async function pasteAndProcess(page, jsonText) {
  await page.locator('#copilot-paste-input').fill(jsonText);
  await page.locator('#copilot-process-btn').click();
}

test.describe('Copiloto paste-back (T08)', () => {
  test('Express: 1 pegado genera informe', async ({ page }) => {
    await page.goto('./');
    await dismissBlockingOverlays(page);

    await page.locator('[data-research-path="copilot"]').click();
    await page.locator('[data-research-mode="express"]').click();

    await page.locator('#search-input').fill('Botella térmica E2E Express');
    await page.locator('#search-form').locator('button[type="submit"]').click();

    const modal = page.locator('#copilot-modal');
    await expect(modal).not.toHaveClass(/hidden/);
    await expect(page.locator('#copilot-step-title')).toContainText(/express|reporte/i);

    await pasteAndProcess(page, fixture('copilot-express.json'));

    const report = page.locator('#report-view');
    await expect(report).not.toHaveClass(/hidden/, { timeout: 20_000 });
    await expect(page.locator('#report-product-name')).toContainText('Botella térmica E2E Express');
  });

  test('Rápido: 2 pegados generan informe', async ({ page }) => {
    await page.goto('./');
    await dismissBlockingOverlays(page);

    await page.locator('[data-research-path="copilot"]').click();
    await page.locator('[data-research-mode="fast"]').click();

    await page.locator('#search-input').fill('Botella térmica E2E Rápido');
    await page.locator('#search-form').locator('button[type="submit"]').click();

    const modal = page.locator('#copilot-modal');
    await expect(modal).not.toHaveClass(/hidden/);

    await pasteAndProcess(page, fixture('copilot-step1.json'));
    await expect(page.locator('#copilot-error-msg')).toHaveClass(/hidden/);
    await expect(page.locator('#copilot-step-progress')).toContainText(/2\s*\/\s*2|2 \/ 2/);

    await pasteAndProcess(page, fixture('copilot-step2-fast.json'));

    const report = page.locator('#report-view');
    await expect(report).not.toHaveClass(/hidden/, { timeout: 20_000 });
    await expect(page.locator('#report-product-name')).toContainText('Botella térmica E2E Rápido');
  });
});
