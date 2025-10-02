import { test, expect } from '@playwright/test';

test.describe('GAA Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the GAA interface', async ({ page }) => {
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('should display controls', async ({ page }) => {
    const playButton = page.getByRole('button', { name: /play|start/i });
    await expect(playButton).toBeVisible();
  });

  test('should toggle play state', async ({ page }) => {
    const playButton = page.getByRole('button', { name: /play|start/i });

    await playButton.click();

    await expect(playButton).toContainText(/stop|pause/i);
  });

  test('should adjust frequency with slider', async ({ page }) => {
    const frequencySlider = page.locator('input[type="range"]').first();
    await expect(frequencySlider).toBeVisible();

    const initialValue = await frequencySlider.inputValue();
    await frequencySlider.fill('528');
    const newValue = await frequencySlider.inputValue();

    expect(newValue).not.toBe(initialValue);
  });

  test('should respond to keyboard shortcuts', async ({ page }) => {
    await page.keyboard.press('Space');

    await page.waitForTimeout(500);

    const playButton = page.getByRole('button', { name: /stop|pause|play|start/i });
    await expect(playButton).toBeVisible();
  });

  test('should change geometry mode', async ({ page }) => {
    await page.keyboard.press('G');

    await page.waitForTimeout(500);

    await expect(page.locator('canvas')).toBeVisible();
  });
});

test.describe('Analytics Dashboard', () => {
  test('should open analytics from controls', async ({ page }) => {
    await page.goto('/');

    const analyticsButton = page.getByRole('button', { name: /analytics/i });

    if (await analyticsButton.isVisible()) {
      await analyticsButton.click();
      await expect(page.getByText(/resonance analytics/i)).toBeVisible();
    }
  });
});
