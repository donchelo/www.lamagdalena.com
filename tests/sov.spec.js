import { test, expect } from '@playwright/test'

const BASE = '/share-of-voice'

// Helper: navega y espera h1
async function goToSov(page) {
  await page.goto(BASE)
  await expect(page.locator('h1')).toContainText('Share of Voice')
}

// Helper: React date inputs no disparan onChange con fill() estándar.
// Disparamos el evento 'input' manualmente para que React actualice el estado.
async function fillDate(page, testId, value) {
  await page.getByTestId(testId).evaluate((el, v) => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    nativeInputValueSetter.call(el, v)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    el.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}

// Helper: llena todos los campos mínimos necesarios para un submit válido.
// Asegura que exactamente la red `network` esté activa al final.
async function fillValidForm(page, {
  client = 'TestCliente',
  brand = 'MarcaTest',
  competitor = 'CompetidorTest',
  dateFrom = '2025-05-01',
  dateTo = '2025-05-10',
  network = 'instagram',
} = {}) {
  await page.getByTestId('input-client').fill(client)
  await page.getByTestId('input-brand').fill(brand)
  await page.getByTestId('input-competitor-0').fill(competitor)
  await fillDate(page, 'input-date-from', dateFrom)
  await fillDate(page, 'input-date-to', dateTo)
  // Activar la red deseada si no lo está
  const btn = page.getByTestId(`network-${network}`)
  const pressed = await btn.getAttribute('aria-pressed')
  if (pressed !== 'true') await btn.click()
}

// ─── GRUPO 1: Carga y estructura ────────────────────────────────────────────

test.describe('SOV — carga y estructura', () => {
  test('la página carga con título y explicación', async ({ page }) => {
    await goToSov(page)
    await expect(page.locator('h1')).toContainText('Share of Voice')
    await expect(page.locator('text=Compara la presencia digital')).toBeVisible()
    await expect(page.locator('text=¿Qué genera este análisis?')).toBeVisible()
  })

  test('muestra las 4 secciones numeradas', async ({ page }) => {
    await goToSov(page)
    await expect(page.locator('text=Identificación del análisis')).toBeVisible()
    await expect(page.locator('text=Período a analizar')).toBeVisible()
    await expect(page.locator('text=Redes a analizar')).toBeVisible()
    await expect(page.locator('text=Marcas a comparar')).toBeVisible()
  })

  test('Instagram está seleccionado por defecto', async ({ page }) => {
    await goToSov(page)
    await expect(page.getByTestId('network-instagram')).toHaveAttribute('aria-pressed', 'true')
  })

  test('el botón de submit está presente', async ({ page }) => {
    await goToSov(page)
    await expect(page.getByTestId('btn-submit')).toBeVisible()
    await expect(page.getByTestId('btn-submit')).toContainText('ANALIZAR')
  })
})

// ─── GRUPO 2: Selección de redes (multi-select) ─────────────────────────────

test.describe('SOV — selección de redes', () => {
  test('Instagram está activo por defecto', async ({ page }) => {
    await goToSov(page)
    await expect(page.getByTestId('network-instagram')).toHaveAttribute('aria-pressed', 'true')
  })

  test('se pueden activar varias redes a la vez', async ({ page }) => {
    await goToSov(page)
    await page.getByTestId('network-tiktok').click()
    await page.getByTestId('network-twitter').click()
    // Instagram (por defecto) + TikTok + Twitter = 3 activas
    await expect(page.getByTestId('network-instagram')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('network-tiktok')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('network-twitter')).toHaveAttribute('aria-pressed', 'true')
    const activeCount = await page.locator('[data-testid^="network-"][aria-pressed="true"]').count()
    expect(activeCount).toBe(3)
  })

  test('hacer click en una red activa la desactiva (toggle)', async ({ page }) => {
    await goToSov(page)
    await expect(page.getByTestId('network-instagram')).toHaveAttribute('aria-pressed', 'true')
    await page.getByTestId('network-instagram').click()
    await expect(page.getByTestId('network-instagram')).toHaveAttribute('aria-pressed', 'false')
  })

  test('el estimador de costo aparece al seleccionar una red', async ({ page }) => {
    await goToSov(page)
    await expect(page.getByTestId('cost-estimator')).toBeVisible()
  })

  test('el estimador actualiza el número de scrapers al agregar redes', async ({ page }) => {
    await goToSov(page)
    // 1 red × 1 entidad (sin competidor con nombre) = 1 scraper
    await expect(page.getByTestId('cost-estimator')).toContainText('1 scraper')
    // Agregar una segunda red
    await page.getByTestId('network-tiktok').click()
    // 2 redes × 1 entidad = 2 scrapers
    await expect(page.getByTestId('cost-estimator')).toContainText('2 scraper')
  })

  test('el preview muestra las redes seleccionadas', async ({ page }) => {
    await goToSov(page)
    await page.getByTestId('input-brand').fill('Pepsi')
    await page.getByTestId('network-tiktok').click()
    await expect(page.getByTestId('preview-network-label')).toContainText('TikTok')
    await expect(page.getByTestId('preview-network-label')).toContainText('Instagram')
  })
})

// ─── GRUPO 3: Validación de fechas ──────────────────────────────────────────

test.describe('SOV — validación de fechas', () => {
  test('muestra contador de días cuando ambas fechas están llenas', async ({ page }) => {
    await goToSov(page)
    await fillDate(page, 'input-date-from', '2025-05-01')
    await fillDate(page, 'input-date-to', '2025-05-10')
    // 9 días entre 01 y 10 de mayo
    await expect(page.locator('[data-testid="date-counter"]')).toContainText('9')
  })

  test('el contador se pone rojo si supera 15 días', async ({ page }) => {
    await goToSov(page)
    await fillDate(page, 'input-date-from', '2025-05-01')
    await fillDate(page, 'input-date-to', '2025-05-21')
    // 20 días — supera el límite
    await expect(page.locator('[data-testid="date-counter"]')).toContainText('20')
    await expect(page.locator('[data-testid="date-counter"]')).toContainText('reduce')
  })

  test('submit con rango > 15 días muestra error', async ({ page }) => {
    await goToSov(page)
    await page.getByTestId('input-client').fill('TestCliente')
    await page.getByTestId('input-brand').fill('MarcaTest')
    await page.getByTestId('input-competitor-0').fill('Competidor')
    await fillDate(page, 'input-date-from', '2025-05-01')
    await fillDate(page, 'input-date-to', '2025-05-21')  // 20 días
    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('form-error')).toBeVisible()
    await expect(page.getByTestId('form-error')).toContainText('máximo')
  })

  test('submit con exactamente 15 días no muestra error de fechas', async ({ page }) => {
    await page.route('/api/sov', route => {
      route.request().method() === 'POST'
        ? route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ sovId: 'test-id' }) })
        : route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })

    await goToSov(page)
    await page.getByTestId('input-client').fill('TestCliente')
    await page.getByTestId('input-brand').fill('MarcaTest')
    await page.getByTestId('input-competitor-0').fill('Competidor')
    await fillDate(page, 'input-date-from', '2025-05-01')
    await fillDate(page, 'input-date-to', '2025-05-16')  // exactamente 15 días

    await page.getByTestId('btn-submit').click()
    // Si hay error visible, no debe ser de fechas
    const errorEl = page.getByTestId('form-error')
    if (await errorEl.isVisible().catch(() => false)) {
      await expect(errorEl).not.toContainText('máximo')
    }
  })
})

// ─── GRUPO 4: Validación de campos requeridos ────────────────────────────────

test.describe('SOV — validación de campos requeridos', () => {
  test('sin cliente muestra error', async ({ page }) => {
    await goToSov(page)
    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('form-error')).toContainText('cliente')
  })

  test('sin marca muestra error', async ({ page }) => {
    await goToSov(page)
    await page.getByTestId('input-client').fill('Cliente')
    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('form-error')).toContainText('marca')
  })

  test('sin fechas muestra error', async ({ page }) => {
    await goToSov(page)
    await page.getByTestId('input-client').fill('Cliente')
    await page.getByTestId('input-brand').fill('Marca')
    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('form-error')).toContainText('fecha')
  })

  test('sin competidor muestra error', async ({ page }) => {
    await goToSov(page)
    await page.getByTestId('input-client').fill('Cliente')
    await page.getByTestId('input-brand').fill('Marca')
    await fillDate(page, 'input-date-from', '2025-05-01')
    await fillDate(page, 'input-date-to', '2025-05-10')
    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('form-error')).toContainText('competidor')
  })
})

// ─── GRUPO 5: Funcionalidad de marcas ───────────────────────────────────────

test.describe('SOV — gestión de marcas', () => {
  test('se puede agregar hasta 5 competidores', async ({ page }) => {
    await goToSov(page)
    for (let i = 0; i < 4; i++) {
      await page.getByTestId('btn-add-competitor').click()
    }
    await expect(page.getByTestId('btn-add-competitor')).not.toBeVisible()
  })

  test('se puede eliminar un competidor', async ({ page }) => {
    await goToSov(page)
    await page.getByTestId('btn-add-competitor').click()
    // Con 2 competidores deben aparecer 2 botones de eliminar
    await expect(page.getByTestId('btn-remove-competitor')).toHaveCount(2)
    await page.getByTestId('btn-remove-competitor').first().click()
    // Después de eliminar uno, vuelve a 1 competidor → botón de eliminar desaparece
    await expect(page.getByTestId('btn-remove-competitor')).toHaveCount(0)
  })

  test('el preview aparece al escribir el nombre de marca', async ({ page }) => {
    await goToSov(page)
    await page.getByTestId('input-brand').fill('Pepsi')
    await expect(page.getByTestId('search-preview')).toBeVisible()
    await expect(page.getByTestId('search-preview')).toContainText('@pepsi')
  })
})

// ─── GRUPO 6: Submit con mock de API ────────────────────────────────────────

test.describe('SOV — flujo de submit', () => {
  test('submit exitoso redirige al detalle del análisis', async ({ page }) => {
    const mockSovId = 'mock-sov-123'
    await page.route('/api/sov', route => {
      route.request().method() === 'POST'
        ? route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ sovId: mockSovId }) })
        : route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })

    await goToSov(page)
    await fillValidForm(page, { network: 'tiktok' })
    await page.getByTestId('btn-submit').click()
    await page.waitForURL(`**/${mockSovId}`)
    expect(page.url()).toContain(mockSovId)
  })

  test('el botón muestra "INICIANDO" durante el submit', async ({ page }) => {
    await page.route('/api/sov', async route => {
      if (route.request().method() === 'POST') {
        await new Promise(r => setTimeout(r, 400))
        route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ sovId: 'slow-id' }) })
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      }
    })

    await goToSov(page)
    await fillValidForm(page)
    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('btn-submit')).toContainText('INICIANDO')
    await expect(page.getByTestId('btn-submit')).toBeDisabled()
  })

  test('error del servidor muestra mensaje de error', async ({ page }) => {
    await page.route('/api/sov', route => {
      route.request().method() === 'POST'
        ? route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Error simulado del servidor' }) })
        : route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
    })

    await goToSov(page)
    await fillValidForm(page)
    await page.getByTestId('btn-submit').click()
    await expect(page.getByTestId('form-error')).toBeVisible()
    await expect(page.getByTestId('form-error')).toContainText('Error simulado')
  })

  test('el POST envía selectedNetworks como array con las redes activas', async ({ page }) => {
    let capturedBody = null
    await page.route('/api/sov', async route => {
      if (route.request().method() === 'POST') {
        capturedBody = await route.request().postDataJSON()
        route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ sovId: 'x' }) })
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      }
    })

    await goToSov(page)
    // Activar solo TikTok (desactivar Instagram primero)
    await page.getByTestId('network-instagram').click()  // desactivar
    await fillValidForm(page, { network: 'tiktok' })
    await page.getByTestId('btn-submit').click()
    await page.waitForURL('**/x')

    expect(capturedBody).not.toBeNull()
    expect(Array.isArray(capturedBody.selectedNetworks)).toBe(true)
    expect(capturedBody.selectedNetworks).toContain('tiktok')
  })
})
