# Proposal

## Why

El issue [#7](https://github.com/MauroNanda/ProyectoLyEP2026-TP2/issues/7) (área "Integración y documentación" del roadmap, asignado a Sebastián Velázquez) requiere conectar los consumidores del frontend en `client/` a la API REST propia en `localhost:3001/api/clientes`. Hasta ahora, el backend propio implementa persistencia en MongoDB Atlas, servicios, controladores, rutas Express y middleware de errores (issues #3 a #6), pero el frontend sigue consultando la API externa `https://fakestoreapi.com/users` tanto en el servicio de clientes como de manera directa en el Dashboard. Además, el prototipo heredado enviaba y mostraba contraseñas comerciales ficticias que no forman parte del modelo comercial persistente. Es necesario unificar los consumidores con el backend propio mediante variables de entorno, adecuar las pantallas comerciales y verificar el funcionamiento integral del sistema.

## What Changes

- Configurar variable de entorno `VITE_API_URL` en `client/.env.example` apuntando por defecto a `http://localhost:3001/api/clientes`.
- Actualizar `client/src/services/clientesService.js` para consumir la URL base configurada por entorno (`import.meta.env.VITE_API_URL || 'http://localhost:3001/api/clientes'`) en todas las operaciones (`obtenerClientes`, `obtenerClientePorId`, `crearCliente`, `eliminarCliente`).
- Actualizar `client/src/pages/Dashboard.jsx` para sustituir el `fetch` directo a `https://fakestoreapi.com/users` por la consulta centralizada a la API propia (vía `clientesService.obtenerClientes()`), manteniendo el contador de clientes y el tratamiento de estados de carga y error.
- Adecuar `client/src/components/FormCliente.jsx` para eliminar el envío de la propiedad `password: "1234"` en la creación de clientes comerciales, asegurando que la carga útil coincida con el contrato de datos persistente.
- Adecuar `client/src/pages/DetalleCliente.jsx` para retirar la visualización de contraseñas de la sección de credenciales comerciales y garantizar el renderizado seguro de campos de dirección opcionales (`street`, `number`, `zipcode`).
- Preservar íntegramente la autenticación y sesiones simuladas de usuarios/administradores existentes en `client/src/services/autorizacionesServices.js` y el login de administración.
- Documentar el proceso de integración, variables de entorno y evidencias de verificación en `client/README.md`.

## Capabilities

### New Capabilities

- `integracion-frontend`: Conexión de los consumidores del cliente React a la API REST `/api/clientes`, parametrización por entorno, desvinculación de contraseñas comerciales y verificación funcional integral de listado, búsqueda, detalle, alta, baja y métricas del dashboard.

### Modified Capabilities

Ninguna: los requisitos de `conexion-atlas`, `persistencia-clientes`, `servicios-clientes` y `servidor-rutas-middleware` se consumen sin modificaciones normativas.

## Impact

- Archivos modificados en `client/`:
  - `client/src/services/clientesService.js`
  - `client/src/pages/Dashboard.jsx`
  - `client/src/components/FormCliente.jsx`
  - `client/src/pages/DetalleCliente.jsx`
  - `client/README.md`
- Archivos nuevos en `client/`:
  - `client/.env.example`
- No modifica la lógica interna del backend en `server/` (modelos, servicios, controladores, rutas ni middleware).
- Exclusiones respetadas: no implementa autenticación real de backend con tokens/JWT, no altera el sistema de login simulado del frontend, no rediseña pantallas ni agrega endpoints ajenos a `/api/clientes`.
