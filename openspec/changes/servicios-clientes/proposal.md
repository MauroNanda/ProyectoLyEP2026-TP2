## Why

La persistencia de clientes ya está disponible, pero solo valida estructura y tipos: acepta cadenas vacías, no comprueba el formato del email y representa la ausencia con `null` o `false`. Falta una capa de casos de uso que aplique las reglas de negocio acordadas y entregue a los controladores resultados y errores distinguibles, sin depender de Express.

Referencia: [#4](https://github.com/MauroNanda/ProyectoLyEP2026-TP2/issues/4). Depende de [#3](https://github.com/MauroNanda/ProyectoLyEP2026-TP2/issues/3), ya fusionado.

## What Changes

- Incorporar los casos de uso `listarClientes()`, `obtenerClientePorId(id)`, `crearCliente(datos)` y `eliminarCliente(id)` sobre la interfaz de persistencia existente.
- Validar antes de guardar: cuerpo como objeto; email, phone, `name.firstname` y `address.city` como cadenas no vacías; email con formato válido.
- Normalizar los campos de texto recibidos eliminando espacios iniciales y finales, sin otras transformaciones del email.
- Validar el formato del identificador antes de consultar o eliminar.
- Convertir la ausencia informada por persistencia en un error de cliente inexistente.
- Definir errores de servicio reconocibles por código: `ENTRADA_INVALIDA` (con los campos rechazados), `ID_INVALIDO` y `CLIENTE_NO_ENCONTRADO`. Los errores de persistencia se propagan sin modificar.
- Ignorar `password`, `id`, `_id` y otros campos ajenos enviados por el solicitante, sin rechazar la solicitud, para mantener compatible el formulario actual.
- Documentar el contrato para controladores y las verificaciones realizadas.

## Capabilities

### New Capabilities

- `servicios-clientes`: casos de uso de clientes, validación y normalización de entradas, y errores de servicio distinguibles por código.

### Modified Capabilities

Ninguna: los requisitos de `persistencia-clientes`, `conexion-atlas` y `datos-iniciales-clientes` se consumen sin cambios.

## Impact

Nuevos módulos en `server/services/`, pruebas en `server/test/` y documentación en `server/documents/`. No se modifican `server/models/`, `server/config/`, `server/package.json` ni su lockfile; no se agregan dependencias.

Los controladores (issue #5) consumirán las cuatro operaciones y traducirán los códigos de error a respuestas HTTP; deben acordar estos códigos antes de implementar. No incluye rutas, respuestas Express, middleware, autenticación, una conexión adicional a Atlas, cambios en `client/` ni unicidad de email o username.
