import { test, expect } from '@playwright/test';

test.describe('Navigation Color Changes', () => {
    test('should change navigation colors based on section background', async ({ page }) => {
        await page.goto('/');

        // 1. Hero Section (assuming dark theme)
        const hero = page.locator('.hero');
        await expect(hero).toBeVisible();
        const menuBtnHero = page.locator('.menu-toggle');
        await expect(menuBtnHero).toHaveCSS('color', 'rgb(238, 241, 81)'); // #eef151

        // 2. Historias Section (Light background)
        const historias = page.locator('#historias');
        await historias.scrollIntoViewIfNeeded();
        // Wait for theme change
        await page.waitForTimeout(500);
        const menuBtnHistorias = page.locator('.menu-toggle');
        await expect(menuBtnHistorias).toHaveClass(/theme-light/);
        await expect(menuBtnHistorias).toHaveCSS('color', 'rgb(81, 60, 37)'); // #513c25

        // 3. Servicios Section (Dark background)
        const servicios = page.locator('#servicios');
        await servicios.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        const menuBtnServicios = page.locator('.menu-toggle');
        await expect(menuBtnServicios).toHaveClass(/theme-dark/);
        await expect(menuBtnServicios).toHaveCSS('color', 'rgb(238, 241, 81)'); // #eef151

        // 4. Contacto Section (Light background)
        const contacto = page.locator('#contacto');
        await contacto.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        const menuBtnContacto = page.locator('.menu-toggle');
        await expect(menuBtnContacto).toHaveClass(/theme-light/);
        await expect(menuBtnContacto).toHaveCSS('color', 'rgb(81, 60, 37)'); // #513c25
    });
});
