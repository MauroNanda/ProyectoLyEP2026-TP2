import test from 'node:test';
import assert from 'node:assert/strict';
import * as controladores from '../controllers/clientes.js';
import { crearServicioClientes } from '../services/clientes.js';
import { ErrorServicio, CODIGOS } from '../services/errores.js';
import { ErrorPersistencia } from '../config/database.js';

const id = '0123456789abcdef01234567';
const datos = {
  email: 'ana@example.com', phone: '3884000000',
  name: { firstname: 'Ana', lastname: '-' }, address: { city: 'Jujuy' },
};
const cliente = { id, ...datos };
const operaciones = ['listarClientes', 'obtenerClientePorId', 'crearCliente', 'eliminarCliente'];

// Dobles del borde HTTP: registran estado, JSON, finalización y derivación.
function intercambio() {
  const respuestas = [];
  const errores = [];
  const res = {
    status(codigo) { respuestas.push({ metodo: 'status', valor: codigo }); return this; },
    json(cuerpo) { respuestas.push({ metodo: 'json', valor: cuerpo }); return this; },
    end(...args) { respuestas.push({ metodo: 'end', args }); return this; },
  };
  return { res, respuestas, errores, next: (error) => errores.push(error) };
}

function servicioControlado(operacion, funcion) {
  const servicio = Object.fromEntries(operaciones.map((nombre) => [nombre, () => {
    assert.fail(`No se esperaba invocar ${nombre}.`);
  }]));
  servicio[operacion] = funcion;
  return servicio;
}

function solicitud() {
  return { params: { id }, body: datos };
}

test('exporta la fábrica y los cuatro controladores listos para las rutas', () => {
  assert.equal(typeof controladores.crearControladoresClientes, 'function');
  for (const operacion of operaciones) assert.equal(typeof controladores[operacion], 'function');
});

test('listado responde 200 con el arreglo del servicio, sin argumentos ni envoltorio', async () => {
  const lista = [cliente];
  const servicio = servicioControlado('listarClientes', async (...args) => {
    assert.deepEqual(args, []);
    return lista;
  });
  const { res, respuestas, errores, next } = intercambio();
  await controladores.crearControladoresClientes(servicio).listarClientes({}, res, next);
  assert.deepEqual(respuestas, [{ metodo: 'status', valor: 200 }, { metodo: 'json', valor: lista }]);
  assert.strictEqual(respuestas[1].valor, lista);
  assert.deepEqual(errores, []);
});

test('listado vacío responde 200 con [], no 404', async () => {
  const servicio = servicioControlado('listarClientes', async () => []);
  const { res, respuestas, errores, next } = intercambio();
  await controladores.crearControladoresClientes(servicio).listarClientes({}, res, next);
  assert.deepEqual(respuestas, [{ metodo: 'status', valor: 200 }, { metodo: 'json', valor: [] }]);
  assert.deepEqual(errores, []);
});

test('consulta entrega params.id sin convertirlo y responde 200 con el cliente', async () => {
  const servicio = servicioControlado('obtenerClientePorId', async (...args) => {
    assert.deepEqual(args, [id]);
    return cliente;
  });
  const { res, respuestas, errores, next } = intercambio();
  await controladores.crearControladoresClientes(servicio).obtenerClientePorId(solicitud(), res, next);
  assert.deepEqual(respuestas, [{ metodo: 'status', valor: 200 }, { metodo: 'json', valor: cliente }]);
  assert.deepEqual(errores, []);
});

test('creación entrega req.body al servicio y responde 201 con el resultado persistido', async () => {
  const servicio = servicioControlado('crearCliente', async (...args) => {
    assert.equal(args.length, 1);
    assert.strictEqual(args[0], datos);
    return cliente;
  });
  const { res, respuestas, errores, next } = intercambio();
  await controladores.crearControladoresClientes(servicio).crearCliente(solicitud(), res, next);
  assert.deepEqual(respuestas, [{ metodo: 'status', valor: 201 }, { metodo: 'json', valor: cliente }]);
  assert.strictEqual(respuestas[1].valor, cliente);
  assert.deepEqual(errores, []);
});

test('eliminación espera el servicio y responde 204 sin cuerpo aunque este retorne undefined', async () => {
  const servicio = servicioControlado('eliminarCliente', async (...args) => {
    assert.deepEqual(args, [id]);
  });
  const { res, respuestas, errores, next } = intercambio();
  await controladores.crearControladoresClientes(servicio).eliminarCliente(solicitud(), res, next);
  assert.deepEqual(respuestas, [{ metodo: 'status', valor: 204 }, { metodo: 'end', args: [] }]);
  assert.deepEqual(errores, []);
});

for (const operacion of operaciones) {
  test(`${operacion}: no responde antes de que el servicio termine`, async () => {
    const { promise, resolve } = Promise.withResolvers();
    const servicio = servicioControlado(operacion, () => promise);
    const { res, respuestas, errores, next } = intercambio();
    const pendiente = controladores.crearControladoresClientes(servicio)[operacion](solicitud(), res, next);
    assert.deepEqual(respuestas, []);
    assert.deepEqual(errores, []);
    resolve(operacion === 'listarClientes' ? [cliente] : cliente);
    await pendiente;
    assert.equal(respuestas.length, 2);
    assert.deepEqual(errores, []);
  });

  test(`${operacion}: deriva cada rechazo una sola vez, sin respuesta ni exposición de detalles`, async () => {
    const fallos = [
      new ErrorServicio(CODIGOS.ENTRADA_INVALIDA, 'Datos inválidos.', ['email']),
      new ErrorServicio(CODIGOS.ID_INVALIDO, 'Id inválido.'),
      new ErrorServicio(CODIGOS.CLIENTE_NO_ENCONTRADO, 'Cliente inexistente.'),
      new ErrorPersistencia('ALMACENAMIENTO_FALLIDO', 'No se pudo guardar.'),
      new Error('Detalle interno que no debe aparecer en una respuesta HTTP.'),
    ];
    for (const error of fallos) {
      const servicio = servicioControlado(operacion, async () => { throw error; });
      const { res, respuestas, errores, next } = intercambio();
      await controladores.crearControladoresClientes(servicio)[operacion](solicitud(), res, next);
      assert.deepEqual(respuestas, []);
      assert.equal(errores.length, 1);
      assert.strictEqual(errores[0], error);
    }
  });

  test(`${operacion}: captura un fallo síncrono y lo entrega intacto a next`, async () => {
    const error = new TypeError('Fallo síncrono del servicio.');
    const servicio = servicioControlado(operacion, () => { throw error; });
    const { res, respuestas, errores, next } = intercambio();
    await controladores.crearControladoresClientes(servicio)[operacion](solicitud(), res, next);
    assert.deepEqual(respuestas, []);
    assert.equal(errores.length, 1);
    assert.strictEqual(errores[0], error);
  });
}

test('con servicio real, el alta devuelve datos comerciales normalizados e id generado', async () => {
  let recibido;
  const modelo = {
    crearCliente: async (comerciales) => {
      recibido = comerciales;
      return { id, ...comerciales };
    },
  };
  const cuerpo = { ...datos, email: ' ana@example.com ', id: 'impuesto', _id: 'impuesto', password: 'ficticia' };
  const { res, respuestas, errores, next } = intercambio();
  const controlador = controladores.crearControladoresClientes(crearServicioClientes(modelo));
  await controlador.crearCliente({ body: cuerpo }, res, next);
  assert.equal(respuestas[0].valor, 201);
  assert.equal(respuestas[1].valor.id, id);
  assert.equal(respuestas[1].valor.email, 'ana@example.com');
  for (const campo of ['id', '_id', 'password']) assert.ok(!(campo in recibido));
  assert.ok(!('_id' in respuestas[1].valor));
  assert.ok(!('password' in respuestas[1].valor));
  assert.deepEqual(errores, []);
  assert.equal(cuerpo.email, ' ana@example.com ');
});

test('con servicio real, el cuerpo inválido se deriva con ENTRADA_INVALIDA y campos intactos', async () => {
  const servicio = crearServicioClientes({ crearCliente: () => assert.fail('No debe guardar datos inválidos.') });
  const controlador = controladores.crearControladoresClientes(servicio);
  for (const cuerpo of [undefined, null, [], {}]) {
    const { res, respuestas, errores, next } = intercambio();
    await controlador.crearCliente({ body: cuerpo }, res, next);
    assert.deepEqual(respuestas, []);
    assert.equal(errores.length, 1);
    assert.equal(errores[0].code, 'ENTRADA_INVALIDA');
    assert.deepEqual(errores[0].campos, cuerpo && !Array.isArray(cuerpo)
      ? ['email', 'phone', 'name.firstname', 'address.city'] : ['cuerpo']);
  }
});

for (const operacion of ['obtenerClientePorId', 'eliminarCliente']) {
  test(`con servicio real, ${operacion} deriva ID_INVALIDO sin llegar al modelo`, async () => {
    const modelo = {
      buscarClientePorId: () => assert.fail('No debe buscar con id inválido.'),
      eliminarCliente: () => assert.fail('No debe eliminar con id inválido.'),
    };
    const { res, respuestas, errores, next } = intercambio();
    const controlador = controladores.crearControladoresClientes(crearServicioClientes(modelo));
    await controlador[operacion]({ params: { id: 'invalido' } }, res, next);
    assert.deepEqual(respuestas, []);
    assert.equal(errores.length, 1);
    assert.equal(errores[0].code, 'ID_INVALIDO');
  });

  test(`con servicio real, ${operacion} deriva CLIENTE_NO_ENCONTRADO`, async () => {
    const modelo = { buscarClientePorId: async () => null, eliminarCliente: async () => false };
    const { res, respuestas, errores, next } = intercambio();
    const controlador = controladores.crearControladoresClientes(crearServicioClientes(modelo));
    await controlador[operacion](solicitud(), res, next);
    assert.deepEqual(respuestas, []);
    assert.equal(errores.length, 1);
    assert.equal(errores[0].code, 'CLIENTE_NO_ENCONTRADO');
  });
}
