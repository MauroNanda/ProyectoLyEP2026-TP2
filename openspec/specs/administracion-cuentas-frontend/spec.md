# administracion-cuentas-frontend Specification

## Purpose
Permitir al Administrador gestionar las cuentas internas de Apacheta mediante la API existente y mostrar información de acceso real sin revelar datos administrativos a otros roles.
## Requirements
### Requirement: Listado y resumen real de cuentas
Cuentas SHALL usar GET /api/usuarios y mostrar nombre, email, rol y estado. Solo Administrador SHALL consultar ese recurso y ver distribución real por rol con activas/inactivas identificadas; Gerencia/Soporte SHALL conservar resumen personal/comercial sin conteos simulados. Carga, vacío y error SHALL ser estados diferenciados.

#### Scenario: Resumen autorizado
- **WHEN** Administrador consulta Inicio y se recuperan las cuentas
- **THEN** se presentan conteos derivados del arreglo real, identificando estado.

#### Scenario: Resumen de otros roles
- **WHEN** Gerencia o Soporte consulta Inicio
- **THEN** no se solicita usuarios ni se muestra distribución administrativa.

### Requirement: Alta y edición conforme al contrato
El frontend SHALL crear cuentas con nombre/email/rol/password y editar únicamente nombre/rol/activo mediante PATCH no vacío. SHALL validar nombre obligatorio <=100 puntos de código con letra Unicode, email <=254 con patrón backend, roles exactos, activo booleano y password 12–128 sin trim/normalización. Email SHALL ser inmutable en edición y no SHALL existir baja física o reset de contraseña ajena.

#### Scenario: Alta confirmada
- **WHEN** POST usuarios retorna 201
- **THEN** se actualiza el listado con la cuenta activa y se limpia la contraseña inicial del formulario.

#### Scenario: Error de campo o duplicado
- **WHEN** el servidor informa error.campos o 409 por email duplicado
- **THEN** se señalan campos mediante mensajes accesibles sin marcar alta exitosa ni perder datos no secretos.

### Requirement: Cambios de rol y estado con revocación
El frontend SHALL confirmar cambios de rol/estado indicando revocación, refrescar datos tras 200 y tratar 409 ULTIMO_ADMINISTRADOR como rechazo sin simular éxito. SHALL cerrar su sesión tras cambiar su propio rol/estado y actualizar identidad sin cerrar tras cambiar solo su nombre.

#### Scenario: Último administrador protegido
- **WHEN** el backend rechaza la desactivación/degradación con 409
- **THEN** se conserva el estado confirmado y se muestra el motivo junto a rol/estado y resumen.

#### Scenario: Cambio propio de rol
- **WHEN** un Administrador cambia su propio rol y recibe 200
- **THEN** se comunica el resultado y se solicita nuevo login sin conservar acceso administrativo.

### Requirement: Búsqueda y filtros locales de cuentas
Cuentas SHALL combinar búsqueda sin distinción de mayúsculas por nombre/email y filtros por rol/estado sobre el listado recibido, sin nuevos endpoints. SHALL mostrar cantidad visible, vacío filtrado y acción para limpiar filtros.

#### Scenario: Filtros combinados
- **WHEN** el Administrador busca un email y selecciona rol y estado
- **THEN** solo se muestran cuentas que cumplen todos los filtros sin solicitar nuevamente usuarios.
