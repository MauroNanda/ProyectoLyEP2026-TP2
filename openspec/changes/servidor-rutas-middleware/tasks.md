# Tasks

## 1. Dependencias y configuración de entorno

- [x] 1.1 Incorporar `express` y `cors` en `server/package.json`, actualizar `server/package-lock.json` mediante `npm install` y verificar que la instalación concluya limpiamente sin errores.
- [x] 1.2 Configurar scripts de ejecución (`start` y `dev`) en `server/package.json` y actualizar `server/.env.example` con las variables `PORT` y `CORS_ORIGIN`.

## 2. Middleware transversal y enrutamiento

- [x] 2.1 Implementar middleware de errores en `server/middleware/errores.js` para procesar `JSON_INVALIDO`, `ENTRADA_INVALIDA`, `ID_INVALIDO`, `CLIENTE_NO_ENCONTRADO` y `ERROR_INTERNO` respetando el formato `{ "error": { "code": "...", "message": "..." } }`.
- [x] 2.2 Implementar middleware para rutas no encontradas en `server/middleware/no-encontrado.js` respondiendo con estado 404 y código `RUTA_NO_ENCONTRADA`.
- [x] 2.3 Implementar el enrutador de clientes en `server/routes/clientes.js` conectando las rutas `GET /`, `GET /:id`, `POST /` y `DELETE /:id` a los controladores de `controllers/clientes.js`.
- [x] 2.4 Implementar la aplicación Express en `server/app.js` mediante la fábrica `crearApp` y su exportación por defecto, integrando CORS, procesamiento de JSON, rutas de clientes y middlewares de 404 y errores.

## 3. Pruebas automatizadas del servidor y middleware

- [x] 3.1 Implementar suite de pruebas automatizadas en `server/test/servidor.test.js` cubriendo las cuatro rutas, CORS (solicitudes directas y preflight `OPTIONS`), JSON malformado (400), rutas inexistentes (404), errores de validación e inexistencia (400 y 404) y errores inesperados seguros (500), verificando su ejecución con `node --test test/servidor.test.js`.

## 4. Arranque coordinado con Atlas y documentación

- [x] 4.1 Implementar el módulo de arranque y ciclo de vida en `server/index.js`, asegurando la conexión previa a MongoDB Atlas con `conectarBaseDeDatos()`, aborto seguro sin exponer credenciales ante fallos de conexión y apagado ordenado (`SIGINT`/`SIGTERM`) con `cerrarBaseDeDatos()`.
- [x] 4.2 Documentar contratos de integración, decisiones técnicas, evidencia de pruebas y guía de ejecución en `server/documents/servidor.md` y actualizar `server/README.md`.
- [x] 4.3 Ejecutar verificación integral de la suite completa (`npm test`), comprobación de sintaxis (`node --check`) y validación estricta de OpenSpec (`openspec validate servidor-rutas-middleware --strict`).
