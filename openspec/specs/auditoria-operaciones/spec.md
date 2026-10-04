# auditoria-operaciones Specification

## Purpose

Proveer a administradores de Apacheta un historial verificable de accesos y modificaciones, identificando responsables sin publicar credenciales ni convertir logs técnicos en datos del producto.

## Requirements

### Requirement: Eventos de negocio y acceso
El backend SHALL registrar los tipos de evento de [diseño del change](../../changes/archive/2026-10-04-cuentas-permisos-auditoria-backend/design.md) con fecha UTC, actor obtenido de la sesión, recurso, resultado y requestId. Login fallido SHALL usar actorId nulo. SHALL excluir secretos, cuerpos completos, IP y datos del intento de email.

#### Scenario: Identidad del actor
- **WHEN** una cuenta crea un cliente y envía un actor falso en el cuerpo
- **THEN** el historial registra al usuario autenticado, el id generado y CLIENTE_CREADO, sin tomar la identidad del cuerpo.

#### Scenario: Credenciales rechazadas
- **WHEN** se rechaza un login
- **THEN** se registra LOGIN_FALLIDO sin contraseña, token, hash ni email intentado.

### Requirement: Confirmación coherente de operación y evento
El sistema SHALL confirmar conjuntamente la mutación y su evento mediante transacción; una sesión de login no SHALL entregarse sin confirmar su registro y evento. Los errores internos SHALL permanecer seguros.

#### Scenario: Falla al registrar auditoría
- **WHEN** falla la escritura del evento correspondiente a un alta de cliente o cuenta
- **THEN** no confirma la mutación ni responde éxito.

#### Scenario: Login y logout auditados
- **WHEN** una cuenta inicia o cierra sesión correctamente
- **THEN** la creación o revocación de sesión se confirma junto con su evento de auditoría.

### Requirement: Consulta administrativa de solo lectura
Solo Administrador SHALL consultar GET /api/auditoria con filtros y cursor validados, límite predeterminado 50 y máximo 100, orden descendente estable fecha/id y respuesta {items,nextCursor}. No SHALL existir API de modificación ni eliminación de eventos.

#### Scenario: Acceso restringido
- **WHEN** Gerencia o Soporte solicita el historial
- **THEN** recibe 403 sin contenido del historial.

#### Scenario: Consulta limitada
- **WHEN** un Administrador consulta eventos con filtros permitidos
- **THEN** recibe solo coincidencias hasta el límite y un cursor para continuar sin repetir filas en un conjunto sin cambios.

#### Scenario: Filtro inválido
- **WHEN** se envía un cursor inválido, fechas incompatibles o filtros ajenos al contrato
- **THEN** recibe 400 sin ejecutar una consulta MongoDB construida con filtros arbitrarios.
