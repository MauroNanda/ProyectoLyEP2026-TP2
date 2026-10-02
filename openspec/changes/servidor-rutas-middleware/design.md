# Design

## Context

Ver `proposal.md` para la motivación y `specs/servidor-rutas-middleware/spec.md` para los requisitos normativos del sistema.
Base del proyecto: `main` en commit `93a7c4a`, que integra:
- Conexión a MongoDB Atlas y persistencia de clientes (#3).
- Casos de uso, validaciones y reglas de negocio (#4).
- Controladores HTTP `(req, res, next)` para las cuatro operaciones (#5).

Actualmente `server/` dispone de la configuración de base de datos (`config/database.js`), modelos (`models/cliente.js`), servicios (`services/clientes.js`, `services/errores.js`) y controladores (`controllers/clientes.js`). Falta la capa del servidor HTTP Express que ensamble estas partes, gestione CORS y JSON, aplique el middleware común de errores y rutas inexistentes, y coordine el ciclo de vida del proceso con MongoDB Atlas.

## Goals / Non-Goals

**Goals:**
- Configurar dependencias de producción (`express`, `cors`) en `server/package.json` y lockfile.
- Implementar la aplicación Express desacoplada (`server/app.js` mediante fábrica `crearApp` y exportación lista para uso), facilitando pruebas HTTP sin levantar Atlas.
- Configurar CORS admitiendo solicitudes y preflights desde `http://localhost:5173` (o `CORS_ORIGIN`).
- Procesar cuerpos JSON (`express.json()`) interceptando JSON malformado con estado 400 y código `JSON_INVALIDO`.
- Conectar las 4 operaciones de `/api/clientes` a los controladores existentes en `controllers/clientes.js`.
- Middleware 404 para endpoints o métodos no registrados con código `RUTA_NO_ENCONTRADA`.
- Middleware global de errores que traduzca `ENTRADA_INVALIDA` e `ID_INVALIDO` a 400, `CLIENTE_NO_ENCONTRADO` a 404, y fallos de persistencia o no controlados a 500 (`ERROR_INTERNO`), sin exponer credenciales ni detalles de Atlas.
- Coordinar arranque y parada en `server/index.js`: conectar Atlas antes de aceptar tráfico, abortar si falla sin declarar disponibilidad falsa, y cerrar ordenadamente ante `SIGINT` o `SIGTERM`.
- Pruebas automatizadas en `server/test/servidor.test.js` con el runner nativo `node:test`.
- Documentar contratos y comandos en `server/documents/servidor.md` y actualizar `server/README.md` y `server/.env.example`.

**Non-Goals:**
- No modificar el frontend (`client/`), servicios ni modelos existentes.
- No modificar la lógica interna de los controladores de clientes.
- No implementar autenticación real, roles ni despliegue en la nube.
- No crear conexiones paralelas a la base de datos ni sustituir Atlas por arreglos en memoria en producción.

## Decisions

### 1. Estructura modular de la aplicación Express
Se separará la definición de la aplicación Express (`server/app.js`), el enrutamiento (`server/routes/clientes.js`), los middlewares (`server/middleware/`) y el punto de entrada de ejecución (`server/index.js`).

`server/app.js` expondrá una fábrica `crearApp({ controladores, config })` y una instancia por defecto configurada con los controladores reales de `controllers/clientes.js`.
*Razón:* Permite testear todas las rutas, middlewares, CORS, JSON inválido y respuestas de error en puertos efímeros de prueba de forma determinista y sin requerir una conexión activa a Atlas durante la suite de pruebas. El módulo `index.js` consume la aplicación y coordina la conexión real a Atlas antes de invocar `listen`.
*Alternativa considerada:* Inicializar Express y llamar a `listen()` en un único archivo. Descartada porque acopla la apertura de sockets y conexión de red con la definición de rutas, dificultando las pruebas automatizadas.

### 2. Tratamiento unificado de errores y códigos de respuesta
El middleware de error común `manejadorErrores` en `server/middleware/errores.js` recibirá los errores derivados por `next(err)`:
- Si el error es un `SyntaxError` de parseo JSON (`err.status === 400 && 'body' in err`), responderá HTTP 400 con `{ "error": { "code": "JSON_INVALIDO", "message": "El cuerpo de la solicitud contiene JSON malformado." } }`.
- Si `err.code === 'ENTRADA_INVALIDA'` o `err.code === 'ID_INVALIDO'`, responderá HTTP 400 con `{ "error": { "code": err.code, "message": err.message } }`.
- Si `err.code === 'CLIENTE_NO_ENCONTRADO'`, responderá HTTP 404 con `{ "error": { "code": err.code, "message": err.message } }`.
- En cualquier otro caso (errores de persistencia, fallos de red o imprevistos), responderá HTTP 500 con `{ "error": { "code": "ERROR_INTERNO", "message": "Ocurrió un error interno en el servidor." } }`.
*Razón:* Se cumple estrictamente el contrato acordado en los issues previos: `{ "error": { "code": "...", "message": "..." } }`, protegiendo secretos y credenciales de la base de datos ante errores no controlados.

### 3. Middleware de ruta inexistente (404)
Cualquier solicitud a una ruta no atendida por el router caerá en `server/middleware/no-encontrado.js`, el cual responderá HTTP 404 con:
`{ "error": { "code": "RUTA_NO_ENCONTRADA", "message": "La ruta solicitada no existe." } }`.

### 4. Configuración de CORS y JSON
Se integrarán `cors` y `express.json()` en el inicio del pipeline de middleware:
- `cors` se configurará con `origin: process.env.CORS_ORIGIN || 'http://localhost:5173'` y credenciales habilitadas si corresponde, aceptando los métodos `GET,POST,DELETE,OPTIONS` y cabeceras estándar.
- `express.json()` analizará cargas útiles `application/json`.

### 5. Arranque y cierre coordinados con MongoDB Atlas
`server/index.js` coordinará:
1. Carga de variables de entorno (`PORT` por defecto 3001).
2. Apertura de base de datos con `await conectarBaseDeDatos()`. Si lanza una excepción (por ejemplo `CONEXION_FALLIDA` o `CONFIGURACION_INVALIDA`), se imprimirá un mensaje limpio en `console.error` (sin imprimir la URI con contraseñas) y se finalizará con `process.exit(1)` para no declarar disponibilidad cuando el servicio no puede operar.
3. Inicio del servidor HTTP con `app.listen(PORT, ...)`.
4. Captura de señales `SIGINT` y `SIGTERM` para ejecutar un cierre ordenado (detener el servidor HTTP y esperar `cerrarBaseDeDatos()`).

### 6. Estrategia de pruebas automatizadas
Se utilizará el test runner nativo de Node.js (`node:test` y `node:assert/strict`) con `fetch` nativo sobre servidores HTTP escuchando en `localhost:0` (puerto efímero del sistema operativo).
*Razón:* No requiere añadir dependencias extras de testing como `supertest`, manteniendo dependencias mínimas y compatibilidad con el entorno Node.js >=24 del proyecto.

## Risks / Trade-offs

- [Fallo de conexión a Atlas en entornos sin credenciales] → La fábrica `crearApp` permite probar el 100% de la funcionalidad HTTP y middleware con controladores reales o dobles controlados sin necesidad de Atlas. En `index.js`, el proceso finaliza explícitamente con código 1 si no hay conexión válida, evitando falsos positivos de salud.
- [Fuga de credenciales en mensajes de error 500 o logs] → El middleware de errores jamás reenvía `err.message` o el objeto de error hacia el cliente si se trata de un error 500; responde un mensaje genérico seguro y auditable.
- [Conflicto de versiones al editar package.json] → Se agregan únicamente `express` y `cors` con versiones estables compatibles con Node.js >=24 y ESM, regenerando el lockfile con `npm install`.
