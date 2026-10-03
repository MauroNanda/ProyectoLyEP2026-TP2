# Proposal

## Why

El issue [#6](https://github.com/MauroNanda/ProyectoLyEP2026-TP2/issues/6) (área "Rutas y middleware" del roadmap, asignado a Daniel Palermo) necesita exponer la API REST en `localhost:3001` e integrar la cadena HTTP con los controladores reales ya implementados. Persistencia, servicios y controladores ya están desarrollados y probados, pero falta la aplicación Express ejecutable, el registro de rutas de clientes, la configuración de CORS para el frontend (`http://localhost:5173`), el procesamiento y validación de JSON, el middleware centralizado para respuestas de error homogéneas y rutas inexistentes, y el ciclo de vida coordinado de arranque y parada con MongoDB Atlas.

## What Changes

- Configurar `express` y `cors` en `server/package.json` y actualizar el lockfile manteniendo Node.js >=24 y ESM.
- Agregar scripts de ejecución reproducibles (`start`, `dev`) que permitan levantar el servidor con o sin variables de entorno locales.
- Implementar la aplicación Express (`server/app.js` o fábrica desacoplada) con lectura de variables de entorno (`PORT` con valor por defecto 3001, origen CORS permitido por defecto `http://localhost:5173`).
- Configurar middleware para parseo de solicitudes JSON y captura de cuerpos malformados (400 con código acordado).
- Configurar middleware de CORS para habilitar solicitudes normales y preflight OPTIONS desde `http://localhost:5173`.
- Registrar el enrutador para el recurso `/api/clientes` con las cuatro operaciones (`GET /`, `GET /:id`, `POST /`, `DELETE /:id`) delegando a las exportaciones de `server/controllers/clientes.js`.
- Implementar middleware transversal para rutas inexistentes devolviendo 404 bajo el formato `{ "error": { "code": "...", "message": "..." } }`.
- Implementar middleware transversal de errores que interprete los códigos de los servicios y controladores:
  - `ENTRADA_INVALIDA` e `ID_INVALIDO` → 400.
  - JSON malformado / error de parseo → 400.
  - `CLIENTE_NO_ENCONTRADO` → 404.
  - Fallos inesperados o de persistencia → 500 con código seguro, sin exponer credenciales, stack traces ni detalles internos.
- Implementar módulo de arranque (`server/index.js` o `server/server.js`) que coordine la apertura de la base de datos con `conectarBaseDeDatos()`, maneje fallos de conexión sin declarar disponibilidad falsa y asegure el cierre ordenado con `cerrarBaseDeDatos()` ante señales del sistema (`SIGINT`, `SIGTERM`).
- Documentar configuración en `server/.env.example`, instrucciones en `server/README.md` y contrato en `server/documents/servidor.md`.
- Incorporar pruebas automatizadas de rutas, middleware y ciclo de vida en `server/test/`.

## Capabilities

### New Capabilities

- `servidor-rutas-middleware`: Servidor Express en puerto 3001, procesamiento de JSON, soporte CORS para el frontend, rutas de `/api/clientes`, middleware transversal de errores y rutas no encontradas, y coordinación de arranque y cierre con MongoDB Atlas.

### Modified Capabilities

Ninguna: los requisitos de `conexion-atlas`, `persistencia-clientes`, `servicios-clientes` y `controladores-clientes` se consumen sin modificaciones.

## Impact

- Archivos afectados: `server/package.json`, `server/package-lock.json`, `server/.env.example`, `server/README.md`.
- Nuevos módulos previstos en `server/`: `app.js`, `index.js`, `routes/clientes.js`, `middleware/errores.js`, `middleware/no-encontrado.js`, `test/servidor.test.js`, `documents/servidor.md`.
- No modifica `client/`, `server/models/`, `server/services/` ni `server/controllers/clientes.js`.
- Exclusiones respetadas: no implementa modelos, reglas de negocio adicionales, autenticación real, integración en el frontend ni deploy.
