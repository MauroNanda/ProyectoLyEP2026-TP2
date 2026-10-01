## Why

El frontend del TP1 consume una API de prueba y el repositorio todavía no tiene persistencia propia. Este change proporciona conexión a MongoDB Atlas y operaciones de almacenamiento para su consumo por servicios y servidor.

Referencia: [#3](https://github.com/MauroNanda/ProyectoLyEP2026-TP2/issues/3).

## What Changes

- Incorporar configuración por entorno, apertura y cierre de una conexión compartida a Atlas.
- Definir el modelo comercial de cliente y las operaciones asíncronas de listado, consulta, creación y eliminación.
- Exponer `id` como cadena; seleccionar campos comerciales sin persistir contraseñas ni identificadores suministrados por el solicitante.
- Incorporar datos ficticios reproducibles mediante una carga explícita e idempotente, sin borrado masivo.
- Documentar configuración y verificación real de persistencia, independientemente de Express.
- Crear la base de ejecución del backend con package.json ESM, dependencia mongodb y lockfile.

## Capabilities

### New Capabilities

- `conexion-atlas`: configuración externa y ciclo de vida de la conexión compartida.
- `persistencia-clientes`: modelo comercial, operaciones de almacenamiento y contrato consumible por servicios.
- `datos-iniciales-clientes`: carga explícita de ejemplos ficticios sin duplicados ni eliminación de registros existentes.

### Modified Capabilities

Ninguna: no hay specs vigentes ni modificaciones al frontend en este change.

## Impact

Módulos directamente en `server/config/` y `server/models/`, scripts, fixtures y pruebas dentro de `server/`, y documentación en `server/documents/`. Se utiliza el driver `mongodb` con JavaScript ESM. Este change puede crear `server/package.json` y su lockfile. Variables: `MONGODB_URI` y `MONGODB_DB_NAME`.

La capa de servicios consumirá las operaciones y el servidor utilizará apertura/cierre. Atlas real es necesario para aceptar persistencia; su configuración externa todavía no fue verificada. No incluye Express, rutas, controladores, validaciones de negocio completas, autenticación, integración del frontend ni deploy.
