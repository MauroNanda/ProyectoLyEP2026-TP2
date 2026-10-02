# Servidor Express, rutas y middleware

Contribución del issue [#6](https://github.com/MauroNanda/ProyectoLyEP2026-TP2/issues/6), responsable Daniel Palermo. Change activo: `servidor-rutas-middleware`. JavaScript ESM, Express, sin modificaciones de modelos, servicios ni frontend.

## Propósito y alcance

Este módulo implementa el servidor HTTP Express en `localhost:3001`, expone la API REST en `/api/clientes`, configura el soporte de CORS para el frontend React/Vite (`http://localhost:5173`), procesa cuerpos JSON capturando solicitudes malformadas, unifica el tratamiento de errores y rutas no encontradas bajo el formato acordado y coordina el arranque y parada limpia con la conexión a MongoDB Atlas.

## Componentes y arquitectura

### 1. Aplicación y fábrica desacoplada (`server/app.js`)
Exporta `crearApp({ controladores, corsOrigin })` y una instancia por defecto configurada con los controladores de clientes reales (`controllers/clientes.js`). Permite ejecutar pruebas unitarias y de integración sobre puertos efímeros de forma aislada sin requerir credenciales activas de MongoDB Atlas.

- **CORS:** Habilitado para `http://localhost:5173` (o variable `CORS_ORIGIN`), soportando métodos `GET, POST, DELETE, OPTIONS` y cabeceras necesarias.
- **JSON:** Middleware `express.json()` para solicitudes con carga útil JSON.

### 2. Enrutamiento (`server/routes/clientes.js`)
Registra las cuatro operaciones sobre `/api/clientes`:

| Método | Ruta | Controlador conectado | Respuesta exitosa |
|---|---|---|---|
| `GET` | `/api/clientes` | `listarClientes` | 200 OK con arreglo JSON |
| `GET` | `/api/clientes/:id` | `obtenerClientePorId` | 200 OK con cliente JSON |
| `POST` | `/api/clientes` | `crearCliente` | 201 Created con cliente JSON creado |
| `DELETE` | `/api/clientes/:id` | `eliminarCliente` | 204 No Content sin cuerpo |

### 3. Middleware de rutas no encontradas (`server/middleware/no-encontrado.js`)
Captura cualquier solicitud a endpoints o métodos no registrados y responde 404:
```json
{
  "error": {
    "code": "RUTA_NO_ENCONTRADA",
    "message": "La ruta solicitada no existe."
  }
}
```

### 4. Middleware centralizado de errores (`server/middleware/errores.js`)
Interpreta las excepciones derivadas por los controladores y capas previas, respondiendo bajo el formato unificado `{ "error": { "code": "...", "message": "..." } }`:

| Origen / Código | Estado HTTP | Código público | Mensaje |
|---|---|---|---|
| JSON malformado (`SyntaxError`) | 400 | `JSON_INVALIDO` | El cuerpo de la solicitud contiene JSON malformado. |
| `ENTRADA_INVALIDA` | 400 | `ENTRADA_INVALIDA` | Mensaje descriptivo de validación |
| `ID_INVALIDO` | 400 | `ID_INVALIDO` | Mensaje descriptivo del identificador |
| `CLIENTE_NO_ENCONTRADO` | 404 | `CLIENTE_NO_ENCONTRADO` | Mensaje de inexistencia |
| Error inesperado / Persistencia | 500 | `ERROR_INTERNO` | Ocurrió un error interno en el servidor. |

Los errores internos y fallos de persistencia no exponen credenciales, URIs de conexión ni trazas de ejecución en la respuesta ni en los logs.

### 5. Arranque y parada coordinados (`server/index.js`)
- **Lectura de entorno:** `PORT` (3001 por defecto), `MONGODB_URI`, `MONGODB_DB_NAME`, `CORS_ORIGIN`.
- **Coordinación de conexión:** Invoca `await conectarBaseDeDatos()` antes de iniciar la escucha HTTP. Si la conexión falla, se informa el error sin revelar credenciales y el proceso finaliza con código 1 sin declarar disponibilidad falsa.
- **Graceful Shutdown:** Captura señales `SIGINT` y `SIGTERM` para cerrar la recepción de conexiones HTTP y liberar la conexión a MongoDB Atlas mediante `cerrarBaseDeDatos()`.

## Scripts de ejecución

En `server/package.json`:
- `npm start`: Inicia el servidor cargando `.env` local (`node --env-file-if-exists=.env index.js`).
- `npm run dev`: Inicia el servidor con reinicio automático ante cambios (`node --env-file-if-exists=.env --watch index.js`).
- `npm test`: Ejecuta la suite de pruebas automatizadas con el runner nativo de Node.js.

## Verificación reproducible

Entorno de ejecución: Node.js >=24.

Desde la carpeta `server/`:
```bash
# Instalación de dependencias
npm ci

# Ejecución de la suite completa de pruebas (63 pruebas)
npm test

# Ejecución individual de la suite del servidor
node --test test/servidor.test.js

# Comprobación de sintaxis
node --check app.js
node --check index.js
node --check routes/clientes.js
node --check middleware/errores.js
node --check middleware/no-encontrado.js
node --check test/servidor.test.js
```

Desde la raíz del repositorio:
```bash
openspec validate servidor-rutas-middleware --strict
git diff --check
```

### Resultados de la verificación local
- Pruebas previas (controladores, persistencia, servicios): 50 pruebas aprobadas.
- Pruebas nuevas del servidor HTTP y middleware: 13 pruebas aprobadas.
- Suite completa: 63 pruebas aprobadas, 0 fallos, 0 omitidas.
- Validación estricta de OpenSpec aprobada sin advertencias.
- Comprobación de sintaxis de todos los módulos aprobada.

## Declaración de uso de IA y entrega individual

- **Herramienta:** Asistente AI Antigravity.
- **Asistencia recibida:** Definición de propuesta OpenSpec, especificaciones formales, diseño técnico, desglose de tareas, implementación de la aplicación Express, enrutador, middlewares transversales, módulo de arranque y ciclo de vida, suite de pruebas automatizadas y documentación.
- **Control humano y autorización:** Las decisiones de diseño y contratos fueron revisadas y autorizadas según el roadmap y el issue asignado. Commits, ramas y PR quedan bajo validación y control explícito del integrante.
