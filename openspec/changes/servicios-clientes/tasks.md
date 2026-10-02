## 1. Preparación

- [x] 1.1 Confirmar autorización del responsable para implementar el change revisado.
- [ ] 1.2 Incluir en `server/documents/servicios.md` y en la descripción del PR, en una sección para controladores (#5) y middleware (#6), el contrato del módulo compartido de errores: ubicación `server/services/errores.js`, clase `ErrorServicio`, forma `{ code, message, campos? }`, códigos `ENTRADA_INVALIDA`, `ID_INVALIDO` y `CLIENTE_NO_ENCONTRADO` y su correspondencia HTTP sugerida; verificar que ambas secciones existen y coinciden con el código.

## 2. Errores de servicio

- [x] 2.1 Crear `server/services/errores.js` con `ErrorServicio` (`code`, mensaje seguro y `campos` opcional) y las constantes de código; verificar con una prueba que el error se reconoce por `code` y `instanceof`.

## 3. Casos de uso

- [x] 3.1 Implementar en `server/services/clientes.js` la fábrica `crearServicioClientes(modelo)` con `listarClientes()`, que devuelve el arreglo del modelo y propaga sus fallos; verificar listado con datos, vacío, fallo de persistencia y fallo inesperado sin código con un modelo controlado.
- [x] 3.2 Implementar validación de id y `obtenerClientePorId(id)`, convirtiendo `null` en `CLIENTE_NO_ENCONTRADO`; verificar existente, inexistente, id malformado sin invocar al modelo y fallo de persistencia.
- [x] 3.3 Implementar selección explícita, `trim` y validación de entrada, y `crearCliente(datos)`; verificar datos del formulario actual, valores de opcionales ausentes (`lastname` `"-"`, demás `""`) y `address.number` numérico como cadena usando el modelo real con una base controlada, espacios, obligatorios vacíos o ausentes, email inválido, cuerpo no objeto, opcional de tipo incompatible, campos rechazados acumulados, campos no comerciales ignorados y que una entrada inválida no invoca al modelo.
- [x] 3.4 Implementar `eliminarCliente(id)`, convirtiendo `false` en `CLIENTE_NO_ENCONTRADO`; verificar eliminación correcta, inexistente, id malformado y fallo de persistencia.
- [x] 3.5 Exportar las operaciones construidas sobre el modelo real sin abrir conexiones al importar; verificar que `npm test` pasa completo, incluidas las 11 pruebas existentes de persistencia.

## 4. Verificación real y documentación

- [x] 4.1 Con acceso de red a Atlas habilitado, ejecutar las cuatro operaciones del servicio sobre el modelo real con un registro ficticio propio (crear, consultar, eliminar, consultar inexistente) y eliminar solo ese registro; registrar fecha, comando y resultado sanitizado, o dejarlo pendiente si no hay acceso.
- [x] 4.2 Documentar en `server/documents/servicios.md` el contrato de las operaciones, la tabla de códigos de error para controladores, las reglas de validación y las verificaciones con su evidencia; enlazarlo desde `server/README.md`.
- [ ] 4.3 Revisar con `git status` y `git diff` que solo cambian `server/services/`, `server/test/`, `server/documents/`, `server/README.md` y este change; preparar la declaración de IA para el PR.

Los commits, push y PR no son automáticos: requieren validación y autorización del responsable. Ninguna tarea pendiente representa trabajo realizado.
