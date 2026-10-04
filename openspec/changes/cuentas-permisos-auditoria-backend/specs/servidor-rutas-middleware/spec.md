## MODIFIED Requirements

### Requirement: Enrutamiento de operaciones de clientes
El enrutador del servidor SHALL registrar las cuatro operaciones del recurso `/api/clientes` y conectarlas directamente a los controladores de clientes reales (`listarClientes`, `obtenerClientePorId`, `crearCliente`, `eliminarCliente`).

Las cuatro rutas SHALL exigir sesión vigente y el rol autorizado según cuentas-equipo; las respuestas de éxito y el id público se conservan. Preflight OPTIONS SHALL permanecer público.

#### Scenario: Consulta de listado en GET /api/clientes
- **WHEN** con una sesión vigente autorizada se realiza una solicitud `GET /api/clientes`
- **THEN** la solicitud es atendida por `listarClientes` y devuelve estado 200 con el arreglo JSON de clientes

#### Scenario: Consulta individual en GET /api/clientes/:id
- **WHEN** con una sesión vigente autorizada se realiza una solicitud `GET /api/clientes/:id` con un identificador
- **THEN** la solicitud es atendida por `obtenerClientePorId` entregando el parámetro `id` correspondiente

#### Scenario: Creación en POST /api/clientes
- **WHEN** con una sesión vigente autorizada se realiza una solicitud `POST /api/clientes` con el cuerpo del cliente
- **THEN** la solicitud es atendida por `crearCliente` entregando `req.body` y respondiendo 201 en caso de éxito

#### Scenario: Eliminación en DELETE /api/clientes/:id
- **WHEN** con una sesión vigente autorizada se realiza una solicitud `DELETE /api/clientes/:id`
- **THEN** la solicitud es atendida por `eliminarCliente` respondiendo 204 sin cuerpo en caso de éxito

#### Scenario: Operación sin autorización
- **WHEN** falta sesión válida o el rol no permite la operación
- **THEN** responde 401 o 403 respectivamente sin invocar el caso de uso.


### Requirement: Middleware común de errores
La aplicación SHALL disponer de un middleware de manejo de errores con firma `(err, req, res, next)` que capture las excepciones derivadas por controladores y otros middlewares, traduciendo los códigos conocidos a estados HTTP y construyendo la respuesta bajo el esquema `{ "error": { "code": "...", "message": "..." } }`. Ante errores no controlados o de almacenamiento, MUST responder con estado 500 y código seguro, sin revelar credenciales, cadenas de conexión ni trazas de error.

El middleware SHALL publicar campos opcional para validación, y reconocer errores controlados 401, 403, 409, 413, 429 y 503 conforme a design.md, sin reenviar detalles del driver.

#### Scenario: Error por entrada inválida o identificador inválido
- **WHEN** un controlador deriva un error con código `ENTRADA_INVALIDA` o `ID_INVALIDO`
- **THEN** el middleware responde con estado 400 y el cuerpo `{ "error": { "code": "<CODIGO>", "message": "<mensaje del error>" } }`

#### Scenario: Error por cliente no encontrado
- **WHEN** un controlador deriva un error con código `CLIENTE_NO_ENCONTRADO`
- **THEN** el middleware responde con estado 404 y el cuerpo `{ "error": { "code": "CLIENTE_NO_ENCONTRADO", "message": "<mensaje del error>" } }`

#### Scenario: Error inesperado o de base de datos
- **WHEN** se deriva un error no categorizado, un fallo de conexión o un error de almacenamiento
- **THEN** el middleware responde con estado 500 y `{ "error": { "code": "ERROR_INTERNO", "message": "Ocurrió un error interno en el servidor." } }`, sin imprimir credenciales ni filtrar detalles sensibles

#### Scenario: Cuerpo JSON excesivo
- **WHEN** el cuerpo supera el límite explícito de 100kb
- **THEN** responde 413 con error seguro, no 500.

#### Scenario: Campos rechazados
- **WHEN** el servicio informa campos de entrada inválidos
- **THEN** devuelve 400 y los nombres públicos en error.campos sin revelar datos internos.


### Requirement: Coordinación del ciclo de vida con MongoDB Atlas
El módulo de arranque del servidor SHALL coordinar la inicialización y el apagado con las funciones compartidas de persistencia (`conectarBaseDeDatos` y `cerrarBaseDeDatos`). Si la conexión a la base de datos falla al iniciar, el servidor MUST NOT declarar disponibilidad normal y MUST abortar el arranque informando el error de forma segura sin exhibir credenciales. Ante señales de terminación (`SIGINT`, `SIGTERM`), el servidor SHALL detener la recepción de nuevas conexiones HTTP y cerrar la conexión a la base de datos.

El servidor SHALL validar entorno antes de conectar, manejar errores al escuchar cerrando MongoDB y limitar el cierre a 10 segundos; fallos de arranque o cierre SHALL finalizar con código no cero.

#### Scenario: Arranque coordinado exitoso
- **WHEN** se ejecuta el arranque del servidor y la base de datos responde exitosamente al comando ping
- **THEN** el servidor Express inicia la escucha de conexiones y notifica disponibilidad

#### Scenario: Fallo de conexión durante el arranque
- **WHEN** la conexión a la base de datos es rechazada o falla la configuración
- **THEN** el proceso registra el fallo sin imprimir la URI con credenciales y finaliza con código de error sin dejar el servidor disponible falsamente

#### Scenario: Apagado ordenado ante señal de terminación
- **WHEN** el proceso recibe una señal `SIGINT` o `SIGTERM`
- **THEN** el servidor detiene la escucha HTTP y ejecuta `cerrarBaseDeDatos()` para liberar recursos limpiamente

#### Scenario: Falla de escucha tras conectar
- **WHEN** no puede abrir el puerto HTTP después de conectar a MongoDB
- **THEN** libera la conexión y finaliza con código no cero sin declarar disponible el servidor.

#### Scenario: Configuración inválida
- **WHEN** PORT, HOST o CORS_ORIGIN incumplen el contrato de configuración
- **THEN** rechaza el arranque con mensaje seguro antes de conectar o abrir puerto.
