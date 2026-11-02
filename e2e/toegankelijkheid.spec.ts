import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Toegankelijkheid is geen mening, je kunt erop meten. Deze tests draaien de
// WCAG 2.1 AA regels van axe over de pagina en falen bij elke overtreding.
// Daarmee is het een poortje en geen rapportje.

const wcag = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.beforeEach(async ({ page }) => {
  await page.goto('');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('de pagina zonder bewaarde quotes heeft geen toegankelijkheidsfouten', async ({ page }) => {
  const resultaat = await new AxeBuilder({ page }).withTags(wcag).analyze();
  expect(resultaat.violations).toEqual([]);
});

test('de pagina met een bewaarde quote heeft geen toegankelijkheidsfouten', async ({ page }) => {
  await page.getByTestId('favoriet').click();

  const resultaat = await new AxeBuilder({ page }).withTags(wcag).analyze();
  expect(resultaat.violations).toEqual([]);
});

test('bewaren kan volledig met het toetsenbord', async ({ page }) => {
  await page.getByTestId('favoriet').focus();
  await page.keyboard.press('Enter');

  await expect(page.getByTestId('favoriet')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('bewaard-item')).toHaveCount(1);
});
