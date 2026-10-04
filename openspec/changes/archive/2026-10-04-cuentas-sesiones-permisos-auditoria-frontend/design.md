## Context

Ver proposal.md para motivación y evidencia Git. Base de la propuesta: main local/remoto 533cdf6; árbol inicialmente limpio. Se leyeron ROADMAP, specs vigentes, artefactos del backend archivado y seguridad.md, contrastados con services/seguridad.js y services/validacion.js. En la fase de propuesta solo se verificó el código integrado, sin iniciar la API ni leer server/.env. Tras la autorización de implementación se comprobó API y Atlas mediante colecciones temporales aisladas; resultados y límites en verification.md.

Circuito actual: Login compara seis cuentas locales y exige sector; AutorizacionesContext restaura `admin` de localStorage (incluye datos de la cuenta simulada); RutaProtegida solo comprueba su existencia. clientesService usa Axios sin Bearer; Dashboard consulta clientes y cuenta usuarios locales; DetalleCliente ofrece baja solo a Gerencia. App, Nav y Dashboard leen sector. El login actual no acredita acceso a la API protegida.

Ramas relacionadas: backend b17d580 integrado en #14; identidad 7681cd7 integrada en #13; integración comercial 81d9319 integrada en #12. No aparece rama remota de esta nueva tarea. El change visual activo tiene 15/16 tareas pese a estar integrado: preservar sus artefactos y evitar otro rediseño. La spec visual permanece en ese change, no en specs vigentes. Las ocho specs vigentes del backend/comercio se conservan salvo el delta de integración frontend.

## Goals / Non-Goals

Integrar los contratos existentes y evitar identidad simulada o cachés visibles tras una sesión terminada. Separar cuentas del directorio comercial y auditoría administrativa del historial comercial futuro. No modificar contratos del servidor, incorporar permisos inventados ni declarar pruebas reales no ejecutadas.

## Decisions

### Acuerdos y arquitectura propuesta

El usuario confirmó secciones separadas Cuentas e Historial administrativo, exclusivas de Administrador, y Mi cuenta para todos. Las decisiones de memoria, roles y exclusiones vienen del alcance solicitado. Los detalles siguientes son propuesta técnica para revisión.

Un proveedor de sesión mantendrá `{token,expiresAt,usuario}` únicamente en memoria y expondrá acciones de sesión y capacidades derivadas de `usuario.rol`. Un cliente HTTP compartido inyectará Bearer para auth protegida, clientes, cuentas e historial, evitando duplicación en páginas. Login público no enviará una sesión vieja. El token opaco no se interpreta como JWT. No se usará localStorage, sessionStorage, IndexedDB, URL ni cookies para persistir sesión; limpiar solo claves heredadas `admin` y `role`, sin borrar almacenamiento ajeno.

Conservar `VITE_API_URL` como URL completa de clientes y su default actual. Proponer `VITE_API_BASE_URL` para `/api` de auth/usuarios/auditoria: si está ausente, derivarla de VITE_API_URL solo cuando termina en `/clientes`; si una URL personalizada no permite derivación, exigir configuración explícita y mostrar error de configuración. No redefinir silenciosamente VITE_API_URL ni enviar tokens a orígenes distintos por una configuración accidental. Documentar y comprobar coherencia de origen/base, incluidos prefijos personalizados; sin cambiar CORS del backend.

### Ciclo de sesión y errores

POST login envía `{email,password}` y usa el rol devuelto. GET me verifica identidad al entrar a Mi cuenta y al recuperar foco con sesión en memoria; no crea sesión tras recargar. Programar expiración con expiresAt y volver a comprobarla al recuperar foco/antes de solicitar (pestañas suspendidas). No refresh ni login automático.

401 en recurso protegido termina sesión y limpia datos/cachés; 403 informa falta de permiso sin cerrar sesión. Excepciones: 401 del login es credencial inválida; 401 `CREDENCIALES_INVALIDAS` del cambio de contraseña señala `actual`, conserva sesión/formulario, y permite verificar me si hubo cambio concurrente; 401 `NO_AUTENTICADO` sí termina sesión. No reintentar automáticamente mutaciones. Cancelar/ignorar respuestas pendientes con versión de sesión para que una respuesta tardía no restaure datos ni cierre una sesión nueva.

Logout confirma descarte cuando corresponda, bloquea nuevos envíos y hace POST con el token capturado; limpia memoria y datos siempre. 204 acredita revocación, 401 indica sesión ya inválida; ante fallo de red/500/503 informar que la salida local ocurrió y no pudo confirmarse la revocación remota. No afirmar cierre remoto ni conservar token para retry oculto. PATCH password exitoso (204) limpia secretos y sesión, informa que todas las sesiones fueron revocadas y pide nuevo login. Si Administrador cambia su propio rol/estado, el 200 confirma el cambio y después se termina su sesión; cambiar solo nombre refresca identidad sin cerrarla.

### Navegación y permisos visibles

| Ruta/acción | Administrador | Gerencia | Soporte |
|---|---|---|---|
| Inicio, clientes, ficha y alta | Sí | Sí | Sí |
| Baja con confirmación | Sí | Sí | No |
| /mi-cuenta, password, logout | Sí | Sí | Sí |
| /cuentas, /historial-administrativo | Sí | No | No |

Rutas privadas redirigen a login sin sesión; rutas administrativas directas muestran acceso no permitido a otros roles sin consultar esos endpoints. Navegación y encabezados muestran Rol, sustituyendo Sector. El backend continúa comprobando cada solicitud y puede rechazar aunque un control esté visible. Conservar búsqueda q, alta=1, ficha por id y advertencia de datos pendientes; expiración forzada no se bloquea por dicha advertencia. No almacenar borradores con contraseñas.

### Cuentas y resumen

GET usuarios devuelve arreglo completo; listado con nombre, correo, rol y estado textual, búsqueda local opcional sin API nueva. Alta usa `{nombre,email,rol,password}` y crea activa. Edición usa PATCH no vacío solo con campos cambiados de `{nombre,rol,activo}`; correo de solo lectura, sin contraseña administrativa, borrar ni reset. Confirmar cambios de rol/estado indicando revocación; servidor resuelve 409 ULTIMO_ADMINISTRADOR y duplicado, sin protección basada solo en conteos locales. Refrescar cuentas tras éxito y no aplicar cambios optimistas como confirmados.

Inicio cuenta clientes mediante GET clientes para los tres roles. Solo Administrador consulta GET usuarios para distribuir cuentas por rol y distinguir activas/inactivas, con etiquetas explícitas; Gerencia/Soporte ven su sesión y el total comercial, sin petición usuarios/auditoria ni cifras falsas. Carga/error no equivale a cero y las dos fuentes fallan de forma independiente.

### Historial de solo lectura

Filtros tipo (ocho tipos de seguridad.md), actorId, desde/hasta y limit (50 inicial, 1–100). Selector de actor basado en cuentas autorizadas, conservando id para eventos de cuentas inactivas; actor nulo se muestra «Sin actor identificado», sin inventar correo. Mostrar fecha localizada con zona explícita, tipo, actorId/rol histórico, recurso/recursoId, resultado, requestId y camposModificados disponibles. Nombres actuales pueden ser ayuda, nunca reemplazar rol histórico.

Enviar fechas elegidas con hora convertidas a ISO UTC y comprobar desde <= hasta. Cursor opaco, jamás decodificado/modificado; botón «Siguiente» y pila de cursores para «Anterior», sin páginas numeradas ni total inventado. Editar filtros no consulta: Actualizar historial valida y aplica el borrador y reinicia pila; cancelar la petición previa con AbortController al aplicar, paginar o desmontar. Limpiar filtros aplica valores iniciales; nextCursor null finaliza. Mantener página ante error recuperable y descartar respuestas de filtros anteriores. Actualizar reinicia primera página; no prometer snapshot ante nuevas inserciones.

### Validación y presentación

Fuente: server/services/validacion.js, no la política antigua de Login. Contar puntos de código (`[...valor].length`): password/actual/nueva 12–128, sin trim, normalización ni requisito de mayúsculas/números; confirmación local de nueva contraseña no se envía. Nombre cuenta obligatorio, recortado, <=100 y con letra Unicode; email recortado <=254, patrón backend y normalizado para cuentas; rol exacto y activo booleano.

Formulario comercial conserva su estructura: email <=254; phone <=40, patrón `^\+?[\d ()-]+$`, 7–15 dígitos; firstname/city obligatorios <=100 con letra Unicode, lastname <=100, username <=100, street <=200, number <=30, zipcode <=20 cuando presentes. No añadir campos comerciales: validar los expuestos y el username derivado; mapear `name.firstname`→nombre, `phone`→telefono, `address.city`→ciudad. `error.campos` es arreglo de nombres, no mensajes por campo: asignar texto seguro; campos generales/desconocidos al resumen. 409 email duplicado se asocia al email; último admin a rol/estado y resumen. 404, 413, 429 (Retry-After), 500, 503 y red reciben mensajes diferenciados y recuperables; no exponer trazas ni secretos.

Preservar DESIGN.md, tokens de app.css, símbolo de piedras, Lora en marca y Source Sans 3 en operación. Skills interface-design e impeccable aplicadas en planificación; modo Operate. Cuentas prioriza listado/alta, historial prioriza filtros/resultados y Mi cuenta la operación personal. Reutilizar filas, botones, mensajes y formularios del directorio; pantallas angostas apilan campos/filtros y mantienen todas las acciones. Etiquetas, aria-invalid/describedby, foco al primer error, anuncios de carga/resultado, teclado, contraste y zoom. No nuevos KPI decorativos ni cambios de identidad. No actualizar PRODUCT/DESIGN como si la propuesta ya estuviera implementada.

## Risks / Trade-offs

- Recargar pierde sesión y borrador → comunicarlo y preservar advertencia existente, sin persistir secretos.
- Backend integrado pero frontend comercial hoy incompatible → entregar y comprobar el circuito completo antes de publicar la futura implementación; no fallback simulado.
- Rol revocado mientras la UI conserva identidad → me al recuperar foco y 401 del servidor; ignorar respuestas de sesión anterior.
- Logout sin red no acredita revocación → salida local garantizada con aviso explícito.
- Listados completos para conteos → reutilizar respuestas; sin endpoints de métricas o paginación fuera de alcance.
- Documentación histórica contradictoria → registrar hechos Git actuales aquí; no editar changes ajenos como efecto lateral.

## Migration Plan

Antes de crear la rama propuesta, verificar main remoto y ascendencia de b17d580, actualizar la base preservando los nuevos artefactos sin commit automático. No hace falta merge/cherry-pick del backend en este checkout. En bases sin esa ascendencia, resolver integración autorizada primero o acordar rama dependiente.

Tras aprobación de implementación, verificar Node/dependencias y API local con CORS/configuración Atlas existentes; usar cuenta activa provista por el equipo, sin bootstrap repetido ni lectura/publicación de secretos. Implementar integración y pantallas, retirar claves simuladas y documentar recarga/login. Si falla aceptación, mantener la implementación sin publicar hasta corregir; volver al login simulado no restaura acceso al backend protegido. Publicación futura queda sujeta a autorización independiente.

## Open Questions

Sin decisiones técnicas pendientes para implementar este alcance. La API y las cuentas temporales de prueba se verificaron en un circuito real aislado; el usuario confirmó validación funcional final y autorizó archivar; se registra en verification.md.

## Mejoras incrementales de verificación y datos locales

Playwright Test como dependencia dev, Chromium, cuatro pruebas independientes con preparación y limpieza de cinco colecciones temporales propias por prueba. El verificador amplio se conserva como comprobación adicional. Las pruebas no usan cuentas permanentes ni persistencia de token. Script local de siembra usa login/listado/alta/logout existentes; omite emails existentes y no resetea claves, roles o estado. Credenciales administrativas solo por entorno local; contraseñas de cuentas de demostración iguales a sus emails conforme a la decisión del usuario, sin fallback en la aplicación.
