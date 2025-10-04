import { test, expect } from '@playwright/test';

test('full evaluation workflow', async ({ page }) => {
  await page.goto('http://localhost:3000'); // Assuming dev server runs on 3000

  // Select slot
  await page.selectOption('select[id="ev-slot"]', 'F1');

  // Wait for data to load
  await page.waitForSelector('select:not([value=""])'); // QP select has options

  // Select QP
  await page.selectOption('select', { index: 1 }); // First QP

  // Select answers
  const checkbox = page.locator('input[type="checkbox"]').first();
  await checkbox.check();

  // Click Evaluate
  await page.click('button:has-text("Evaluate")');

  // Wait for evaluation to complete
  await page.waitForSelector('text=Evaluation Summary');

  // Check summary
  await expect(page.locator('text=Evaluation Summary')).toBeVisible();
});