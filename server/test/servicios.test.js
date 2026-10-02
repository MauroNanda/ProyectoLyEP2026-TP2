import test from 'node:test';
import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';
import { ErrorPersistencia } from '../config/database.js';
import { crearModeloCliente } from '../models/cliente.js';
import { crearServicioClientes } from '../services/clientes.js';
import { ErrorServicio, CODIGOS } from '../services/errores.js';

// Datos tal como los envía client/src/components/FormCliente.jsx.
const formulario = {
  email: 'ana@example.com', username: 'ana', password: '1234',
  name: { firstname: 'Ana', lastname: '-' }, address: { city: 'Jujuy' }, phone: '3884000000',
};
const idValido = () => new ObjectId().toHexString();

// Modelo controlado que registra llamadas; cada operación puede reemplazarse.
function modeloControlado(operaciones = {}) {
  const llamadas = [];
  const registrar = (nombre, resultado) => async (...args) => {
    llamadas.push({ nombre, args });
    return resultado(...args);
  };
  return {
    llamadas,
    listarClientes: registrar('listarClientes', operaciones.listarClientes ?? (() => [])),
    buscarClientePorId: registrar('buscarClientePorId', operaciones.buscarClientePorId ?? (() => null)),
    crearCliente: registrar('crearCliente', operaciones.crearCliente ?? ((datos) => ({ id: idValido(), ...datos }))),
    eliminarCliente: registrar('eliminarCliente', operaciones.eliminarCliente ?? (() => false)),
  };
}

// Modelo real de persistencia sobre una colección en memoria, sin Atlas.
function modeloRealControlado() {
  const registros = new Map();
  const coleccion = {
    find: () => ({ toArray: async () => [...registros.values()] }),
    findOne: async ({ _id }) => registros.get(_id.toHexString()) ?? null,
    insertOne: async (documento) => { registros.set(documento._id.toHexString(), documento); },
    deleteOne: async ({ _id }) => ({ deletedCount: registros.delete(_id.toHexString()) ? 1 : 0 }),
  };
  return { registros, modelo: crearModeloCliente(() => ({ collection: () => coleccion })) };
}

const fallos = () => [
  new ErrorPersistencia('ALMACENAMIENTO_FALLIDO', 'No se pudo completar la operación de clientes.'),
  new TypeError('fallo inesperado'),
];

test('errores de servicio se reconocen por código, clase y campos', () => {
  const error = new ErrorServicio(CODIGOS.ENTRADA_INVALIDA, 'Datos inválidos.', ['email']);
  assert.ok(error instanceof ErrorServicio && error instanceof Error);
  assert.equal(error.name, 'ErrorServicio');
  assert.equal(error.code, 'ENTRADA_INVALIDA');
  assert.deepEqual(error.campos, ['email']);
  assert.ok(!('campos' in new ErrorServicio(CODIGOS.ID_INVALIDO, 'Id inválido.')));
  assert.deepEqual(Object.values(CODIGOS), ['ENTRADA_INVALIDA', 'ID_INVALIDO', 'CLIENTE_NO_ENCONTRADO']);
  assert.ok(Object.isFrozen(CODIGOS));
});

test('listar devuelve el arreglo de persistencia, incluido vacío', async () => {
  const cliente = { id: idValido(), ...formulario };
  assert.deepEqual(await crearServicioClientes(modeloControlado({ listarClientes: () => [cliente] })).listarClientes(), [cliente]);
  assert.deepEqual(await crearServicioClientes(modeloControlado()).listarClientes(), []);
});

test('consultar devuelve el cliente existente', async () => {
  const id = idValido();
  const cliente = { id, ...formulario };
  const servicio = crearServicioClientes(modeloControlado({ buscarClientePorId: () => cliente }));
  assert.deepEqual(await servicio.obtenerClientePorId(id), cliente);
});

test('consultar o eliminar un id válido inexistente rechaza con CLIENTE_NO_ENCONTRADO', async () => {
  const servicio = crearServicioClientes(modeloControlado());
  await assert.rejects(servicio.obtenerClientePorId(idValido()), { name: 'ErrorServicio', code: 'CLIENTE_NO_ENCONTRADO' });
  await assert.rejects(servicio.eliminarCliente(idValido()), { name: 'ErrorServicio', code: 'CLIENTE_NO_ENCONTRADO' });
});

test('ids malformados rechazan con ID_INVALIDO sin invocar persistencia', async () => {
  const modelo = modeloControlado();
  const servicio = crearServicioClientes(modelo);
  for (const id of [undefined, null, 12, '', 'imposible', 'g'.repeat(24), 'a'.repeat(23), {}]) {
    await assert.rejects(servicio.obtenerClientePorId(id), { code: 'ID_INVALIDO' });
    await assert.rejects(servicio.eliminarCliente(id), { code: 'ID_INVALIDO' });
  }
  assert.equal(modelo.llamadas.length, 0);
});

test('eliminar un cliente existente finaliza sin resultado', async () => {
  const id = idValido();
  const modelo = modeloControlado({ eliminarCliente: () => true });
  assert.equal(await crearServicioClientes(modelo).eliminarCliente(id), undefined);
  assert.deepEqual(modelo.llamadas, [{ nombre: 'eliminarCliente', args: [id] }]);
});

test('crear con los datos del formulario actual produce un cliente compatible', async () => {
  const { modelo, registros } = modeloRealControlado();
  const creado = await crearServicioClientes(modelo).crearCliente(formulario);
  assert.match(creado.id, /^[a-f\d]{24}$/);
  assert.deepEqual(creado, {
    id: creado.id, email: 'ana@example.com', phone: '3884000000', username: 'ana',
    name: { firstname: 'Ana', lastname: '-' },
    address: { city: 'Jujuy', street: '', number: '', zipcode: '' },
  });
  assert.ok(!('password' in registros.get(creado.id)));
});

test('opcionales ausentes toman valores compatibles y el número se guarda como cadena', async () => {
  const { modelo } = modeloRealControlado();
  const servicio = crearServicioClientes(modelo);
  const minimo = { email: 'luis@example.com', phone: '1', name: { firstname: 'Luis' }, address: { city: 'Salta' } };
  const creado = await servicio.crearCliente(minimo);
  assert.equal(creado.username, '');
  assert.equal(creado.name.lastname, '-');
  assert.deepEqual(creado.address, { city: 'Salta', street: '', number: '', zipcode: '' });
  const conNumero = await servicio.crearCliente({ ...minimo, address: { city: 'Salta', number: 123 } });
  assert.equal(conNumero.address.number, '123');
});

test('crear elimina espacios sobrantes sin otras transformaciones del email', async () => {
  const modelo = modeloControlado();
  await crearServicioClientes(modelo).crearCliente({
    email: '  Ana.Perez@Example.com ', phone: ' 388 ', username: ' ana ',
    name: { firstname: ' Ana ', lastname: ' Pérez ' },
    address: { city: ' Jujuy ', street: ' Belgrano ', number: ' 12 ', zipcode: ' 4600 ' },
  });
  assert.deepEqual(modelo.llamadas[0].args[0], {
    email: 'Ana.Perez@Example.com', phone: '388', username: 'ana',
    name: { firstname: 'Ana', lastname: 'Pérez' },
    address: { city: 'Jujuy', street: 'Belgrano', number: '12', zipcode: '4600' },
  });
});

test('obligatorios ausentes o vacíos rechazan indicando todos los campos sin guardar', async () => {
  const modelo = modeloControlado();
  const servicio = crearServicioClientes(modelo);
  await assert.rejects(
    servicio.crearCliente({ email: '   ', phone: '', name: { firstname: ' ' }, address: {} }),
    (error) => {
      assert.ok(error instanceof ErrorServicio);
      assert.equal(error.code, 'ENTRADA_INVALIDA');
      assert.deepEqual(error.campos, ['email', 'phone', 'name.firstname', 'address.city']);
      return true;
    },
  );
  await assert.rejects(servicio.crearCliente({}), {
    code: 'ENTRADA_INVALIDA', campos: ['email', 'phone', 'name.firstname', 'address.city'],
  });
  assert.equal(modelo.llamadas.length, 0);
});

test('email con formato inválido rechaza indicando el campo email', async () => {
  const modelo = modeloControlado();
  const servicio = crearServicioClientes(modelo);
  for (const email of ['ana', 'ana@', 'ana@example', '@example.com', 'ana @example.com', 'ana@example.com extra']) {
    await assert.rejects(servicio.crearCliente({ ...formulario, email }), { code: 'ENTRADA_INVALIDA', campos: ['email'] });
  }
  assert.equal(modelo.llamadas.length, 0);
});

test('cuerpo que no es objeto rechaza con ENTRADA_INVALIDA', async () => {
  const modelo = modeloControlado();
  const servicio = crearServicioClientes(modelo);
  for (const cuerpo of [undefined, null, 'cliente', 5, true, [], [formulario]]) {
    await assert.rejects(servicio.crearCliente(cuerpo), { code: 'ENTRADA_INVALIDA', campos: ['cuerpo'] });
  }
  assert.equal(modelo.llamadas.length, 0);
});

test('opcionales o grupos con tipo incompatible rechazan indicando el campo', async () => {
  const modelo = modeloControlado();
  const servicio = crearServicioClientes(modelo);
  const casos = [
    [{ ...formulario, username: 5 }, ['username']],
    [{ ...formulario, name: { firstname: 'Ana', lastname: null } }, ['name.lastname']],
    [{ ...formulario, address: { city: 'Jujuy', street: [] } }, ['address.street']],
    [{ ...formulario, address: { city: 'Jujuy', zipcode: 4600 } }, ['address.zipcode']],
    [{ ...formulario, address: { city: 'Jujuy', number: {} } }, ['address.number']],
    [{ ...formulario, address: { city: 'Jujuy', number: Number.NaN } }, ['address.number']],
    [{ ...formulario, name: 'Ana' }, ['name']],
    [{ ...formulario, address: ['Jujuy'] }, ['address']],
  ];
  for (const [cuerpo, campos] of casos) {
    await assert.rejects(servicio.crearCliente(cuerpo), { code: 'ENTRADA_INVALIDA', campos });
  }
  assert.equal(modelo.llamadas.length, 0);
});

test('id, _id, password y campos ajenos se ignoran sin rechazar', async () => {
  const modelo = modeloControlado();
  const entrada = { ...formulario, id: 'impuesto', _id: idValido(), admin: true, name: { ...formulario.name, extra: 1 } };
  await crearServicioClientes(modelo).crearCliente(entrada);
  const enviado = modelo.llamadas[0].args[0];
  assert.deepEqual(Object.keys(enviado).sort(), ['address', 'email', 'name', 'phone', 'username']);
  assert.deepEqual(enviado.name, { firstname: 'Ana', lastname: '-' });
  assert.equal(entrada.id, 'impuesto', 'la entrada no se modifica');

  const real = modeloRealControlado();
  const creado = await crearServicioClientes(real.modelo).crearCliente(entrada);
  assert.notEqual(creado.id, 'impuesto');
  assert.notEqual(creado.id, entrada._id);
  assert.ok(!('password' in creado) && !('admin' in creado) && !('_id' in creado));
});

test('fallos de persistencia e inesperados se propagan sin convertirse en resultados', async () => {
  for (const fallo of fallos()) {
    const falla = () => { throw fallo; };
    const servicio = crearServicioClientes(modeloControlado({
      listarClientes: falla, buscarClientePorId: falla, crearCliente: falla, eliminarCliente: falla,
    }));
    for (const operacion of [
      () => servicio.listarClientes(),
      () => servicio.obtenerClientePorId(idValido()),
      () => servicio.crearCliente(formulario),
      () => servicio.eliminarCliente(idValido()),
    ]) {
      await assert.rejects(operacion(), (error) => {
        assert.equal(error, fallo, 'se propaga el mismo error');
        assert.ok(!(error instanceof ErrorServicio));
        return true;
      });
    }
  }
});
