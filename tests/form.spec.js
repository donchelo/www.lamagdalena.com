import { test, expect } from '@playwright/test';

test.describe('Formulario Contemos Historias', () => {
    test('debe enviar el formulario exitosamente y mostrar mensaje de agradecimiento', async ({ page }) => {
        try {
            console.log('Navigating to http://localhost:5173/ ...');
            await page.goto('http://localhost:5173/', { waitUntil: 'load', timeout: 60000 });

            // Wait for the page to settle
            await page.waitForTimeout(5000);

            console.log('Looking for "Contemos historias" text...');
            const heading = page.getByText('Contemos historias', { exact: false });
            await expect(heading).toBeVisible({ timeout: 20000 });

            console.log('Scrolling to heading...');
            await heading.scrollIntoViewIfNeeded();

            console.log('Filling form fields by label...');
            await page.getByLabel('*email').fill('test@example.com');
            await page.getByLabel('*asunto').fill('Prueba de historia');
            await page.getByLabel('*mensaje').fill('Esta es una historia de prueba para verificar el formulario.');

            console.log('Clicking "Enviar" button...');
            await page.getByRole('button', { name: 'Enviar' }).click({ force: true });

            console.log('Checking for success message...');
            await page.waitForSelector('.success-message', { state: 'visible', timeout: 20000 });
            const successMessage = page.locator('.success-message');
            await expect(successMessage).toContainText('¡Gracias!');

            console.log('Test completed successfully!');
        } catch (error) {
            console.error('Test failed.');
            await page.screenshot({ path: 'tests/error-text-based.png' });
            throw error;
        }
    });
});
