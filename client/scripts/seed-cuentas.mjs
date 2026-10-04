// Datos de demostración solicitados por el usuario; nunca autentican sin backend.
import { fileURLToPath } from 'node:url';
import { crearApiClient } from '../src/services/apiClient.js';
import { crearSesionStore } from '../src/services/sesionStore.js';
import { crearAutorizacionesService } from '../src/services/autorizacionesServices.js';
import { crearCuentasService } from '../src/services/cuentasService.js';
if (!process.env.SEED_ADMIN_PASSWORD) process.loadEnvFile(fileURLToPath(new URL('../../server/.env', import.meta.url)));
const base = process.env.SEED_API_BASE_URL || 'http://localhost:3001/api';
const store = crearSesionStore();
const api = crearApiClient({ store, env: { VITE_API_BASE_URL: base, VITE_API_URL: base + '/clientes' } });
const auth = crearAutorizacionesService(api, store), cuentas = crearCuentasService(api);
try {
  if (!process.env.SEED_ADMIN_EMAIL || !process.env.SEED_ADMIN_PASSWORD) throw new Error('CONFIGURACION');
  await auth.login(process.env.SEED_ADMIN_EMAIL, process.env.SEED_ADMIN_PASSWORD);
  if (store.getSnapshot().sesion.usuario.rol !== 'Administrador') throw new Error('SIN_PERMISO');
  const existentes = await cuentas.listar();
  for (const [rol, email] of [['Administrador', 'administrador@example.test'], ['Gerencia', 'gerencia@example.test'], ['Soporte', 'soporte@example.test']]) {
    const existente = existentes.find(c => c.email === email);
    if (existente) { console.log(JSON.stringify({ email, resultado: 'existente; sin cambios', rol: existente.rol, activo: existente.activo })); continue; }
    const cuenta = await cuentas.crear({ nombre: rol + ' de demostración', email, rol, password: email });
    console.log(JSON.stringify({ email: cuenta.email, rol: cuenta.rol, activo: cuenta.activo, resultado: 'creada' }));
  }
} catch (error) {
  console.error('Siembra incompleta: ' + (error.code || 'CONFIGURACION') + '. No se imprimen credenciales.'); process.exitCode = 1;
} finally {
  if (store.getSnapshot().sesion) {
    await auth.logout();
    if (store.getSnapshot().aviso.includes('No pudimos confirmar')) { console.error('No se confirmó la revocación de la sesión de siembra.'); process.exitCode = 1; }
  }
}
