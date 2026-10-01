import test from 'node:test';
import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';
import { crearConexion, ErrorPersistencia } from '../config/database.js';
import { crearModeloCliente, seleccionarDatosCliente, convertirCliente } from '../models/cliente.js';
import { cargarEjemplos, prepararEjemplos } from '../scripts/seed-clientes.js';

const datos = {
  email: 'ana@example.com', phone: '0000000000', username: 'ana',
  name: { firstname: 'Ana' }, address: { city: 'Jujuy' },
};
const configuracion = () => ({ MONGODB_URI: 'mongodb://ejemplo', MONGODB_DB_NAME: 'pruebas' });

test('configuración obligatoria y uso antes de apertura', async () => {
  const conexion = crearConexion({ entorno: () => ({}) });
  assert.throws(conexion.obtenerBaseDeDatos, { code: 'SIN_CONEXION' });
  await assert.rejects(conexion.conectarBaseDeDatos(), { code: 'CONFIGURACION_INVALIDA' });
  await conexion.cerrarBaseDeDatos();
});

test('apertura concurrente reutiliza cliente, cierre concurrente y reapertura', async () => {
  let creados = 0;
  let cerrados = 0;
  let pings = 0;
  const db = { command: async () => { pings++; } };
  const conexion = crearConexion({ entorno: configuracion, crearCliente: () => {
    creados++;
    return { connect: async () => {}, db: () => db, close: async () => { cerrados++; } };
  } });
  const resultados = await Promise.all(Array.from({ length: 5 }, () => conexion.conectarBaseDeDatos()));
  assert.ok(resultados.every((resultado) => resultado === db));
  assert.equal(creados, 1);
  assert.equal(pings, 1);
  await Promise.all([conexion.cerrarBaseDeDatos(), conexion.cerrarBaseDeDatos()]);
  assert.equal(cerrados, 1);
  assert.throws(conexion.obtenerBaseDeDatos, { code: 'SIN_CONEXION' });
  await conexion.cerrarBaseDeDatos();
  await conexion.conectarBaseDeDatos();
  assert.equal(creados, 2);
  await conexion.cerrarBaseDeDatos();
});

test('fallo de ping libera cliente, oculta secretos y permite reintento', async () => {
  let intentos = 0;
  let cierres = 0;
  const conexion = crearConexion({ entorno: configuracion, crearCliente: () => {
    const intento = ++intentos;
    return { connect: async () => {}, db: () => ({ command: async () => {
      if (intento === 1) throw new Error('password-secreto');
    } }), close: async () => { cierres++; } };
  } });
  await assert.rejects(conexion.conectarBaseDeDatos(), (error) => {
    assert.equal(error.code, 'CONEXION_FALLIDA');
    assert.ok(!error.stack.includes('password-secreto'));
    return true;
  });
  assert.equal(cierres, 1);
  assert.throws(conexion.obtenerBaseDeDatos, { code: 'SIN_CONEXION' });
  await conexion.conectarBaseDeDatos();
  await conexion.cerrarBaseDeDatos();
});

test('cierre durante apertura espera y libera el cliente', async () => {
  let liberar;
  const espera = new Promise((resolve) => { liberar = resolve; });
  let cierres = 0;
  const conexion = crearConexion({ entorno: configuracion, crearCliente: () => ({
    connect: () => espera, db: () => ({ command: async () => {} }), close: async () => { cierres++; },
  }) });
  const apertura = conexion.conectarBaseDeDatos();
  const cierre = conexion.cerrarBaseDeDatos();
  liberar();
  await Promise.all([apertura, cierre]);
  assert.equal(cierres, 1);
  assert.throws(conexion.obtenerBaseDeDatos, { code: 'SIN_CONEXION' });
});

test('modelo selecciona campos, defaults y dirección sin persistir credenciales', () => {
  const entrada = { ...datos, password: 'secreto', _id: 'impuesto', id: 'impuesto', admin: true };
  const documento = seleccionarDatosCliente(entrada);
  assert.equal(documento.name.lastname, '-');
  assert.deepEqual(documento.address, { city: 'Jujuy', street: '', number: '', zipcode: '' });
  assert.ok(!('password' in documento) && !('_id' in documento) && !('admin' in documento));
  const _id = new ObjectId();
  assert.deepEqual(convertirCliente({ _id, ...documento, password: 'secreto' }), { id: _id.toHexString(), ...documento });
  assert.equal(seleccionarDatosCliente({ ...datos, address: { city: 'Jujuy', number: 123 } }).address.number, '123');
});

test('modelo rechaza entradas malformadas', () => {
  for (const entrada of [null, [], {}, { ...datos, name: [] }, { ...datos, phone: 123 }, { ...datos, address: { city: 'Jujuy', number: {} } }]) {
    assert.throws(() => seleccionarDatosCliente(entrada), { code: 'ENTRADA_INVALIDA' });
  }
});

function coleccionControlada() {
  const registros = new Map();
  return {
    registros,
    find: () => ({ toArray: async () => [...registros.values()] }),
    findOne: async ({ _id }) => registros.get(_id.toHexString()) ?? null,
    insertOne: async (documento) => { registros.set(documento._id.toHexString(), documento); },
    deleteOne: async ({ _id }) => ({ deletedCount: registros.delete(_id.toHexString()) ? 1 : 0 }),
    updateOne: async ({ _id }, { $setOnInsert }) => {
      const clave = _id.toHexString();
      if (registros.has(clave)) return { upsertedCount: 0 };
      registros.set(clave, { _id, ...$setOnInsert });
      return { upsertedCount: 1 };
    },
  };
}

test('contrato de operaciones, ausencia y eliminación', async () => {
  const coleccion = coleccionControlada();
  const modelo = crearModeloCliente(() => ({ collection: () => coleccion }));
  assert.deepEqual(await modelo.listarClientes(), []);
  const creado = await modelo.crearCliente({ ...datos, id: 'impuesto', password: 'secreto' });
  assert.match(creado.id, /^[a-f\d]{24}$/);
  assert.ok(!('password' in coleccion.registros.get(creado.id)));
  assert.deepEqual(await modelo.buscarClientePorId(creado.id), creado);
  assert.deepEqual(await modelo.listarClientes(), [creado]);
  assert.equal(await modelo.eliminarCliente(creado.id), true);
  assert.equal(await modelo.buscarClientePorId(creado.id), null);
  assert.equal(await modelo.eliminarCliente(creado.id), false);
});

test('IDs inválidos se rechazan antes de consultar almacenamiento', async () => {
  const modelo = crearModeloCliente(() => { throw new Error('No debe acceder'); });
  for (const id of [null, 12, '', 'imposible', 'g'.repeat(24)]) {
    await assert.rejects(modelo.buscarClientePorId(id), { code: 'ID_INVALIDO' });
    await assert.rejects(modelo.eliminarCliente(id), { code: 'ID_INVALIDO' });
  }
});

test('fallos no se convierten en éxitos ni exponen mensajes internos', async () => {
  const modelo = crearModeloCliente(() => { throw new Error('mongodb://password-secreto'); });
  for (const operacion of [() => modelo.listarClientes(), () => modelo.buscarClientePorId(new ObjectId().toHexString()), () => modelo.crearCliente(datos), () => modelo.eliminarCliente(new ObjectId().toHexString())]) {
    await assert.rejects(operacion(), (error) => {
      assert.equal(error.code, 'ALMACENAMIENTO_FALLIDO');
      assert.ok(!error.stack.includes('password-secreto'));
      return true;
    });
  }
  const sinConexion = crearModeloCliente(() => { throw new ErrorPersistencia('SIN_CONEXION', 'Sin conexión.'); });
  await assert.rejects(sinConexion.listarClientes(), { code: 'SIN_CONEXION' });
});

test('carga repetida preserva ejemplos modificados y registros ajenos', async () => {
  const coleccion = coleccionControlada();
  const ejemplo = { _id: '65a000000000000000000001', ...datos };
  const ajeno = { _id: new ObjectId(), ...datos };
  await coleccion.insertOne(ajeno);
  assert.deepEqual(await cargarEjemplos(coleccion, [ejemplo]), { insertados: 1, existentes: 0 });
  coleccion.registros.get(ejemplo._id).name.firstname = 'Modificado';
  assert.deepEqual(await cargarEjemplos(coleccion, [ejemplo]), { insertados: 0, existentes: 1 });
  assert.equal(coleccion.registros.size, 2);
  assert.equal(coleccion.registros.get(ejemplo._id).name.firstname, 'Modificado');
  assert.ok(coleccion.registros.has(ajeno._id.toHexString()));
});

test('fixture inválido no produce escrituras parciales', async () => {
  const coleccion = coleccionControlada();
  const ejemplo = { _id: '65a000000000000000000001', ...datos };
  assert.throws(() => prepararEjemplos([ejemplo, ejemplo]), { code: 'FIXTURE_INVALIDO' });
  await assert.rejects(cargarEjemplos(coleccion, [ejemplo, { ...datos, _id: 'inválido' }]), { code: 'FIXTURE_INVALIDO' });
  assert.equal(coleccion.registros.size, 0);
});
