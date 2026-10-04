import test from 'node:test';
import assert from 'node:assert/strict';
import { crearSesionStore, limpiarIdentidadHeredada, permisosDe, ROLES } from '../src/services/sesionStore.js';
import { crearApiClient, resolverUrls, ErrorApi } from '../src/services/apiClient.js';
import { crearAutorizacionesService } from '../src/services/autorizacionesServices.js';
import { crearClientesService } from '../src/services/clientesService.js';
import { crearCuentasService } from '../src/services/cuentasService.js';
import { crearAuditoriaService, prepararFiltros, TIPOS_EVENTO } from '../src/services/auditoriaService.js';
import { passwordValida, validarAcceso, validarCuenta, validarCliente, validarPassword, cambioCuenta, erroresDeApi, datosCliente, mensajeError } from '../src/services/validacion.js';
const inicio = 1800000000000;
const usuario = { id: 'a'.repeat(24), nombre: 'Prueba', email: 'prueba@example.test', rol: 'Administrador', activo: true };
const datos = (token = 'token-prueba') => ({ token, usuario, expiresAt: new Date(inicio + 10000).toISOString() });
const response = (status = 200, body = {}, headers = {}) => new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
const setup = (transporte, ahora = () => inicio) => {
  const store = crearSesionStore({ ahora }); store.iniciar(datos());
  const http = crearApiClient({ store, transporte }); return { store, http, auth: crearAutorizacionesService(http, store) };
};

test('URLs: default, prefijos, base explícita y configuración insegura', () => {
  assert.deepEqual(resolverUrls(), { clientes: 'http://localhost:3001/api/clientes', base: 'http://localhost:3001/api' });
  assert.equal(resolverUrls({ VITE_API_URL: 'https://ejemplo.test/prefijo/api/clientes/' }).base, 'https://ejemplo.test/prefijo/api');
  assert.equal(resolverUrls({ VITE_API_URL: 'https://ejemplo.test/comercial', VITE_API_BASE_URL: 'https://ejemplo.test/api' }).base, 'https://ejemplo.test/api');
  for (const env of [{ VITE_API_URL: 'https://ejemplo.test/comercial' },
    { VITE_API_BASE_URL: 'https://otro.test/api' }, { VITE_API_URL: 'http://u:p@localhost:3001/api/clientes' },
    { VITE_API_URL: 'http://localhost:3001/api/clientes?q=x' }]) assert.throws(() => resolverUrls(env), { code: 'CONFIGURACION' });
});
test('cada servicio protegido transmite Bearer y no duplica rutas ni cuerpos', async () => {
  const calls = [];
  const { http } = setup(async (url, options) => { calls.push({ url, ...options }); return response(options.method === 'DELETE' ? 204 : 200); });
  const clientes = crearClientesService(http), cuentas = crearCuentasService(http), auditoria = crearAuditoriaService(http);
  await clientes.obtenerClientes(); await clientes.obtenerClientePorId(usuario.id); await clientes.crearCliente({ phone: '1234567' }); await clientes.eliminarCliente(usuario.id);
  await cuentas.listar(); await cuentas.crear({ nombre: 'A' }); await cuentas.actualizar(usuario.id, { activo: false }); await auditoria.consultar({ limit: '1' }, 'opaco/+==');
  assert.equal(calls.length, 8);
  for (const call of calls) { assert.equal(call.headers.Authorization, 'Bearer token-prueba'); assert.equal(call.credentials, 'omit'); assert.equal(call.redirect, 'error'); }
  assert(calls[1].url.endsWith('/api/clientes/' + usuario.id));
  assert.deepEqual(JSON.parse(calls[2].body), { phone: '1234567' });
  assert.equal(new URL(calls[7].url).searchParams.get('cursor'), 'opaco/+==');
});
test('login no envía Bearer ni rol y guarda solo la sesión devuelta', async () => {
  let call;
  const { auth, store } = setup(async (_url, options) => { call = options; return response(200, datos('nuevo')); });
  await auth.login('a@example.test', ' espacios cuentan ');
  assert.equal(call.headers.Authorization, undefined);
  assert.deepEqual(JSON.parse(call.body), { email: 'a@example.test', password: ' espacios cuentan ' });
  assert.equal(store.getSnapshot().sesion.token, 'nuevo');
});
test('identidad heredada no restaura sesión y conserva almacenamiento ajeno', () => {
  const valores = new Map([['admin', '{malformado'], ['role', 'Administrador'], ['tema', 'claro']]);
  limpiarIdentidadHeredada({ removeItem: key => valores.delete(key) });
  assert.deepEqual([...valores], [['tema', 'claro']]);
  assert.equal(crearSesionStore().getSnapshot().sesion, null);
  assert.doesNotThrow(() => limpiarIdentidadHeredada({ removeItem() { throw new Error(); } }));
});
test('vencimiento impide solicitud incluso tras suspensión', async () => {
  let reloj = inicio, llamadas = 0;
  const { http, store } = setup(async () => { llamadas++; return response(); }, () => reloj);
  reloj += 10001;
  await assert.rejects(http('clientes'), { status: 401 });
  assert.equal(llamadas, 0); assert.equal(store.getSnapshot().sesion, null);
});
test('401 protegido limpia sesión pero 403 y errores de red la conservan', async () => {
  for (const status of [401, 403, 500, 503]) {
    const { http, store } = setup(async () => response(status, { error: { code: status === 401 ? 'NO_AUTENTICADO' : 'SIN_PERMISO' } }));
    await assert.rejects(http('clientes'), { status });
    assert.equal(!!store.getSnapshot().sesion, status !== 401);
  }
  const { http, store } = setup(async () => { throw new Error('red'); });
  await assert.rejects(http('clientes'), { code: 'RED' }); assert(store.getSnapshot().sesion);
});
test('401 de login y contraseña actual incorrecta no cierran sesión', async () => {
  const { http, store } = setup(async () => response(401, { error: { code: 'CREDENCIALES_INVALIDAS' } }));
  await assert.rejects(http('auth/login', { publico: true }), { status: 401 });
  await assert.rejects(http('auth/password', { method: 'PATCH' }), { status: 401 });
  assert(store.getSnapshot().sesion);
});
test('logout limpia inmediatamente y distingue confirmación de fallo remoto', async () => {
  for (const status of [204, 401, 503]) {
    let resolver;
    const { auth, store } = setup(() => new Promise(r => { resolver = r; }));
    const salida = auth.logout();
    assert.equal(store.getSnapshot().sesion, null); assert(store.getSnapshot().saliendo);
    resolver(response(status)); await salida;
    assert.equal(store.getSnapshot().saliendo, false);
    assert.equal(store.getSnapshot().aviso.includes('No pudimos confirmar'), status === 503);
  }
  const { auth, store } = setup(async () => { throw new Error('offline'); });
  await auth.logout(); assert.equal(store.getSnapshot().sesion, null); assert(store.getSnapshot().aviso.includes('revocación remota'));
});
test('cambio de contraseña confirmado termina sesión y no envía confirmación', async () => {
  let body;
  const { auth, store } = setup(async (_url, options) => { body = JSON.parse(options.body); return response(204); });
  await auth.cambiarPassword('actual doce!', 'nueva con espacios');
  assert.deepEqual(body, { actual: 'actual doce!', nueva: 'nueva con espacios' });
  assert.equal(store.getSnapshot().sesion, null);
});
test('respuesta tardía exitosa y 401 no alteran una sesión nueva', async () => {
  for (const status of [200, 401]) {
    let resolver;
    const { http, store } = setup(() => new Promise(r => { resolver = r; }));
    const antigua = http('clientes');
    store.terminar(); store.iniciar(datos('sesion-nueva'));
    resolver(response(status, []));
    await assert.rejects(antigua, { code: 'SOLICITUD_DESCARTADA' });
    assert.equal(store.getSnapshot().sesion.token, 'sesion-nueva');
  }
});
test('logout pendiente tampoco sobrescribe aviso o sesión de nuevo login', async () => {
  let resolver;
  const { auth, store } = setup(() => new Promise(r => { resolver = r; }));
  const antigua = auth.logout(); store.iniciar(datos('nueva')); resolver(response(204)); await antigua;
  assert.equal(store.getSnapshot().sesion.token, 'nueva'); assert.equal(store.getSnapshot().aviso, '');
});
test('error.campos y Retry-After se conservan sin filtrar mensajes internos', async () => {
  const { http } = setup(async () => response(429, { error: { code: 'LIMITE_EXCEDIDO', message: 'traza privada', campos: ['email'] } }, { 'Retry-After': '5' }));
  await assert.rejects(http('auth/login', { publico: true }), error => {
    assert.deepEqual(error.campos, ['email']); assert.equal(error.retryAfter, '5');
    assert(!error.message.includes('traza')); assert(mensajeError(error).includes('5 segundos')); return true;
  });
});
test('matriz de roles y rol desconocido', () => {
  for (const rol of ROLES) {
    const p = permisosDe(rol); assert(p.comercial);
    assert.equal(p.administrar, rol === 'Administrador'); assert.equal(p.eliminar, rol !== 'Soporte');
  }
  assert.deepEqual(permisosDe('otro'), { comercial: false, administrar: false, eliminar: false });
});
test('contraseñas cuentan Unicode y espacios sin complejidad inventada', () => {
  assert(!passwordValida('a'.repeat(11))); assert(passwordValida('a'.repeat(12)));
  assert(passwordValida(' '.repeat(128))); assert(!passwordValida('a'.repeat(129)));
  assert(passwordValida('😀'.repeat(12)));
  assert.deepEqual(validarAcceso({ email: 'a@b.test', password: 'abcdefghijkl' }), {});
  assert.deepEqual(validarPassword({ actual: 'actual valida', nueva: 'nueva correcta', confirmacion: 'nueva correcta' }), {});
  assert(validarPassword({ actual: 'actual valida', nueva: 'nueva correcta', confirmacion: 'otra' }).confirmacion);
});
test('cuentas y PATCH excluyen correo, password y valores sin cambios', () => {
  const c = { ...usuario, nombre: 'Cuenta vieja' };
  assert.deepEqual(cambioCuenta(c, { ...c, email: 'otro@example.test', password: 'no enviar', nombre: ' Nueva ' }), { nombre: 'Nueva' });
  assert.deepEqual(cambioCuenta(c, c), {});
  assert(validarCuenta({ ...usuario, nombre: '123', password: 'abcdefghijkl' }).nombre);
  assert.deepEqual(validarCuenta({ ...usuario, password: 'abcdefghijkl' }), {});
});
test('validación comercial y mapeo de campos anidados/duplicado/último admin', () => {
  const c = { nombre: 'Cliente', ciudad: 'Jujuy', telefono: '+54 (388) 400-0000', email: 'c@example.test' };
  assert.deepEqual(validarCliente(c), {}); assert(!('password' in datosCliente(c)));
  assert(validarCliente({ ...c, ciudad: '123' }).ciudad);
  assert(validarCliente({ ...c, telefono: '123456' }).telefono);
  assert(validarCliente({ ...c, nombre: 'ñ'.repeat(101) }).nombre);
  assert.deepEqual(erroresDeApi(new ErrorApi('', { campos: ['phone', 'address.city', 'consulta'] }), { phone: 'telefono', 'address.city': 'ciudad' }),
    { telefono: 'Revisá este campo según las indicaciones.', ciudad: 'Revisá este campo según las indicaciones.' });
  assert(erroresDeApi(new ErrorApi('', { status: 409, code: 'EMAIL_DUPLICADO' }), { email: 'email' }).email);
  assert(erroresDeApi(new ErrorApi('', { status: 409, code: 'ULTIMO_ADMINISTRADOR' }), { rol: 'rol', activo: 'activo' }).activo);
});
test('historial: todos los tipos, ISO UTC, intervalos e IDs validados', () => {
  assert.equal(TIPOS_EVENTO.length, 8);
  for (const tipo of TIPOS_EVENTO) assert.deepEqual(prepararFiltros({ tipo, limit: '50' }).errores, {});
  const filtros = prepararFiltros({ limit: '1', desde: '2026-10-04T13:00:00-03:00', hasta: '2026-10-04T17:00:00Z', actorId: usuario.id });
  assert.equal(filtros.query.desde, '2026-10-04T16:00:00.000Z');
  assert.deepEqual(filtros.errores, {});
  assert(prepararFiltros({ limit: '50', desde: '2026-10-05T01:00', hasta: '2026-10-04T01:00' }).errores.desde);
  assert(prepararFiltros({ limit: '50', actorId: 'invalido' }).errores.actorId);
  for (const limit of ['0', '101', '2.5', '']) assert(prepararFiltros({ limit }).errores.limit);
  for (const limit of ['1', '100']) assert.deepEqual(prepararFiltros({ limit }).errores, {});
});
