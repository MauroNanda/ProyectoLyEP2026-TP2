# Cuentas, permisos y auditoría

## Estado y transición

Implementado en la rama de backend; todavía no integrado con el frontend. Las rutas comerciales ahora exigen Bearer: el login simulado actual no genera una sesión válida. Coordinar el change frontend antes de integrar en main. No existe AUTH_DISABLED.

Las cuentas del equipo son independientes de clientes comerciales. No se importan usuarios ni contraseñas hardcodeadas. Los contratos de este documento amplían la documentación anterior del servidor.

## Configuración y primer administrador

Node 24+, las dependencias existentes y Atlas con transacciones. Cada integrante configura server/.env con las variables del ejemplo y habilita su IP; las credenciales se comparten por canal privado.

Desde server/:

```powershell
npm ci
npm run bootstrap:admin
npm start
```

Bootstrap pregunta nombre, correo y contraseña dos veces, con entrada de contraseña oculta. Requiere terminal interactiva. Ejecutarlo una sola vez de forma coordinada en una base sin cuentas: crea Administrador activo; si existe cualquier cuenta, se rechaza. Nunca se ejecuta automáticamente ni junto al seed. El equipo no debe repetirlo en la base compartida. La cuenta inicial y su contraseña las elige quien ejecute el comando; no hay valores por defecto ni secretos por argumento.

Para crear otras cuentas, el administrador usa POST /api/usuarios autenticado. La pantalla correspondiente pertenece al change frontend. Se permite nombre, correo, rol exacto y contraseña inicial, entregada por canal privado. El usuario puede cambiarla con su contraseña actual. No hay registro público, recuperación por correo ni reseteo administrativo.

PORT entero decimal 1–65535 (3001 si ausente); HOST localhost o IP (127.0.0.1 por defecto); CORS_ORIGIN origen HTTP/HTTPS sin ruta ni credenciales (http://localhost:5173 por defecto). Arranque comprueba conexión e índices antes de escuchar. Cierre máximo 10 segundos, salida no cero ante error.

## Contratos HTTP

Cuenta pública: id, nombre, email, rol, activo, createdAt, updatedAt. Fechas JSON ISO UTC; email normalizado y único solamente en cuentas. No retorna passwordHash ni campos de control.

| Método y ruta | Entrada y salida | Acceso |
|---|---|---|
| POST /api/auth/login | {email,password} → 200 {token,expiresAt,usuario} | Público limitado |
| GET /api/auth/me | 200 Cuenta | Sesión |
| POST /api/auth/logout | 204, revoca sesión actual | Sesión |
| PATCH /api/auth/password | {actual,nueva} → 204, revoca todas sus sesiones | Sesión |
| GET /api/usuarios | 200 Cuenta[] | Administrador |
| POST /api/usuarios | {nombre,email,rol,password} → 201 Cuenta activa | Administrador |
| PATCH /api/usuarios/:id | Subconjunto no vacío {nombre,rol,activo} → 200 Cuenta | Administrador |
| GET /api/auditoria | 200 {items,nextCursor} | Administrador |
| GET /api/clientes y /api/clientes/:id | Contrato comercial existente | Los tres roles |
| POST /api/clientes | Contrato comercial existente, 201 | Los tres roles |
| DELETE /api/clientes/:id | 204 | Administrador/Gerencia |

Roles exactos: Administrador, Gerencia, Soporte. Correo inmutable; no eliminación física de cuentas. No se permite desactivar o degradar al último administrador activo. Cambiar rol/estado revoca las sesiones de la cuenta. La comprobación usa datos actuales, nunca actor o rol del cuerpo.

Enviar Authorization: Bearer <token>. Token en memoria del frontend, sin localStorage; recargar requiere login. Duración absoluta ocho horas, sin refresh. Respuestas autenticadas/auth usan Cache-Control: no-store. Preflight OPTIONS público; CORS permite PATCH y Authorization y no reemplaza permisos.

Errores: {error:{code,message,campos?}}. 400 validación/JSON/ID; 401 credenciales/sesión; 403 permiso; 404 recurso; 409 correo duplicado/último administrador/bootstrap repetido; 413 cuerpo mayor de 100 KB; 429 intentos o derivaciones; 503 almacenamiento controlado; 500 fallo no categorizado. Campos contiene nombres públicos, nunca valores o trazas. 429 agrega Retry-After.

## Contraseñas y sesiones

Contraseña de 12–128 caracteres Unicode, sin recortar ni normalizar. Scrypt asíncrono nativo, N=131072, r=8, p=1, salt aleatorio 16 bytes, derivación 64 bytes, formato versionado y maxmem 192 MiB por derivación. Comparación constante y derivación ficticia para correo ausente/inactivo. Hasta dos derivaciones simultáneas por proceso; no es una medición de capacidad para producción.

Token aleatorio de 32 bytes; Mongo guarda SHA-256 del token, nunca el token original. SHA-256 no se usa para contraseñas. TTL limpia sesiones, pero autorización revisa expiración/revocación/estado en cada petición. Cambios de contraseña/rol/estado invalidan sesiones.

Login: diez intentos por IP cada quince minutos; contador de hasta 10000 IP en memoria. Reiniciar el proceso reinicia el contador; no es una limitación distribuida ni se confía en cabeceras proxy. Sin bloqueo permanente. Un despliegue futuro requiere HTTPS, tratamiento de proxy, capacidad, recuperación y retención adecuados.

## Historial

Eventos LOGIN_CORRECTO, LOGIN_FALLIDO, LOGOUT, PASSWORD_CAMBIADA, CUENTA_CREADA, CUENTA_ACTUALIZADA, CLIENTE_CREADO, CLIENTE_ELIMINADO. Actor identificado por sesión; fallido sin correo intentado ni actor. Contiene fecha, tipo, actorId/rol, recurso/recursoId, resultado, requestId y nombres de campos modificados cuando corresponde. Nunca contraseña, hash, token, URI, IP ni cuerpos completos.

Filtros tipo, actorId, desde/hasta (fecha ISO con hora), limit 1–100 (50 por defecto), cursor opaco devuelto por el servidor. Orden fecha/id descendente. Seguir nextCursor hasta null. Sin rutas de edición/borrado. Sin retención automática en este alcance: acordarla antes de uso prolongado. Logs técnicos separados contienen requestId, método, estado y duración.

Mutación y evento se confirman juntos. Auditoría fallida revierte cuentas/clientes/sesiones. El documento administrativo compartido serializa cambios concurrentes; los errores transitorios conservan las etiquetas necesarias para retry del driver. El token solo se devuelve después de confirmar sesión y evento.

## Verificación

```powershell
npm test
npm run verificar:seguridad
```

npm test no necesita Atlas. verificar:seguridad necesita .env y permisos para crear índices, transacciones y borrar sus colecciones temporales. Crea colecciones apacheta_verificacion_<UUID>_<recurso> dentro de la base configurada; las elimina al finalizar. No usa usuarios/clientes/ejemplos del equipo ni crea un administrador permanente. Si se interrumpe abruptamente, revisar y borrar únicamente las colecciones con ese prefijo exacto de la ejecución. No bajar permisos ni borrar la base para resolver un error.

Prueba HTTP autenticada, permisos, validación, revocación/expiración, persistencia, bootstrap y último admin concurrentes, correo único, cursor, rollback y retry sin duplicación. Para probar manualmente con cuentas permanentes, crear primero el administrador mediante bootstrap y usar POST /api/auth/login; no pegar contraseña/token en documentación o PR.

Asistencia de IA: Codex generó implementación, pruebas y documentación a partir de la propuesta OpenSpec autorizada. Se ejecutaron validaciones automatizadas y circuito Atlas; El usuario confirmó revisión y pruebas manuales en Swagger/API y frontend el 2026-10-04. La sustitución definitiva del código de acceso simulado pertenece al change frontend y no se acredita mediante estas pruebas.

## Swagger: probar desde el navegador

Desde server/, ejecutar npm ci y npm start. Con NODE_ENV ausente o development, abrir http://127.0.0.1:3001/api/docs (ajustar el puerto si corresponde). Contrato JSON en /api/openapi.json. NODE_ENV=production, test u otros valores no publican estas rutas.

1. Expandir POST /api/auth/login y usar Try it out con el correo y contraseña elegidos en bootstrap.
2. Ejecutar y copiar el token de la respuesta 200.
3. Pulsar Authorize, pegar solo el token (sin Bearer) y confirmar.
4. Expandir POST /api/usuarios: ingresar nombre, email, rol exacto y contraseña inicial; ejecutar y comprobar respuesta 201. GET /api/usuarios permite consultar las cuentas.
5. Para cerrar la sesión real ejecutar POST /api/auth/logout; Logout dentro de Authorize solo retira el token de Swagger.

El token se pierde al recargar la interfaz; no se precargan credenciales. Swagger respeta permisos, expiración y límites. Try it out ejecuta operaciones reales en la base configurada. El bootstrap sigue siendo un comando local, no una ruta API. Recursos UI servidos localmente, sin validador externo. Contrato mantenido explícitamente en documents/openapi.js y validado con swagger-parser en npm test.

Al completar el arranque en desarrollo, npm start imprime la URL de Swagger con el HOST/PORT configurado; no abre el navegador. En producción no anuncia documentación deshabilitada.
