# Tasks

## 1. Preparación y configuración de entorno

- [x] 1.1 Crear `client/.env.example` con la variable `VITE_API_URL=http://localhost:3001/api/clientes` y verificar su consistencia con la configuración del servidor.
- [x] 1.2 Validar la instalación de dependencias en `client/` y verificar que el build de Vite compila sin errores de sintaxis.

## 2. Conexión de servicios y Dashboard

- [x] 2.1 Actualizar `client/src/services/clientesService.js` para consumir `import.meta.env.VITE_API_URL` con valor por defecto `http://localhost:3001/api/clientes` en listado, consulta por ID, alta y baja.
- [x] 2.2 Actualizar `client/src/pages/Dashboard.jsx` reemplazando la llamada directa a FakeStoreAPI por `clientesService.obtenerClientes()`, verificando la visualización del total de clientes y el manejo de estados de carga y error.

## 3. Desacople de contraseñas comerciales y robustez

- [x] 3.1 Modificar `client/src/components/FormCliente.jsx` eliminando la propiedad `password` en la creación de clientes y verificando que el payload cumple con el contrato comercial persistente.
- [x] 3.2 Modificar `client/src/pages/DetalleCliente.jsx` retirando la visualización de contraseñas comerciales y asegurando el renderizado tolerante de campos de dirección opcionales.

## 4. Documentación y verificación integral

- [x] 4.1 Documentar en `client/README.md` las variables de entorno, instrucciones de arranque coordinado (frontend + backend) y resultados de verificación funcional.
- [x] 4.2 Ejecutar `openspec validate integracion-frontend-verificacion --strict` y verificar la consistencia de todos los artefactos de la propuesta.
