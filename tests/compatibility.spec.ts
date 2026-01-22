import { test, expect } from '@playwright/test';

// Test básico de compatibilidad para la home
test.describe('Compatibilidad SkyArmenia', () => {
  test('La página principal carga y muestra el título actualizado', async ({ page }) => {
    test.setTimeout(60000); // 60 segundos para Firefox y navegadores lentos
    await page.goto('http://localhost:5173/');
    await expect(page).toHaveTitle('SkyArmenia - Vuelos a Armenia | Barcelona ⇄ Yerevan ⇄ Alicante | Ereván ⇄ Alicante | Mejores Precios');
  });

  test('El buscador de vuelos está visible', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page.locator('form.search-bar')).toBeVisible();
  });
});
