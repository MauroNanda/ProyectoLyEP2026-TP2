// Prueba optativa: backend real y Atlas en colecciones temporales propias.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { crearRepositorioSeguridad } from '../../server/models/seguridad.js';
import { crearServicioSeguridad } from '../../server/services/seguridad.js';
import { crearControladoresClientes } from '../../server/controllers/clientes.js';
import { crearServicioClientes } from '../../server/services/clientes.js';
import { crearApp } from '../../server/app.js';
const require = createRequire(import.meta.url);
const { MongoClient } = createRequire(new URL('../../server/package.json', import.meta.url))('mongodb');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = fileURLToPath(new URL('../../', import.meta.url));
if (!process.env.MONGODB_URI) process.loadEnvFile(path.join(root, 'server/.env'));
const prefijo = 'apacheta_frontend_verificacion_' + randomUUID().replaceAll('-', '');
const colecciones = ['usuarios', 'sesiones', 'auditoria', 'control', 'clientes'].map(c => prefijo + '_' + c);
assert(/^apacheta_frontend_verificacion_[a-f0-9]{32}$/.test(prefijo));
const mongo = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
const evidencia = path.join(root, 'openspec/changes/archive/2026-10-04-cuentas-sesiones-permisos-auditoria-frontend/evidence');
const password = 'Temporal privada ' + randomUUID();
const nuevaPassword = 'Otra temporal ' + randomUUID();
const resultados = {};
let servidor, vite, browser, base, pagina;
let limpieza;
const limpiar = () => limpieza ||= (async () => {
  await browser?.close().catch(() => {});
  if (vite && vite.exitCode === null) { vite.kill(); await once(vite, 'exit').catch(() => {}); }
  if (servidor) await new Promise(resolve => servidor.close(resolve));
  if (base) {
    for (const nombre of colecciones) { assert(nombre.startsWith(prefijo + '_')); await base.collection(nombre).drop().catch(e => { if (e.code !== 26) throw e; }); }
    for (const nombre of colecciones) assert.equal((await base.listCollections({ name: nombre }).toArray()).length, 0);
  }
  await mongo.close();
})();
process.once('SIGINT', () => limpiar().finally(() => process.exit(130)));
const comprobar = async (nombre, fn) => { await fn(); resultados[nombre] = true; console.log('OK ' + nombre); };
try {
  await mkdir(evidencia, { recursive: true });
  await mongo.connect(); base = mongo.db(process.env.MONGODB_DB_NAME);
  const db = { collection: clave => { const nombre = prefijo + '_' + clave; assert(colecciones.includes(nombre)); return base.collection(nombre); } };
  const repo = crearRepositorioSeguridad({ obtenerBase: () => db, obtenerCliente: () => mongo });
  await repo.inicializar();
  const seguridad = crearServicioSeguridad({ repo });
  const admin = await seguridad.bootstrap({ nombre: 'Administración de prueba', email: 'admin@example.test', password });
  const sesion = await seguridad.login({ email: admin.email, password }, 'fixture');
  const ctx = await seguridad.autenticar(sesion.token);
  for (const rol of ['Gerencia', 'Soporte']) await seguridad.crearCuenta(ctx, { nombre: rol + ' de prueba', email: rol.toLowerCase() + '@example.test', rol, password }, 'fixture');
  const cliente = await seguridad.crearCliente(ctx, { email: 'cliente@example.test', phone: '+54 388 4000000', name: { firstname: 'Cliente', lastname: 'Prueba' }, address: { city: 'Jujuy' } }, 'fixture');
  const controladores = crearControladoresClientes(crearServicioClientes(repo.clientes));
  const wrap = fn => async (req, res, next) => { try { await fn(req, res); } catch (e) { next(e); } };
  const app = crearApp({ seguridad, logger: {}, corsOrigin: 'http://127.0.0.1:5174', controladores: {
    ...controladores,
    crearCliente: wrap(async (req, res) => res.status(201).json(await seguridad.crearCliente(req.auth, req.body, req.requestId))),
    eliminarCliente: wrap(async (req, res) => { await seguridad.eliminarCliente(req.auth, req.params.id, req.requestId); res.status(204).end(); }),
  } });
  servidor = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  const apiUrl = 'http://127.0.0.1:' + servidor.address().port;
  vite = spawn(process.execPath, [path.join(root, 'client/node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '5174', '--strictPort'], {
    cwd: path.join(root, 'client'), windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, VITE_API_URL: apiUrl + '/api/clientes', VITE_API_BASE_URL: apiUrl + '/api' },
  });
  vite.stdout.resume(); vite.stderr.resume();
  for (let i = 0; i < 80; i++) {
    if (vite.exitCode !== null) throw new Error('Vite no pudo iniciar.');
    try { if ((await fetch('http://127.0.0.1:5174')).ok) break; } catch { /* arranque */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : { channel: 'chrome' }) });
  const contexto = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  pagina = await contexto.newPage();
  const erroresPagina = [];
  pagina.on('pageerror', e => erroresPagina.push(e.name));
  pagina.on('dialog', dialog => dialog.accept());
  const expectVisible = async locator => { await locator.waitFor({ state: 'visible', timeout: 12000 }); };
  const login = async (email, clave = password) => {
    await pagina.goto('http://127.0.0.1:5174/login');
    await pagina.getByLabel('Email', { exact: true }).fill(email);
    await pagina.getByLabel('Contraseña', { exact: true }).fill(clave);
    await pagina.getByRole('button', { name: 'Ingresar', exact: true }).click();
    await expectVisible(pagina.getByRole('heading', { name: 'Inicio', exact: true }));
  };
  const nav = nombre => pagina.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: nombre, exact: true }).click();
  await comprobar('login real, recarga y limpieza de identidad heredada', async () => {
    await pagina.goto('http://127.0.0.1:5174/login');
    await pagina.evaluate(() => { localStorage.setItem('admin', '{malformado'); localStorage.setItem('role', 'Administrador'); localStorage.setItem('tema', 'claro'); });
    await pagina.reload();
    assert.equal(await pagina.locator('select[name="sector"]').count(), 0);
    assert.deepEqual(await pagina.evaluate(() => [localStorage.getItem('admin'), localStorage.getItem('role'), localStorage.getItem('tema')]), [null, null, 'claro']);
    await login(admin.email);
    await expectVisible(pagina.getByText('1 clientes registrados', { exact: true }));
    await pagina.reload(); await expectVisible(pagina.getByRole('heading', { name: 'Volvé a tu equipo' }));
    await login(admin.email);
    assert.equal(await pagina.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }).includes('token')), false);
  });
  await comprobar('alta, edición y restricciones de cuentas', async () => {
    await nav('Cuentas');
    await expectVisible(pagina.getByRole('button', { name: 'Editar cuenta de Administración de prueba', exact: true }));
    await pagina.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
    await pagina.getByLabel('Nombre', { exact: true }).fill('Cuenta temporal con un nombre extenso para revisar el diseño');
    await pagina.getByLabel('Email', { exact: true }).fill('temporal@example.test');
    await pagina.getByLabel('Contraseña inicial', { exact: true }).fill(password);
    await pagina.locator('form').getByRole('button', { name: 'Crear cuenta', exact: true }).click();
    await expectVisible(pagina.getByText('Cuenta creada.', { exact: false }));
    const temporal = await db.collection('usuarios').findOne({ email: 'temporal@example.test' });
    assert(temporal.activo);
    await pagina.getByRole('button', { name: 'Editar cuenta de ' + temporal.nombre, exact: true }).click();
    assert.equal(await pagina.getByLabel('Email', { exact: true }).getAttribute('readonly'), '');
    await pagina.getByLabel('Nombre', { exact: true }).fill('Cuenta actualizada');
    await pagina.getByLabel('Rol', { exact: true }).selectOption('Gerencia');
    await pagina.getByLabel('Estado', { exact: true }).selectOption('false');
    await pagina.getByRole('button', { name: 'Guardar cambios' }).click();
    await expectVisible(pagina.getByText('Cuenta actualizada.', { exact: true }));
    assert.equal((await db.collection('usuarios').findOne({ email: 'temporal@example.test' })).activo, false);
    await pagina.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
    await pagina.getByLabel('Nombre', { exact: true }).fill('Duplicada');
    await pagina.getByLabel('Email', { exact: true }).fill(admin.email);
    await pagina.getByLabel('Contraseña inicial', { exact: true }).fill(password);
    await pagina.locator('form').getByRole('button', { name: 'Crear cuenta', exact: true }).click();
    await expectVisible(pagina.getByText('Ya existe una cuenta con este email.', { exact: true }));
    assert.equal(await pagina.getByLabel('Email', { exact: true }).getAttribute('aria-invalid'), 'true');
    await pagina.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await pagina.getByRole('button', { name: 'Editar cuenta de Administración de prueba', exact: true }).click();
    await pagina.getByLabel('Rol', { exact: true }).selectOption('Gerencia');
    await pagina.getByRole('button', { name: 'Guardar cambios' }).click();
    await expectVisible(pagina.getByText('Debe quedar al menos un administrador activo. Revisá rol y estado.', { exact: true }));
    await pagina.getByRole('button', { name: 'Cancelar', exact: true }).click();
  });
  await comprobar('historial real, cursores, filtros y actor nulo', async () => {
    await assert.rejects(seguridad.login({ email: 'ausente@example.test', password }, 'fixture-fallido'));
    await nav('Historial administrativo');
    await expectVisible(pagina.locator('.audit-list li').first());
    const antesDeEditar = await pagina.locator('.audit-list').innerText();
    let consultasIntermedias = 0;
    const contarConsulta = request => { if (request.url().includes('/api/auditoria?')) consultasIntermedias++; };
    pagina.on('request', contarConsulta);
    await pagina.getByLabel('Eventos por consulta').fill('1');
    await pagina.evaluate(() => new Promise(r => requestAnimationFrame(r)));
    assert.equal(consultasIntermedias, 0);
    assert.equal(await pagina.locator('.audit-list').innerText(), antesDeEditar);
    pagina.off('request', contarConsulta);
    await pagina.getByRole('button', { name: 'Actualizar historial', exact: true }).click();
    await expectVisible(pagina.locator('.audit-list li').first());
    await pagina.getByRole('button', { name: 'Siguiente', exact: true }).waitFor({ state: 'visible' });
    await pagina.waitForFunction(() => !document.querySelector('.cursor-navigation button:last-child').disabled);
    const primero = await pagina.locator('.audit-list li').innerText();
    await pagina.getByRole('button', { name: 'Siguiente', exact: true }).click();
    await pagina.waitForFunction(() => !document.querySelector('.cursor-navigation button:first-child').disabled);
    assert.notEqual(await pagina.locator('.audit-list li').innerText(), primero);
    await pagina.getByRole('button', { name: 'Anterior', exact: true }).click();
    await pagina.waitForFunction(() => !document.querySelector('.cursor-navigation button:last-child').disabled);
    assert.equal(await pagina.locator('.audit-list li').innerText(), primero);
    await pagina.getByLabel('Tipo de evento').selectOption('LOGIN_FALLIDO');
    await pagina.getByRole('button', { name: 'Actualizar historial', exact: true }).click();
    await expectVisible(pagina.getByText('Sin actor identificado', { exact: true }));
    assert.equal(await pagina.getByRole('button', { name: 'Anterior', exact: true }).isDisabled(), true);
    assert.equal(await pagina.getByRole('button', { name: 'Siguiente', exact: true }).isDisabled(), true);
    await pagina.getByLabel('Desde', { exact: true }).fill('2026-10-05T18:00');
    await pagina.getByLabel('Hasta', { exact: true }).fill('2026-10-04T18:00');
    await pagina.getByRole('button', { name: 'Actualizar historial', exact: true }).click();
    await expectVisible(pagina.locator('#campo-desde-error'));
    await pagina.getByRole('button', { name: 'Limpiar filtros' }).click();
    await expectVisible(pagina.locator('.audit-list li').first());
  });
  await comprobar('diseño responsive, teclado y zoom', async () => {
    for (const [ancho, alto, sufijo] of [[1280, 900, 'desktop'], [768, 1024, 'tablet'], [360, 800, 'mobile']]) {
      await pagina.setViewportSize({ width: ancho, height: alto });
      await nav('Cuentas'); await expectVisible(pagina.locator('.admin-table tbody tr').first());
      assert(await pagina.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Desbordamiento en Cuentas a ' + ancho + ' px');
      if (!process.env.SKIP_VISUAL_CAPTURE) await pagina.screenshot({ path: path.join(evidencia, sufijo + '-cuentas.png'), fullPage: true });
      await nav('Historial administrativo'); await expectVisible(pagina.locator('.audit-list li').first());
      assert(await pagina.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Desbordamiento en Historial a ' + ancho + ' px');
      if (!process.env.SKIP_VISUAL_CAPTURE) await pagina.screenshot({ path: path.join(evidencia, sufijo + '-historial.png'), fullPage: true });
      await nav('Mi cuenta'); await expectVisible(pagina.getByRole('heading', { name: 'Cambiar contraseña', exact: true }));
      assert(await pagina.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Desbordamiento en Mi cuenta a ' + ancho + ' px');
      if (!process.env.SKIP_VISUAL_CAPTURE) await pagina.screenshot({ path: path.join(evidencia, sufijo + '-mi-cuenta.png'), fullPage: true });
    }
    await pagina.getByLabel('Contraseña actual', { exact: true }).focus();
    await pagina.keyboard.press('Tab');
    assert.equal(await pagina.locator(':focus').getAttribute('name'), 'nueva');
    const foco = await pagina.locator(':focus').evaluate(e => getComputedStyle(e).outlineWidth);
    assert.notEqual(foco, '0px');
    await pagina.setViewportSize({ width: 640, height: 450 }); // equivalente al reflow de 1280 px a 200 %
    assert(await pagina.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await pagina.emulateMedia({ reducedMotion: 'reduce' });
  });
  await comprobar('estados controlados: campos, permiso, cursor, red y respuestas tardías', async () => {
    await nav('Clientes');
    await pagina.getByRole('button', { name: 'Agregar cliente', exact: true }).click();
    await pagina.getByLabel('Nombre', { exact: true }).fill('Validación controlada');
    await pagina.getByLabel('Email', { exact: true }).fill('controlada@example.test');
    await pagina.getByLabel('Teléfono', { exact: true }).fill('+54 388 4000000');
    await pagina.getByLabel('Ciudad', { exact: true }).fill('Salta');
    const rechazarCampo = route => route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: { code: 'ENTRADA_INVALIDA', campos: ['phone', 'address.city', 'consulta'] } }) });
    await pagina.route('**/api/clientes', rechazarCampo);
    await pagina.getByRole('button', { name: 'Guardar cliente', exact: true }).click();
    await expectVisible(pagina.locator('#error-telefono'));
    assert.equal(await pagina.getByLabel('Ciudad', { exact: true }).getAttribute('aria-invalid'), 'true');
    assert.equal(await pagina.getByLabel('Nombre', { exact: true }).inputValue(), 'Validación controlada');
    await pagina.unroute('**/api/clientes', rechazarCampo);
    await nav('Clientes'); // se conserva el formulario en la misma ruta
    await nav('Historial administrativo');
    await expectVisible(pagina.locator('.audit-list li').first());
    await pagina.getByLabel('Eventos por consulta').fill('1');
    await pagina.getByRole('button', { name: 'Actualizar historial', exact: true }).click();
    await pagina.waitForFunction(() => !document.querySelector('.cursor-navigation button:last-child').disabled);
    const paginaAnterior = await pagina.locator('.audit-list li').innerText();
    const falloCursor = route => new URL(route.request().url()).searchParams.has('cursor') ? route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: { code: 'ENTRADA_INVALIDA', campos: ['cursor'] } }) }) : route.continue();
    await pagina.route('**/api/auditoria?**', falloCursor);
    await pagina.getByRole('button', { name: 'Siguiente', exact: true }).click();
    await expectVisible(pagina.getByText('Revisá los campos indicados e intentá nuevamente.', { exact: false }));
    assert.equal(await pagina.locator('.audit-list li').innerText(), paginaAnterior);
    await pagina.unroute('**/api/auditoria?**', falloCursor);
    let liberar, viejaFinalizada, llego;
    const llegada = new Promise(r => { llego = r; });
    const liberacion = new Promise(r => { liberar = r; });
    const finalizacion = new Promise(r => { viejaFinalizada = r; });
    const demorar = async route => {
      if (new URL(route.request().url()).searchParams.get('tipo') !== 'LOGIN_CORRECTO') return route.continue();
      llego();
      const respuesta = await route.fetch();
      await liberacion; await route.fulfill({ response: respuesta }); viejaFinalizada();
    };
    await pagina.route('**/api/auditoria?**', demorar);
    await pagina.getByLabel('Tipo de evento').selectOption('LOGIN_CORRECTO');
    await pagina.getByRole('button', { name: 'Actualizar historial', exact: true }).click();
    await llegada;
    await pagina.getByLabel('Tipo de evento').selectOption('LOGIN_FALLIDO');
    await pagina.getByRole('button', { name: 'Actualizar historial', exact: true }).click();
    await expectVisible(pagina.getByText('Sin actor identificado', { exact: true }));
    liberar(); await finalizacion;
    await pagina.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    assert.equal(await pagina.locator('.audit-list li').count(), 1);
    assert((await pagina.locator('.audit-list li').innerText()).includes('LOGIN FALLIDO'));
    await pagina.unroute('**/api/auditoria?**', demorar);
    const falloCuentas = route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { code: 'ALMACENAMIENTO_FALLIDO' } }) });
    await pagina.route('**/api/usuarios', falloCuentas);
    await nav('Inicio');
    await expectVisible(pagina.getByText('1 clientes registrados', { exact: true }));
    await expectVisible(pagina.getByText('El almacenamiento no está disponible. Intentá nuevamente más tarde.', { exact: true }));
    await pagina.unroute('**/api/usuarios', falloCuentas);
    await nav('Clientes'); await pagina.getByRole('link', { name: 'Ver ficha de Cliente Prueba', exact: true }).click();
    await expectVisible(pagina.getByRole('button', { name: 'Eliminar cliente', exact: true }));
    const falloPermiso = route => route.request().method() === 'DELETE' ? route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ error: { code: 'SIN_PERMISO' } }) }) : route.continue();
    await pagina.route('**/api/clientes/*', falloPermiso);
    await pagina.getByRole('button', { name: 'Eliminar cliente', exact: true }).click();
    await pagina.getByRole('dialog').getByRole('button', { name: 'Confirmar eliminación', exact: true }).click();
    await expectVisible(pagina.getByText('No tenés permiso para esta operación.', { exact: true }));
    assert(await pagina.getByRole('navigation', { name: 'Navegación principal' }).isVisible());
    await pagina.getByRole('dialog').getByRole('button', { name: 'Cancelar', exact: true }).click();
    await pagina.unroute('**/api/clientes/*', falloPermiso);
    await nav('Mi cuenta');
  });
  await comprobar('password incorrecta conserva sesión y cambio real la cierra', async () => {
    await pagina.getByLabel('Contraseña actual', { exact: true }).fill('incorrecta valida');
    await pagina.getByLabel('Nueva contraseña', { exact: true }).fill(nuevaPassword);
    await pagina.getByLabel('Confirmar nueva contraseña', { exact: true }).fill(nuevaPassword);
    await pagina.getByRole('button', { name: 'Cambiar contraseña', exact: true }).click();
    await expectVisible(pagina.getByText('Revisá tu contraseña actual.', { exact: true }));
    await pagina.getByLabel('Contraseña actual', { exact: true }).fill(password);
    await pagina.getByRole('button', { name: 'Cambiar contraseña', exact: true }).click();
    await expectVisible(pagina.getByRole('heading', { name: 'Volvé a tu equipo' }));
    assert.equal((await db.collection('sesiones').find({ usuarioId: (await db.collection('usuarios').findOne({ email: admin.email }))._id, revokedAt: null }).toArray()).length, 0);
  });
  await comprobar('Soporte no consulta administración y conserva alta comercial', async () => {
    const administrativas = [];
    const registrar = req => { if (/\/api\/(usuarios|auditoria)/.test(req.url())) administrativas.push(req.url()); };
    pagina.on('request', registrar);
    await login('soporte@example.test');
    assert.equal(await pagina.getByRole('link', { name: 'Cuentas', exact: true }).count(), 0);
    await pagina.goto('http://127.0.0.1:5174/cuentas');
    await expectVisible(pagina.getByRole('heading', { name: 'Volvé a tu equipo' })); // recarga exige login
    await login('soporte@example.test');
    await pagina.evaluate(() => { history.pushState({}, '', '/cuentas'); window.dispatchEvent(new PopStateEvent('popstate')); });
    await expectVisible(pagina.getByRole('heading', { name: 'Acceso no permitido' }));
    await nav('Clientes'); await expectVisible(pagina.getByRole('link', { name: 'Ver ficha de Cliente Prueba', exact: true }));
    await pagina.getByRole('link', { name: 'Ver ficha de Cliente Prueba', exact: true }).click();
    assert.equal(await pagina.getByRole('button', { name: 'Eliminar cliente', exact: true }).count(), 0);
    await nav('Clientes'); await pagina.getByRole('button', { name: 'Agregar cliente', exact: true }).click();
    await pagina.getByLabel('Nombre', { exact: true }).fill('Cliente navegador');
    await pagina.getByLabel('Email', { exact: true }).fill('navegador@example.test');
    await pagina.getByLabel('Teléfono', { exact: true }).fill('+54 388 4001111');
    await pagina.getByLabel('Ciudad', { exact: true }).fill('Salta');
    await pagina.getByRole('button', { name: 'Guardar cliente', exact: true }).click();
    await expectVisible(pagina.getByText('Cliente creado correctamente.', { exact: false }));
    assert(new URL(pagina.url()).searchParams.get('alta') === '1');
    await pagina.getByLabel('Buscar por apellido o ciudad').fill('Salta');
    await pagina.waitForURL(url => url.searchParams.get('q') === 'Salta');
    await expectVisible(pagina.getByText('1 cliente encontrado', { exact: true }));
    assert(await db.collection('clientes').findOne({ email: 'navegador@example.test' }));
    assert.equal(administrativas.length, 0); pagina.off('request', registrar);
    await pagina.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
    await expectVisible(pagina.getByRole('heading', { name: 'Volvé a tu equipo' }));
  });
  await comprobar('Gerencia elimina y mantiene prohibición administrativa', async () => {
    await login('gerencia@example.test');
    assert.equal(await pagina.getByRole('link', { name: 'Cuentas', exact: true }).count(), 0);
    await nav('Clientes');
    await pagina.getByRole('link', { name: 'Ver ficha de Cliente Prueba', exact: true }).click();
    await pagina.getByRole('button', { name: 'Eliminar cliente', exact: true }).click();
    await pagina.getByRole('dialog').getByRole('button', { name: 'Confirmar eliminación', exact: true }).click();
    await expectVisible(pagina.getByText('Cliente eliminado correctamente.', { exact: true }));
    assert.equal(await db.collection('clientes').findOne({ _id: new (createRequire(new URL('../../server/package.json', import.meta.url))('mongodb').ObjectId)(cliente.id) }), null);
    await pagina.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
    await expectVisible(pagina.getByRole('heading', { name: 'Volvé a tu equipo' }));
  });
  await comprobar('Administrador baja, revocación por estado y persistencia', async () => {
    await login(admin.email, nuevaPassword);
    await nav('Clientes'); await pagina.getByRole('link', { name: /Ver ficha de Cliente navegador/ }).click();
    await expectVisible(pagina.getByRole('button', { name: 'Eliminar cliente', exact: true }));
    await pagina.getByRole('button', { name: 'Eliminar cliente', exact: true }).click();
    await pagina.getByRole('dialog').getByRole('button', { name: 'Confirmar eliminación', exact: true }).click();
    await expectVisible(pagina.getByText('Cliente eliminado correctamente.', { exact: true }));
    const soporte = await db.collection('usuarios').findOne({ email: 'soporte@example.test' });
    const ss = await seguridad.login({ email: soporte.email, password }, 'fixture');
    await seguridad.actualizarCuenta(await seguridad.autenticar((await seguridad.login({ email: admin.email, password: nuevaPassword }, 'fixture')).token), soporte._id.toHexString(), { activo: false }, 'fixture');
    assert.equal((await fetch(apiUrl + '/api/auth/me', { headers: { Authorization: 'Bearer ' + ss.token } })).status, 401);
    const lector = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    try { await lector.connect(); assert(await lector.db(process.env.MONGODB_DB_NAME).collection(prefijo + '_usuarios').findOne({ email: 'temporal@example.test', activo: false })); }
    finally { await lector.close(); }
  });
  await comprobar('cambio de rol propio termina acceso administrativo', async () => {
    const contextoAdmin = await seguridad.autenticar((await seguridad.login({ email: admin.email, password: nuevaPassword }, 'fixture')).token);
    await seguridad.crearCuenta(contextoAdmin, { nombre: 'Otro administrador', email: 'otro-admin@example.test', rol: 'Administrador', password }, 'fixture');
    await nav('Cuentas');
    await pagina.getByRole('button', { name: 'Editar cuenta de Administración de prueba', exact: true }).click();
    await pagina.getByLabel('Rol', { exact: true }).selectOption('Gerencia');
    await pagina.getByRole('button', { name: 'Guardar cambios', exact: true }).click();
    await expectVisible(pagina.getByRole('heading', { name: 'Volvé a tu equipo' }));
    assert.equal(await pagina.getByRole('link', { name: 'Cuentas', exact: true }).count(), 0);
    assert.equal((await db.collection('usuarios').findOne({ email: admin.email })).rol, 'Gerencia');
  });
  assert.deepEqual(erroresPagina, []);
  await writeFile(path.join(evidencia, 'resultados.json'), JSON.stringify({ fecha: new Date().toISOString(), resultados, erroresPagina, aislamiento: 'Cinco colecciones temporales propias; ninguna colección compartida.', limpieza: 'pendiente de finalizar' }, null, 2));
  await limpiar();
  for (const nombre of ['fallo.txt', 'layout-fallo.json']) await unlink(path.join(evidencia, nombre)).catch(e => { if (e.code !== 'ENOENT') throw e; });
  const reporte = { fecha: new Date().toISOString(), resultados, erroresPagina, limpieza: 'Cinco colecciones temporales eliminadas y verificado que no quedan.' };
  await writeFile(path.join(evidencia, 'resultados.json'), JSON.stringify(reporte, null, 2));
  console.log(JSON.stringify(reporte));
} catch (error) {
  const diagnostico = String(error.stack).replaceAll(password, '[contraseña oculta]').replaceAll(nuevaPassword, '[contraseña oculta]').replaceAll(process.env.MONGODB_URI || '[sin-uri]', '[URI oculta]');
  await writeFile(path.join(evidencia, 'fallo.txt'), diagnostico);
  if (pagina && !pagina.isClosed()) {
    await writeFile(path.join(evidencia, 'layout-fallo.json'), JSON.stringify(await pagina.evaluate(() => ({
      ancho: innerWidth, documento: document.documentElement.scrollWidth,
      desbordados: [...document.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).map(e => ({ tag: e.tagName, clase: e.className, ancho: e.getBoundingClientRect().width })).slice(0, 25),
    })), null, 2));
  }
  console.error('Verificación incompleta: ' + error.name + '. Revisar el paso que sigue al último OK; no se imprimen secretos.');
  process.exitCode = 1;
} finally { await limpiar(); }
