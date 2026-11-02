import { expect, test } from '@playwright/test';

// Deze tests gaan over gedrag dat alleen in een echte browser bestaat.
// Opslag die een herlaad overleeft, en een pagina die blijft werken als die
// opslag rommel bevat. Een unit test kan dat niet aantonen.

test.beforeEach(async ({ page }) => {
  await page.goto('');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('de pagina opent met een quote en een bron', async ({ page }) => {
  await expect(page.getByTestId('quote-tekst')).not.toBeEmpty();
  await expect(page.getByTestId('quote-bron')).toContainText('—');
  await expect(page.getByTestId('bewaard-leeg')).toBeVisible();
});

test('bewaren zet de knop aan en vult de lijst', async ({ page }) => {
  const quote = await page.getByTestId('quote-tekst').textContent();

  await page.getByTestId('favoriet').click();

  await expect(page.getByTestId('favoriet')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('favoriet-label')).toHaveText('Bewaard');
  await expect(page.getByTestId('bewaard-item')).toHaveCount(1);
  await expect(page.getByTestId('bewaard-spring')).toHaveText(quote!);
  await expect(page.getByTestId('bewaard-leeg')).toBeHidden();
});

test('wat je bewaart staat er na een herlaad nog steeds', async ({ page }) => {
  const quote = await page.getByTestId('quote-tekst').textContent();
  await page.getByTestId('favoriet').click();

  await page.reload();

  await expect(page.getByTestId('bewaard-item')).toHaveCount(1);
  await expect(page.getByTestId('bewaard-spring')).toHaveText(quote!);
});

test('verwijderen haalt hem weg, ook na een herlaad', async ({ page }) => {
  await page.getByTestId('favoriet').click();
  await page.getByTestId('bewaard-weg').click();

  await expect(page.getByTestId('bewaard-item')).toHaveCount(0);
  await expect(page.getByTestId('bewaard-leeg')).toBeVisible();

  await page.reload();
  await expect(page.getByTestId('bewaard-item')).toHaveCount(0);
});

test('klikken op een bewaarde quote springt er weer naartoe', async ({ page }) => {
  const eerste = await page.getByTestId('quote-tekst').textContent();
  await page.getByTestId('favoriet').click();

  await page.getByTestId('volgende').click();
  await expect(page.getByTestId('quote-tekst')).not.toHaveText(eerste!);

  await page.getByTestId('bewaard-spring').click();
  await expect(page.getByTestId('quote-tekst')).toHaveText(eerste!);
  await expect(page.getByTestId('favoriet')).toHaveAttribute('aria-pressed', 'true');
});

test('bladeren werkt met de knoppen en met de pijltoetsen', async ({ page }) => {
  const start = await page.getByTestId('quote-tekst').textContent();
  const teller = await page.getByTestId('teller').textContent();

  await page.getByTestId('volgende').click();
  await expect(page.getByTestId('quote-tekst')).not.toHaveText(start!);
  await expect(page.getByTestId('teller')).not.toHaveText(teller!);

  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('quote-tekst')).toHaveText(start!);
  await expect(page.getByTestId('teller')).toHaveText(teller!);
});

test('de pagina blijft werken als de opslag rommel bevat', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('quote-van-de-dag.favorieten.v1', 'kapot{{'));
  await page.reload();

  await expect(page.getByTestId('quote-tekst')).not.toBeEmpty();
  await expect(page.getByTestId('bewaard-leeg')).toBeVisible();

  await page.getByTestId('favoriet').click();
  await expect(page.getByTestId('bewaard-item')).toHaveCount(1);
});
