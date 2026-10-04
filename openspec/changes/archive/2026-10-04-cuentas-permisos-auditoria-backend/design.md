## Context

Ver proposal.md para motivación. Base comprobada: main 550d861, con backend académico y rediseño integrados. Express registra GET/POST/DELETE de clientes; usuarios simulados viven en el frontend. La capa de servicios ya valida obligatorios/email y conserva campos inválidos, pero el middleware no publica esos campos. No hay edición de clientes ni autorización real. ROADMAP y config conservan referencias históricas a backend pendiente; no se toman como estado vigente.

El usuario autorizó los commits de planificación y la implementación el 2026-10-04. La integración frontend y el cierre requieren revisión posterior. Se conserva JavaScript ESM, driver MongoDB, conexión compartida y capas actuales.

## Goals / Non-Goals

Una cuenta representa una persona del equipo, nunca un cliente comercial. El backend decide permisos, identidad y estado de sesión; no confía en sector, usuario ni actor enviados por el navegador. Ninguna identidad de auditoría se toma del cuerpo de una operación.

No construir un proveedor de identidad completo ni ampliar el modelo comercial. El alcance excluido está en proposal.md. No se incorpora un modo que permita saltar autenticación en la configuración final.

## Decisions

### 1. Roles propuestos y cuentas

| Operación | Administrador | Gerencia | Soporte |
|---|---|---|---|
| Consultar y crear clientes | Sí | Sí | Sí |
| Eliminar clientes | Sí | Sí | No |
| Gestionar cuentas y consultar historial | Sí | No | No |
| Consultar su sesión/cambiar su contraseña/cerrar sesión | Sí | Sí | Sí |

Administrador administra acceso y conserva facultades comerciales de Gerencia. No se crean permisos por sucursal. Una persona tiene un rol vigente; la pertenencia actual a Gerencia no la convierte automáticamente en Administrador.

Colección usuarios: id público derivado de ObjectId, nombre, email normalizado, rol, activo, passwordHash y fechas. Email único case-insensitive mediante campo normalizado e índice único; esta regla corresponde a cuentas, no a clientes comerciales. DTO público solo id/nombre/email/rol/activo/fechas. PATCH administrativo permite nombre/rol/activo, no id/email/passwordHash. Email inmutable en este hito para reducir casos de cambio de identidad. Cuenta desactivada se conserva, sin eliminación física.

No desactivar ni degradar al último administrador activo. Serializar modificaciones administrativas usando un documento de control compartido dentro de transacción, para que dos peticiones concurrentes no eludan esta regla. Un cambio de rol/estado revoca las sesiones del afectado; las solicitudes ya iniciadas pueden finalizar, las siguientes deben validar nuevamente.

### 2. Credenciales y sesiones

Se propone scrypt asíncrono nativo de Node, salt aleatorio por cuenta, formato versionado y comparación constante. Perfil inicial N=131072, r=8, p=1, salt de 16 bytes, derivación de 64 bytes y maxmem de 192 MiB, medido localmente durante la implementación; ver verification.md. Sin hash rápido de contraseña ni contraseñas por defecto. Longitud propuesta 12–128 caracteres Unicode, sin recortar ni normalizar la contraseña. La contraseña inicial se entrega por canal privado; se permite cambiarla con la contraseña actual, pero no hay recuperación por email ni reseteo administrativo en este hito.

Sesión opaca: token aleatorio de 32 bytes, enviado una sola vez al iniciar sesión; en Mongo se guarda únicamente su hash SHA-256, usuarioId, inicio, expiresAt y revocación. SHA-256 se usa para token aleatorio, no para contraseña. Duración absoluta propuesta: 8 horas, sin refresh token. Índice TTL limpia sesiones expiradas, pero cada solicitud comprueba fecha y estado sin depender de esa limpieza. Cabecera Authorization: Bearer; no cookies automáticas en este contrato. El frontend posterior deberá mantener el token en memoria, sin localStorage; recargar solicitará iniciar sesión de nuevo.

Login solo email/password, sin selector de sector. Mensaje 401 genérico para usuario ausente, desactivado o contraseña incorrecta. Verificación de hash ficticio para cuentas ausentes evita un atajo temporal obvio. Respuestas de autenticación con Cache-Control: no-store. Límite propuesto: 10 intentos por IP cada 15 minutos, contador acotado en memoria y máximo 2 derivaciones concurrentes por proceso; responder 429 con Retry-After al exceder el límite. No bloquear la cuenta de forma permanente. Es una protección local para un único proceso, no infraestructura distribuida.

### 3. Contratos HTTP para el frontend

DTO Cuenta: {id,nombre,email,rol,activo,createdAt,updatedAt}. Roles exactos: Administrador, Gerencia, Soporte.

| Ruta | Entrada / respuesta | Acceso |
|---|---|---|
| POST /api/auth/login | {email,password} → 200 {token,expiresAt,usuario:Cuenta} | Público, limitado |
| GET /api/auth/me | 200 Cuenta | Sesión vigente |
| POST /api/auth/logout | 204; revoca sesión actual | Sesión vigente |
| PATCH /api/auth/password | {actual,nueva} → 204; revoca todas sus sesiones | Sesión vigente |
| GET /api/usuarios | 200 Cuenta[] | Administrador |
| POST /api/usuarios | {nombre,email,rol,password} → 201 Cuenta, activo=true | Administrador |
| PATCH /api/usuarios/:id | Subconjunto no vacío de {nombre,rol,activo} → 200 Cuenta | Administrador |
| GET /api/auditoria | 200 {items,nextCursor} | Administrador |
| GET /api/clientes y GET /api/clientes/:id | Contrato actual | Tres roles |
| POST /api/clientes | Contrato actual | Tres roles |
| DELETE /api/clientes/:id | 204 actual | Administrador/Gerencia |

Errores conservan {error:{code,message}} y agregan campos opcional solo para validación pública. 400 entrada/id inválidos; 401 sesión o credenciales inválidas; 403 permiso insuficiente; 404 recurso ausente; 409 email duplicado o último administrador; 413 cuerpo excesivo; 429 límite; 500 error interno seguro; 503 indisponibilidad conocida de almacenamiento. Nunca reenviar mensajes del driver. Preflight OPTIONS sigue público y CORS permite PATCH/Authorization para el origen configurado; CORS no acredita autenticación.

### 4. Auditoría de negocio y sesiones

Colección auditoria inmutable por API. Eventos: LOGIN_CORRECTO, LOGIN_FALLIDO, LOGOUT, PASSWORD_CAMBIADA, CUENTA_CREADA, CUENTA_ACTUALIZADA, CLIENTE_CREADO, CLIENTE_ELIMINADO. Los cambios de rol/estado se identifican en camposModificados; no se guardan valores de contraseñas ni cuerpos comerciales. ActorId/rol derivan de la sesión; login fallido usa actorId=null sin almacenar email intentado. Campos: id, fecha UTC, tipo, actorId/rol, recurso/id, resultado, requestId y camposModificados cuando aplica. Sin tokens, hashes, URI, password, IP ni snapshots completos.

GET admite tipo, actorId, desde/hasta ISO, limit entre 1 y 100 (50 por defecto) y cursor. Orden descendente por fecha/id, índices acordes; cursor validado, no filtros Mongo arbitrarios. Se conservan eventos sin borrado automático en este hito; definir retención antes de un uso real prolongado. No contar consultas de listado/ficha ni convertir los logs técnicos en auditoría.

Las mutaciones de clientes/cuentas y su evento se confirman juntos mediante transacción MongoDB Atlas; si la auditoría falla, no confirmar la mutación. Login confirma sesión y evento juntos; si no puede registrarlos, no entrega token. Logout y cambio de contraseña revocan sesiones con su evento en la misma transacción. Confirmar disponibilidad de transacciones en el entorno antes de implementar, sin migrar la base ni borrar ejemplos.

### 5. Correcciones acotadas

Clientes: mantener estructura/id y selección de campos. Límites propuestos: nombre/apellido/ciudad 100 caracteres, email 254, teléfono 40, usuario 100, calle 200, número 30 y postal 20. Teléfono: 7–15 dígitos, permitiendo espacios, guiones, paréntesis y un + inicial. Nombre/ciudad deben contener al menos una letra Unicode; no listas rígidas ni prohibición de números en nombres comerciales. Email sigue validación básica, sin prometer existencia. Número admite datos comerciales textuales. Clientes no tienen email único. Compartir reglas entre API y seed, sin introducir otro framework de validación por defecto.

JSON con límite explícito 100kb; traducción segura de errores del parser. PORT entero 1–65535 (3001 solo si ausente); CORS_ORIGIN URL http/https válida con origen sin ruta; HOST configurable como localhost o dirección IP válida, 127.0.0.1 por defecto para desarrollo local. Manejar errores síncronos y evento error al escuchar, cerrar Mongo y fallar con código no cero. Cierre con máximo 10 segundos y código no cero ante fallo. Logs técnicos mínimos con requestId/código/duración, sin Authorization/cuerpo/secretos.

### 6. Trabajo por etapas y transición

Un change en la rama de backend: (1) correcciones y validación, (2) cuentas/bootstrap, (3) sesiones y permisos, (4) auditoría y API administrativa, (5) pruebas y contratos. Cada bloque se revisa antes de avanzar. No dividir artificialmente artefactos funcionales dependientes en changes distintos para simular un cierre parcial.

Bootstrap local interactivo, con contraseña oculta y sin argumentos/valores por defecto; transacción e índice/control evitan crear dos primeros administradores concurrentes. No ejecutarlo al arrancar ni al seed de clientes. Crea una cuenta únicamente cuando no hay ninguna; después requiere gestión autenticada. No copiar Admin123 ni migrar automáticamente la lista del frontend.

La protección se desarrolla y prueba en rama. Antes de integrarla en main, el change del frontend debe reemplazar login/lista fija, consumir token/me y mostrar administración/historial según permisos. No integrar primero un backend protegido contra un cliente todavía simulado; no dejar AUTH_DISABLED como solución permanente. Cambiar a este contrato hace inválida cualquier sesión local anterior. Rollback de código conserva datos y requiere valorar que volver al backend anterior retiraría la protección.

## Risks / Trade-offs

- El núcleo de cuentas/sesiones/auditoría es transversal: limitar gestión a las operaciones de la tabla y conservar la arquitectura actual.
- Hash costoso: medir tiempo/memoria y limitar concurrencia; revisar el perfil si el entorno no puede sostenerlo, no reducirlo silenciosamente.
- Auditoría atómica exige transacciones: verificar soporte Atlas y retry de conflictos antes de modificar modelos.
- Cliente actual incompatible con permisos: coordinar integración final con el change frontend.
- Token en memoria implica nuevo login al recargar: decisión inicial que evita persistir credenciales en localStorage; cambio de transporte requiere revisar ambos contratos.

## References

[OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) y [Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html): referencias para hash lento y tokens impredecibles. Las duraciones, roles y contratos anteriores son decisiones propuestas para Apacheta, no requisitos atribuidos a estas fuentes.


### Documentación interactiva autorizada

OpenAPI 3.0.3 mantenido en server/documents/openapi.js; Swagger UI servido desde dependencia local en /api/docs y contrato JSON en /api/openapi.json. Solo NODE_ENV ausente o development habilita estas rutas; producción/test y otros valores no las registran. Authorization Bearer sin persistencia del token al recargar, sin ejemplos de credenciales ni validador externo. Servidor relativo al mismo origen para respetar HOST/PORT. Documentar todas las operaciones y errores sin saltar permisos.
