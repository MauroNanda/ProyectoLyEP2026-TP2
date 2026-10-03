# servidor-rutas-middleware Specification

## Purpose
Proveer la aplicación y servidor Express en el puerto configurado (3001 por defecto), habilitar CORS para el frontend, registrar las cuatro rutas de `/api/clientes` conectadas a los controladores, estandarizar las respuestas de error y rutas inexistentes bajo el formato común acordado, y coordinar el ciclo de vida con MongoDB Atlas.

## Requirements

### Requirement: Exposición del servidor HTTP y configuración por entorno
El servidor SHALL exponer la API HTTP en el puerto configurado por entorno o en el puerto 3001 por defecto, y habilitar CORS para el origen del frontend (`http://localhost:5173` o el origen configurado), permitiendo métodos estándar y cabeceras necesarias, incluidas las solicitudes preflight `OPTIONS`.

#### Scenario: Inicio en puerto por defecto
- **WHEN** se inicia el servidor sin variable `PORT` definida
- **THEN** la aplicación escucha solicitudes en el puerto 3001

#### Scenario: Inicio en puerto configurado
- **WHEN** se inicia el servidor con la variable de entorno `PORT`
- **THEN** la aplicación escucha en el puerto indicado por dicha variable

#### Scenario: Solicitud desde el frontend con CORS
- **WHEN** un cliente HTTP envía una solicitud con cabecera `Origin: http://localhost:5173`
- **THEN** el servidor responde con las cabeceras `Access-Control-Allow-Origin` correspondientes permitiendo el acceso

#### Scenario: Solicitud preflight OPTIONS
- **WHEN** un cliente HTTP envía una solicitud `OPTIONS` a `/api/clientes` con cabeceras de preflight
- **THEN** el servidor responde exitosamente indicando los métodos permitidos (`GET`, `POST`, `DELETE`, etc.)

### Requirement: Procesamiento de solicitudes JSON y manejo de sintaxis inválida
La aplicación SHALL procesar cuerpos de solicitud con formato JSON (`application/json`) y SHALL capturar errores de sintaxis en cuerpos malformados, respondiendo con estado 400 y formato de error estándar, sin abortar el proceso ni exponer trazas internas.

#### Scenario: Solicitud con cuerpo JSON válido
- **WHEN** se envía una solicitud `POST` con cabecera `Content-Type: application/json` y un JSON sintácticamente correcto
- **THEN** el middleware parsea el cuerpo y lo pone a disposición en `req.body`

#### Scenario: Solicitud con cuerpo JSON malformado
- **WHEN** se envía una solicitud con cabecera `Content-Type: application/json` y contenido JSON sintácticamente inválido
- **THEN** el middleware de error responde con estado 400 y el objeto `{ "error": { "code": "JSON_INVALIDO", "message": "El cuerpo de la solicitud contiene JSON malformado." } }`

### Requirement: Enrutamiento de operaciones de clientes
El enrutador del servidor SHALL registrar las cuatro operaciones del recurso `/api/clientes` y conectarlas directamente a los controladores de clientes reales (`listarClientes`, `obtenerClientePorId`, `crearCliente`, `eliminarCliente`).

#### Scenario: Consulta de listado en GET /api/clientes
- **WHEN** se realiza una solicitud `GET /api/clientes`
- **THEN** la solicitud es atendida por `listarClientes` y devuelve estado 200 con el arreglo JSON de clientes

#### Scenario: Consulta individual en GET /api/clientes/:id
- **WHEN** se realiza una solicitud `GET /api/clientes/:id` con un identificador
- **THEN** la solicitud es atendida por `obtenerClientePorId` entregando el parámetro `id` correspondiente

#### Scenario: Creación en POST /api/clientes
- **WHEN** se realiza una solicitud `POST /api/clientes` con el cuerpo del cliente
- **THEN** la solicitud es atendida por `crearCliente` entregando `req.body` y respondiendo 201 en caso de éxito

#### Scenario: Eliminación en DELETE /api/clientes/:id
- **WHEN** se realiza una solicitud `DELETE /api/clientes/:id`
- **THEN** la solicitud es atendida por `eliminarCliente` respondiendo 204 sin cuerpo en caso de éxito

### Requirement: Tratamiento transversal de rutas inexistentes
La aplicación SHALL interceptar cualquier solicitud HTTP cuya ruta o método no coincida con ningún endpoint registrado y SHALL responder con estado 404 y la estructura de error común.

#### Scenario: Solicitud a ruta no registrada
- **WHEN** se realiza una solicitud a una ruta no contemplada en la aplicación (por ejemplo `GET /api/desconocido`)
- **THEN** el middleware responde con estado 404 y el cuerpo `{ "error": { "code": "RUTA_NO_ENCONTRADA", "message": "La ruta solicitada no existe." } }`

### Requirement: Middleware común de errores
La aplicación SHALL disponer de un middleware de manejo de errores con firma `(err, req, res, next)` que capture las excepciones derivadas por controladores y otros middlewares, traduciendo los códigos conocidos a estados HTTP y construyendo la respuesta bajo el esquema `{ "error": { "code": "...", "message": "..." } }`. Ante errores no controlados o de almacenamiento, MUST responder con estado 500 y código seguro, sin revelar credenciales, cadenas de conexión ni trazas de error.

#### Scenario: Error por entrada inválida o identificador inválido
- **WHEN** un controlador deriva un error con código `ENTRADA_INVALIDA` o `ID_INVALIDO`
- **THEN** el middleware responde con estado 400 y el cuerpo `{ "error": { "code": "<CODIGO>", "message": "<mensaje del error>" } }`

#### Scenario: Error por cliente no encontrado
- **WHEN** un controlador deriva un error con código `CLIENTE_NO_ENCONTRADO`
- **THEN** el middleware responde con estado 404 y el cuerpo `{ "error": { "code": "CLIENTE_NO_ENCONTRADO", "message": "<mensaje del error>" } }`

#### Scenario: Error inesperado o de base de datos
- **WHEN** se deriva un error no categorizado, un fallo de conexión o un error de almacenamiento
- **THEN** el middleware responde con estado 500 y `{ "error": { "code": "ERROR_INTERNO", "message": "Ocurrió un error interno en el servidor." } }`, sin imprimir credenciales ni filtrar detalles sensibles

### Requirement: Coordinación del ciclo de vida con MongoDB Atlas
El módulo de arranque del servidor SHALL coordinar la inicialización y el apagado con las funciones compartidas de persistencia (`conectarBaseDeDatos` y `cerrarBaseDeDatos`). Si la conexión a la base de datos falla al iniciar, el servidor MUST NOT declarar disponibilidad normal y MUST abortar el arranque informando el error de forma segura sin exhibir credenciales. Ante señales de terminación (`SIGINT`, `SIGTERM`), el servidor SHALL detener la recepción de nuevas conexiones HTTP y cerrar la conexión a la base de datos.

#### Scenario: Arranque coordinado exitoso
- **WHEN** se ejecuta el arranque del servidor y la base de datos responde exitosamente al comando ping
- **THEN** el servidor Express inicia la escucha de conexiones y notifica disponibilidad

#### Scenario: Fallo de conexión durante el arranque
- **WHEN** la conexión a la base de datos es rechazada o falla la configuración
- **THEN** el proceso registra el fallo sin imprimir la URI con credenciales y finaliza con código de error sin dejar el servidor disponible falsamente

#### Scenario: Apagado ordenado ante señal de terminación
- **WHEN** el proceso recibe una señal `SIGINT` o `SIGTERM`
- **THEN** el servidor detiene la escucha HTTP y ejecuta `cerrarBaseDeDatos()` para liberar recursos limpiamente
