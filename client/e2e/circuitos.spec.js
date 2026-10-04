import { test, expect, login } from './fixtures.js';

test('login, recarga sin sesión y logout', async ({ page, entorno }) => {
  await login(page, entorno);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Ingresar', exact: true })).toBeVisible();
  await login(page, entorno);
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Ingresar', exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }).includes('token'))).toBe(false);
});

test('Gerencia y Soporte no consultan recursos administrativos', async ({ page, entorno }) => {
  const administrativas = [];
  page.on('request', r => { if (/\/api\/(usuarios|auditoria)/.test(r.url())) administrativas.push(r.url()); });
  for (const rol of ['gerencia', 'soporte']) {
    await login(page, entorno, rol + '@example.test');
    await expect(page.getByRole('link', { name: 'Cuentas', exact: true })).toHaveCount(0);
    await page.evaluate(() => { history.pushState({}, '', '/cuentas'); dispatchEvent(new PopStateEvent('popstate')); });
    await expect(page.getByRole('heading', { name: 'Acceso no permitido', exact: true })).toBeVisible();
  }
  expect(administrativas).toEqual([]);
});

test('cuentas: búsqueda combinada, alta y desactivación revocan acceso', async ({ page, browser, entorno }) => {
  await login(page, entorno);
  await page.getByRole('link', { name: 'Cuentas', exact: true }).click();
  await expect(page.locator('.admin-table tbody tr')).toHaveCount(3);
  await page.getByLabel('Buscar por nombre o email').fill('SOPORTE@');
  await page.getByLabel('Filtrar por rol').selectOption('Soporte');
  await page.getByLabel('Filtrar por estado').selectOption('true');
  await expect(page.locator('.admin-table tbody tr')).toHaveCount(1);
  await page.getByLabel('Filtrar por estado').selectOption('false');
  await expect(page.getByText('No hay cuentas que coincidan con estos filtros.')).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros', exact: true }).click();
  await page.locator('.page-heading').getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await page.getByLabel('Nombre', { exact: true }).fill('Temporal E2E');
  await page.getByLabel('Email', { exact: true }).fill('temporal@example.test');
  await page.getByLabel('Contraseña inicial').fill(entorno.password);
  await page.locator('.account-editor').getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page.locator('.admin-table tbody tr')).toHaveCount(4);
  const context = await browser.newContext();
  try {
    const otra = await context.newPage(); await login(otra, entorno, 'temporal@example.test');
    page.on('dialog', d => d.accept());
    await page.getByRole('button', { name: 'Editar cuenta de Temporal E2E', exact: true }).click();
    await page.getByLabel('Estado', { exact: true }).selectOption('false');
    await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click();
    await expect(page.getByText('Cuenta actualizada.', { exact: true })).toBeVisible();
    await otra.getByRole('link', { name: 'Mi cuenta', exact: true }).click();
    await expect(otra.getByRole('button', { name: 'Ingresar', exact: true })).toBeVisible();
  } finally { await context.close(); }
});

test('contraseña: rechazo conserva sesión y cambio cierra acceso', async ({ page, entorno }) => {
  await login(page, entorno);
  await page.getByRole('link', { name: 'Mi cuenta', exact: true }).click();
  const nueva = 'Nueva contraseña E2E válida';
  await page.getByLabel('Contraseña actual', { exact: true }).fill('Incorrecta pero válida');
  await page.getByLabel('Nueva contraseña', { exact: true }).fill(nueva);
  await page.getByLabel('Confirmar nueva contraseña', { exact: true }).fill(nueva);
  await page.getByRole('button', { name: 'Cambiar contraseña', exact: true }).click();
  await expect(page.getByLabel('Contraseña actual', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await page.getByLabel('Contraseña actual', { exact: true }).fill(entorno.password);
  await page.getByRole('button', { name: 'Cambiar contraseña', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Ingresar', exact: true })).toBeVisible();
  await login(page, entorno, 'admin@example.test', nueva);
});
