import { test as base, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { crearRepositorioSeguridad } from '../../server/models/seguridad.js';
import { crearServicioSeguridad } from '../../server/services/seguridad.js';
import { crearControladoresClientes } from '../../server/controllers/clientes.js';
import { crearServicioClientes } from '../../server/services/clientes.js';
import { crearApp } from '../../server/app.js';
const { MongoClient } = createRequire(new URL('../../server/package.json', import.meta.url))('mongodb');
const root = fileURLToPath(new URL('../../', import.meta.url));
export const test = base.extend({
  entorno: async ({ browserName }, ejecutar) => {
    expect(browserName).toBe('chromium');
    if (!process.env.MONGODB_URI) process.loadEnvFile(path.join(root, 'server/.env'));
    const prefijo = 'apacheta_frontend_e2e_' + randomUUID().replaceAll('-', '');
    const nombres = ['usuarios', 'sesiones', 'auditoria', 'control', 'clientes'].map(c => prefijo + '_' + c);
    const mongo = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    let db, servidor, vite;
    try {
      await mongo.connect(); db = mongo.db(process.env.MONGODB_DB_NAME);
      const repo = crearRepositorioSeguridad({ obtenerBase: () => ({ collection: clave => {
        const nombre = prefijo + '_' + clave;
        if (!nombres.includes(nombre)) throw new Error('Colección fuera del aislamiento.');
        return db.collection(nombre);
      } }), obtenerCliente: () => mongo });
      await repo.inicializar();
      const seguridad = crearServicioSeguridad({ repo });
      const password = 'Temporal E2E ' + randomUUID();
      const admin = await seguridad.bootstrap({ nombre: 'Admin E2E', email: 'admin@example.test', password });
      const ctx = await seguridad.autenticar((await seguridad.login({ email: admin.email, password }, 'fixture')).token);
      for (const rol of ['Gerencia', 'Soporte']) await seguridad.crearCuenta(ctx, { nombre: rol + ' E2E', email: rol.toLowerCase() + '@example.test', rol, password }, 'fixture');
      const app = crearApp({ seguridad, logger: {}, corsOrigin: 'http://127.0.0.1:5175', controladores: crearControladoresClientes(crearServicioClientes(repo.clientes)) });
      servidor = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
      const apiUrl = 'http://127.0.0.1:' + servidor.address().port;
      vite = spawn(process.execPath, [path.join(root, 'client/node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '5175', '--strictPort'], {
        cwd: path.join(root, 'client'), windowsHide: true, stdio: 'ignore',
        env: { ...process.env, VITE_API_URL: apiUrl + '/api/clientes', VITE_API_BASE_URL: apiUrl + '/api' },
      });
      await expect.poll(async () => {
        if (vite.exitCode !== null) throw new Error('Vite no pudo iniciar en el puerto 5175.');
        try { return (await fetch('http://127.0.0.1:5175')).ok; } catch { return false; }
      }).toBe(true);
      await ejecutar({ password, seguridad, ctx, apiUrl, url: 'http://127.0.0.1:5175' });
    } finally {
      if (vite && vite.exitCode === null) { vite.kill(); await once(vite, 'exit'); }
      if (servidor) await new Promise(resolve => servidor.close(resolve));
      try {
        if (db) for (const nombre of nombres) {
          await db.collection(nombre).drop().catch(e => { if (e.code !== 26) throw e; });
          expect(await db.listCollections({ name: nombre }).toArray()).toHaveLength(0);
        }
      } finally { await mongo.close(); }
    }
  },
});
export { expect };
export async function login(page, entorno, email = 'admin@example.test', password = entorno.password) {
  await page.goto(entorno.url + '/login');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Inicio', exact: true })).toBeVisible();
}
