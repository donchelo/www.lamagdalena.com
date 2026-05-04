import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
    test('homepage loads and has main title', async ({ page }) => {
        await page.goto('/');
        // Adjust selector based on actual content
        await expect(page).toHaveTitle(/La Magdalena/i);
        await expect(page.locator('nav')).toBeVisible();
    });

    test('navigation works', async ({ page }) => {
        await page.goto('/');

        // Check main navigation links
        const links = ['Portfolio', 'Historias', 'Jarupia'];
        for (const linkText of links) {
            const link = page.getByRole('link', { name: linkText, exact: false });
            if (await link.count() > 0) {
                await link.first().click();
                await expect(page).not.toHaveTitle(/404/i);
                await page.goto('/'); // Return to home for next link
            }
        }
    });

    test('responsiveness check - mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');
        // Check if hero image is visible and not overflowing
        const hero = page.locator('section').first();
        await expect(hero).toBeVisible();

        // Check if horizontal scroll is present (should not be)
        const isHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
        expect(isHorizontalScroll).toBe(false);
    });
});
