# Proposal

## Why

El issue [#5](https://github.com/MauroNanda/ProyectoLyEP2026-TP2/issues/5), asignado a Gabriel Calisaya, necesita adaptar las solicitudes de clientes a los servicios existentes. Persistencia y servicios ya están integrados en `main`, pero falta la capa que construye respuestas de éxito y propaga errores al middleware del issue #6.

## What Changes

- Agregar cuatro controladores asíncronos: listado, consulta por id, creación y eliminación.
- Respetar respuestas 200/200/201/204; listado vacío como arreglo y eliminación sin cuerpo.
- Propagar errores mediante `next(error)`, conservando sus códigos y evitando respuestas de éxito ante fallos.
- Agregar pruebas locales y documentación del contrato de integración con rutas/middleware.

## Capabilities

### New Capabilities

- `controladores-clientes`: adaptación de solicitudes a servicios, respuestas de éxito y entrega de fallos al mecanismo común.

### Modified Capabilities

Ninguna. Se conservan los requisitos de `servicios-clientes` y de persistencia.

## Impact

- Crear `server/controllers/clientes.js`, `server/test/controladores.test.js` y `server/documents/controladores.md`; enlazar este último desde `server/README.md`.
- Consumir `server/services/clientes.js` sin modificarlo ni duplicar validaciones.
- Documentar para #6 exportaciones, firma `(req, res, next)` y tabla de errores; la respuesta de errores pertenece a su middleware común.
- No modificar `client/`, modelos, conexión, dependencias o lockfile; no registrar rutas ni iniciar servidor, implementar autenticación o realizar deploy.
- Preparación e implementación autorizadas por el usuario tras el análisis. Commits, publicación y PR quedan a su cargo; sin atribución de coautoría.
- La integración HTTP con el servidor de #6 y Atlas queda pendiente; las pruebas locales no acreditan ese flujo completo.
