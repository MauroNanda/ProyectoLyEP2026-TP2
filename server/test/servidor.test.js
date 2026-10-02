import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { crearApp, app } from '../app.js';
import { manejadorErrores } from '../middleware/errores.js';
import { manejadorRutaNoEncontrada } from '../middleware/no-encontrado.js';
import { crearRouterClientes, routerClientes } from '../routes/clientes.js';

const clienteMock = {
  id: '0123456789abcdef01234567',
  email: 'ana@example.com',
  phone: '3884000000',
  name: { firstname: 'Ana', lastname: '-' },
  address: { city: 'Jujuy' },
};

async function conServidor(aplicacion, callback) {
  const servidor = http.createServer(aplicacion);
  await new Promise((resolve) => servidor.listen(0, '127.0.0.1', resolve));
  const { port } = servidor.address();
  const urlBase = `http://127.0.0.1:${port}`;
  try {
    await callback(urlBase);
  } finally {
    await new Promise((resolve, reject) => servidor.close((err) => (err ? reject(err) : resolve())));
  }
}

test('exportaciones de módulos de servidor, router y middleware', () => {
  assert.equal(typeof crearApp, 'function');
  assert.equal(typeof app, 'function');
  assert.equal(typeof crearRouterClientes, 'function');
  assert.equal(typeof routerClientes, 'function');
  assert.equal(typeof manejadorErrores, 'function');
  assert.equal(typeof manejadorRutaNoEncontrada, 'function');
});

test('GET /api/clientes conecta con controlador y responde 200 con JSON', async () => {
  const controladores = {
    listarClientes: (req, res) => res.status(200).json([clienteMock]),
    obtenerClientePorId: (req, res) => res.status(200).json(clienteMock),
    crearCliente: (req, res) => res.status(201).json(clienteMock),
    eliminarCliente: (req, res) => res.status(204).end(),
  };

  const appTest = crearApp({ controladores });
  await conServidor(appTest, async (url) => {
    const respuesta = await fetch(`${url}/api/clientes`);
    assert.equal(respuesta.status, 200);
    assert.match(respuesta.headers.get('content-type'), /application\/json/);
    const datos = await respuesta.json();
    assert.deepEqual(datos, [clienteMock]);
  });
});

test('GET /api/clientes/:id entrega id y responde 200', async () => {
  let idRecibido;
  const controladores = {
    listarClientes: (req, res) => res.status(200).json([]),
    obtenerClientePorId: (req, res) => {
      idRecibido = req.params.id;
      return res.status(200).json(clienteMock);
    },
    crearCliente: (req, res) => res.status(201).json(clienteMock),
    eliminarCliente: (req, res) => res.status(204).end(),
  };

  const appTest = crearApp({ controladores });
  await conServidor(appTest, async (url) => {
    const respuesta = await fetch(`${url}/api/clientes/${clienteMock.id}`);
    assert.equal(respuesta.status, 200);
    assert.equal(idRecibido, clienteMock.id);
    const datos = await respuesta.json();
    assert.deepEqual(datos, clienteMock);
  });
});

test('POST /api/clientes procesa JSON recibido y responde 201', async () => {
  let cuerpoRecibido;
  const controladores = {
    listarClientes: (req, res) => res.status(200).json([]),
    obtenerClientePorId: (req, res) => res.status(200).json(clienteMock),
    crearCliente: (req, res) => {
      cuerpoRecibido = req.body;
      return res.status(201).json({ id: clienteMock.id, ...req.body });
    },
    eliminarCliente: (req, res) => res.status(204).end(),
  };

  const appTest = crearApp({ controladores });
  await conServidor(appTest, async (url) => {
    const respuesta = await fetch(`${url}/api/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ana@example.com' }),
    });
    assert.equal(respuesta.status, 201);
    assert.deepEqual(cuerpoRecibido, { email: 'ana@example.com' });
    const datos = await respuesta.json();
    assert.equal(datos.id, clienteMock.id);
    assert.equal(datos.email, 'ana@example.com');
  });
});

test('DELETE /api/clientes/:id responde 204 sin cuerpo', async () => {
  let idEliminado;
  const controladores = {
    listarClientes: (req, res) => res.status(200).json([]),
    obtenerClientePorId: (req, res) => res.status(200).json(clienteMock),
    crearCliente: (req, res) => res.status(201).json(clienteMock),
    eliminarCliente: (req, res) => {
      idEliminado = req.params.id;
      return res.status(204).end();
    },
  };

  const appTest = crearApp({ controladores });
  await conServidor(appTest, async (url) => {
    const respuesta = await fetch(`${url}/api/clientes/${clienteMock.id}`, {
      method: 'DELETE',
    });
    assert.equal(respuesta.status, 204);
    assert.equal(idEliminado, clienteMock.id);
    const texto = await respuesta.text();
    assert.equal(texto, '');
  });
});

test('CORS permite origen http://localhost:5173 y preflight OPTIONS', async () => {
  const appTest = crearApp({
    controladores: {
      listarClientes: (req, res) => res.status(200).json([]),
      obtenerClientePorId: (req, res) => res.status(200).json({}),
      crearCliente: (req, res) => res.status(201).json({}),
      eliminarCliente: (req, res) => res.status(204).end(),
    },
  });

  await conServidor(appTest, async (url) => {
    // Solicitud simple con Origin
    const resGet = await fetch(`${url}/api/clientes`, {
      headers: { Origin: 'http://localhost:5173' },
    });
    assert.equal(resGet.headers.get('access-control-allow-origin'), 'http://localhost:5173');

    // Solicitud preflight OPTIONS
    const resOptions = await fetch(`${url}/api/clientes`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    assert.equal(resOptions.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.match(resOptions.headers.get('access-control-allow-methods'), /POST/);
  });
});

test('solicitud con JSON malformado responde 400 con formato estándar', async () => {
  const appTest = crearApp();
  await conServidor(appTest, async (url) => {
    const respuesta = await fetch(`${url}/api/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"invalido": true, }', // JSON con coma sobrante
    });

    assert.equal(respuesta.status, 400);
    const datos = await respuesta.json();
    assert.deepEqual(datos, {
      error: {
        code: 'JSON_INVALIDO',
        message: 'El cuerpo de la solicitud contiene JSON malformado.',
      },
    });
  });
});

test('ruta inexistente responde 404 con formato estándar', async () => {
  const appTest = crearApp();
  await conServidor(appTest, async (url) => {
    const respuesta = await fetch(`${url}/api/no-existe`);
    assert.equal(respuesta.status, 404);
    const datos = await respuesta.json();
    assert.deepEqual(datos, {
      error: {
        code: 'RUTA_NO_ENCONTRADA',
        message: 'La ruta solicitada no existe.',
      },
    });
  });
});

test('middleware traduce ENTRADA_INVALIDA e ID_INVALIDO a 400 con su mensaje', async () => {
  const controladores = {
    listarClientes: (req, res, next) => {
      const err = new Error('El campo email es obligatorio.');
      err.code = 'ENTRADA_INVALIDA';
      return next(err);
    },
    obtenerClientePorId: (req, res, next) => {
      const err = new Error('Identificador no válido.');
      err.code = 'ID_INVALIDO';
      return next(err);
    },
    crearCliente: (req, res) => res.status(201).json({}),
    eliminarCliente: (req, res) => res.status(204).end(),
  };

  const appTest = crearApp({ controladores });
  await conServidor(appTest, async (url) => {
    const resEntrada = await fetch(`${url}/api/clientes`);
    assert.equal(resEntrada.status, 400);
    const errorEntrada = await resEntrada.json();
    assert.deepEqual(errorEntrada, {
      error: {
        code: 'ENTRADA_INVALIDA',
        message: 'El campo email es obligatorio.',
      },
    });

    const resId = await fetch(`${url}/api/clientes/123`);
    assert.equal(resId.status, 400);
    const errorId = await resId.json();
    assert.deepEqual(errorId, {
      error: {
        code: 'ID_INVALIDO',
        message: 'Identificador no válido.',
      },
    });
  });
});

test('middleware traduce CLIENTE_NO_ENCONTRADO a 404 con su mensaje', async () => {
  const controladores = {
    listarClientes: (req, res) => res.status(200).json([]),
    obtenerClientePorId: (req, res, next) => {
      const err = new Error('Cliente no encontrado.');
      err.code = 'CLIENTE_NO_ENCONTRADO';
      return next(err);
    },
    crearCliente: (req, res) => res.status(201).json({}),
    eliminarCliente: (req, res) => res.status(204).end(),
  };

  const appTest = crearApp({ controladores });
  await conServidor(appTest, async (url) => {
    const respuesta = await fetch(`${url}/api/clientes/0123456789abcdef01234567`);
    assert.equal(respuesta.status, 404);
    const datos = await respuesta.json();
    assert.deepEqual(datos, {
      error: {
        code: 'CLIENTE_NO_ENCONTRADO',
        message: 'Cliente no encontrado.',
      },
    });
  });
});

test('middleware traduce fallos inesperados o de persistencia a 500 seguro', async () => {
  const controladores = {
    listarClientes: (req, res, next) => {
      const err = new Error('Connection mongodb+srv://user:secret@cluster/ failed');
      err.code = 'CONEXION_FALLIDA';
      return next(err);
    },
    obtenerClientePorId: (req, res) => res.status(200).json({}),
    crearCliente: (req, res) => res.status(201).json({}),
    eliminarCliente: (req, res) => res.status(204).end(),
  };

  const appTest = crearApp({ controladores });
  await conServidor(appTest, async (url) => {
    const respuesta = await fetch(`${url}/api/clientes`);
    assert.equal(respuesta.status, 500);
    const datos = await respuesta.json();
    assert.deepEqual(datos, {
      error: {
        code: 'ERROR_INTERNO',
        message: 'Ocurrió un error interno en el servidor.',
      },
    });
    // No expone secret ni mongodb+srv
    const raw = JSON.stringify(datos);
    assert.equal(raw.includes('secret'), false);
    assert.equal(raw.includes('mongodb'), false);
  });
});

test('iniciarServidor aborta con código 1 sin abrir puerto si conectarBaseDeDatos falla', async () => {
  const { iniciarServidor } = await import('../index.js');
  let codigoSalida;
  const mensajesError = [];
  let listenLlamado = false;

  const mockApp = {
    listen: () => {
      listenLlamado = true;
    },
  };

  await iniciarServidor({
    aplicacion: mockApp,
    conectar: async () => {
      throw new Error('CONEXION_FALLIDA');
    },
    logger: {
      log: () => {},
      error: (...args) => mensajesError.push(args.join(' ')),
    },
    salir: (codigo) => {
      codigoSalida = codigo;
    },
  });

  assert.equal(codigoSalida, 1);
  assert.equal(listenLlamado, false);
  assert.equal(mensajesError.length > 0, true);
});

test('iniciarServidor conecta e inicia escucha si la conexión es exitosa', async () => {
  const { iniciarServidor } = await import('../index.js');
  let conectado = false;
  let serverCerrado = false;

  const mockApp = {
    listen: (puerto, callback) => {
      callback();
      return {
        on: () => {},
        close: (cb) => {
          serverCerrado = true;
          cb();
        },
      };
    },
  };

  const servidor = await iniciarServidor({
    aplicacion: mockApp,
    conectar: async () => {
      conectado = true;
    },
    cerrar: async () => {},
    logger: {
      log: () => {},
      error: () => {},
    },
    salir: () => {},
  });

  assert.equal(conectado, true);
  assert.equal(typeof servidor.close, 'function');
});

