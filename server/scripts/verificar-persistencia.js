import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { conectarBaseDeDatos, cerrarBaseDeDatos } from '../config/database.js';
import { crearCliente, buscarClientePorId, eliminarCliente } from '../models/cliente.js';

let id;
try {
  await conectarBaseDeDatos();
  const creado = await crearCliente({
    email: `prueba-${randomUUID()}@example.com`, phone: '0000000000',
    username: 'verificacion', name: { firstname: 'Prueba', lastname: 'Persistencia' },
    address: { city: 'Ciudad ficticia' },
  });
  id = creado.id;
  assert.deepEqual(await buscarClientePorId(id), creado);
  await cerrarBaseDeDatos();
  await conectarBaseDeDatos();
  assert.deepEqual(await buscarClientePorId(id), creado);
  assert.equal(await eliminarCliente(id), true);
  await cerrarBaseDeDatos();
  await conectarBaseDeDatos();
  assert.equal(await buscarClientePorId(id), null);
  console.log(JSON.stringify({ persistencia: 'correcta', alta: true, consulta: true, reapertura: true, baja: true, ausenciaPosterior: true }));
} catch {
  console.error('Verificación fallida. Revisar configuración, acceso a Atlas y operaciones de persistencia.');
  process.exitCode = 1;
} finally {
  if (id) {
    try { await conectarBaseDeDatos(); await eliminarCliente(id); }
    catch {
      console.error(`Limpieza pendiente: revisar únicamente el registro de prueba con id ${id}.`);
      process.exitCode = 1;
    }
  }
  await cerrarBaseDeDatos().catch(() => {
    console.error('No se pudo cerrar la conexión.');
    process.exitCode = 1;
  });
}
