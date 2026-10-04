## 1. Revisar y fijar alcance

- [x] 1.1 Revisar con el usuario el circuito de sesión, la matriz de permisos, la gestión de cuentas, el historial y las exclusiones; ajustar artefactos antes de implementar.
- [x] 1.2 Confirmar los contratos disponibles de autenticación, cuentas, auditoría y clientes; comprobar configuración de API/CORS y disponibilidad de cuentas activas de prueba, sin repetir el bootstrap ni exponer secretos.
- [x] 1.3 Registrar la base funcional del frontend y los criterios de transición: acceso, navegación, búsqueda, detalle, alta, baja, conteos e identidad visual que deben conservarse.

## 2. Cliente HTTP y sesión

- [x] 2.1 Implementar cliente HTTP común y resolver VITE_API_URL/VITE_API_BASE_URL conforme a design.md; verificar default, prefijo personalizado, URL no derivable y rechazo de origen incoherente.
- [x] 2.2 Sustituir cuentas hardcodeadas y contexto persistido por sesión en memoria; limpiar solo admin/role heredados y centralizar Bearer, expiración y versión de sesión.
- [x] 2.3 Conectar Login sin sector a POST auth/login con validación Unicode y errores 400/401/429, sin políticas antiguas de complejidad.
- [x] 2.4 Implementar me, logout y cambio de contraseña en Mi cuenta, con excepción para CREDENCIALES_INVALIDAS, cierre tras 204 y aviso de revocación no confirmada ante fallo remoto.
- [x] 2.5 Verificar timer/foco/401, limpieza de secretos/datos y respuestas tardías, sin refresh ni reenvío automático de mutaciones.

## 3. Permisos y circuito comercial

- [x] 3.1 Adaptar rutas, Nav, App y encabezados a rol; agregar Cuentas e Historial administrativo solo para Administrador y Mi cuenta para los tres roles; proteger navegación directa sin consultar endpoints no autorizados.
- [x] 3.2 Conectar todos los consumidores comerciales al HTTP autenticado; permitir baja confirmada a Administrador/Gerencia y ocultarla a Soporte, conservando manejo de 403 y ficha/listado/búsqueda/alta.
- [x] 3.3 Alinear FormCliente con límites/patrones vigentes, username derivado y mapeo de error.campos; conservar valores, foco accesible y protección contra envíos duplicados.
- [x] 3.4 Sustituir distribución simulada en Inicio por GET usuarios solo para Administrador y total comercial real para los tres roles; separar carga/vacío/error de cada fuente y preservar datos pendientes.

## 4. Gestión de cuentas

- [x] 4.1 Construir listado y alta en Cuentas con DTO público, roles exactos, estado textual y validaciones/errores por campo.
- [x] 4.2 Incorporar edición de nombre/rol/activo con correo inmutable, PATCH no vacío y confirmación de revocación; tratar duplicado/último admin sin aplicar cambios optimistas.
- [x] 4.3 Refrescar listado y resumen tras éxito; actualizar nombre propio o cerrar sesión tras cambio propio de rol/estado; excluir baja física y reset ajeno.

## 5. Historial administrativo

- [x] 5.1 Construir consulta de solo lectura con tipos vigentes, actorId, fechas con hora convertidas a UTC y limit validado; mostrar datos históricos y actor nulo sin inventar identidad.
- [x] 5.2 Implementar Siguiente/Anterior con cursores opacos y pila, final null, reinicio ante filtros/limit/actualizar y descarte de respuestas anteriores.
- [x] 5.3 Incorporar carga/vacío/error recuperable y mensajes por campo; excluir controles de escritura, exportación y total ficticio.

## 6. Verificación y documentación

- [x] 6.1 Agregar pruebas de comportamiento de sesión/HTTP con transporte y reloj controlados: Bearer en cada servicio, recarga sin sesión, claves heredadas, expiración, logout 204/401/red, cambio password válido/actual inválida, 403 y respuesta tardía tras nueva sesión. Elegir un runner compatible al implementar: client hoy no tiene script test; no imponer checks CI.
- [x] 6.2 Probar matriz de los tres roles y navegación directa, baja comercial, peticiones administrativas ausentes para otros roles, conteos reales y errores independientes; incluir conservación de búsqueda y alta.
- [x] 6.3 Probar cuentas: alta/edición/estado, correo inmutable, duplicado, último administrador, cambio propio y revocación en otra sesión; formularios con Unicode, límites 11/12/128/129, espacios de contraseña y mapeo de campos anidados/comunes.
- [x] 6.4 Probar historial: ocho tipos, actor nulo/inactivo, zona/intervalo, limit 1/100 y fuera de rango, cursor inválido, siguiente/anterior/final, cambio de filtros con respuesta tardía y fallo recuperable.
- [x] 6.5 Ejecutar circuito navegador/API real con cuentas de prueba coordinadas para los tres roles y persistencia Atlas; registrar evidencia diferenciada de los dobles, sin tokens/contraseñas ni mutaciones no coordinadas en datos del equipo.
- [x] 6.6 Ejecutar build/lint del cliente y pruebas backend existentes como regresión; distinguir fallos previos de nuevos. Validar OpenSpec estricto y diff sin errores.
- [x] 6.7 Revisar visualmente escritorio/tablet/móvil y teclado/zoom: identidad, filas/filtros/formularios, estados, foco, contraste y datos extensos. Aplicar craft-floor de Impeccable al implementar y detector una vez sobre los archivos UI cambiados; no acreditar QA visual con solo lectura de CSS.
- [x] 6.8 Documentar configuración, recarga/login, permisos y resultados/limitaciones reales, asistencia de IA y revisión humana. Actualizar PRODUCT/DESIGN solo con comportamiento efectivamente implementado; presentar para revisión sin commit/push/PR automáticos.

Evidencia de cumplimiento y limites de verificacion: [verification.md](verification.md). El usuario confirmo validacion funcional final y autorizo archivar; commits y publicacion requieren autorizacion independiente.

## 7. Mejoras incrementales autorizadas

- [x] 7.1 Organizar cuatro circuitos E2E independientes con Playwright Test instalado en el proyecto y datos temporales aislados.
- [x] 7.2 Aplicar filtros del historial mediante botón y cancelar solicitudes anteriores, conservando cursor y manejo de errores.
- [x] 7.3 Incorporar búsqueda local por nombre/email y filtros por rol/estado en Cuentas, con resultado vacío y limpieza.
- [x] 7.4 Preparar y ejecutar siembra idempotente de cuentas locales de los tres roles mediante la API existente, sin sobrescribir cuentas.
- [x] 7.5 Verificar regresión, E2E y presentación responsive; actualizar documentación y evidencia.
