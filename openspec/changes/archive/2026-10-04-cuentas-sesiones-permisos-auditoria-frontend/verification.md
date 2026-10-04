# Verificación de implementación — 4 de octubre de 2026

Base verificada: main local/remoto 533cdf6, con backend b17d580 integrado mediante #14 y diseño Apacheta mediante #13. Rama creada: feature/mauro-gutierrez-nanda-integracion-cuentas-frontend. El usuario aprobó la propuesta y autorizó implementar. El usuario confirmó la prueba manual y validación final el 4 de octubre de 2026 y autorizó archivar el change. No se crearon commits, push ni PR.

## Base y cambios

El frontend previo autenticaba contra seis cuentas hardcodeadas, restauraba admin desde localStorage, exigía sector y enviaba solicitudes comerciales sin Bearer. Inicio derivaba cuentas del arreglo simulado; baja solo se ofrecía a Gerencia. Lint inicial fallaba en la exportación conjunta del contexto y el import Navigate sin uso.

Ahora: login HTTP sin sector, sesión opaca en memoria, cliente HTTP compartido, limpieza de identidad heredada, vencimiento y revocación, logout remoto/local distinguido, Mi cuenta y password, rutas/permisos por rol, Cuentas, Historial administrativo y conteos reales autorizados. FormCliente alinea límites y campos anidados con el backend. Se conservan filtro q, alta=1, ficha, operaciones comerciales, protección de datos pendientes y diseño Apacheta.

No se modificó server/. El verificador bajo client/scripts consume sus fábricas existentes, sin ampliar rutas ni permisos. No se agregaron dependencias de producto ni CI obligatorio; las pruebas unitarias usan Node nativo y Playwright Test es dependencia de desarrollo para el navegador.

## Resultados ejecutados

- Cliente: npm test, 17/17 aprobadas.
- Cliente: npm run lint y npm run build aprobados. Los dos errores previos quedaron resueltos en los archivos modificados.
- Backend: npm test, 74/74 aprobadas como regresión, sin cambiar sus pruebas.
- OpenSpec: validate cuentas-sesiones-permisos-auditoria-frontend --strict aprobado.
- Git: diff --check aprobado; sin modificaciones en server/.
- Impeccable: detector sobre las nueve superficies/archivos UI cambiados devolvió [].
- Contraste de pares usados: tinta/sendero 13.31, secundario/piedra 6.14, atenuado/sendero 4.94, blanco/arcilla 6.10, arcilla/acento suave 5.01, éxito/sendero 7.01 y peligro/fondo de peligro 6.61.

Las pruebas unitarias verifican Bearer en cada servicio, configuración de URL, memoria y claves heredadas, expiración sin nueva solicitud, excepciones de 401, conservación de sesión ante 403/red, logout confirmado/fallido, password, respuestas tardías tras nuevo login, Retry-After, matriz de roles, límites Unicode, PATCH administrativo, errores anidados y filtros ISO/limit/actorId.

## Navegador y Atlas reales

Se ejecutó client/scripts/verificar-integracion.mjs con Chrome headless y Playwright (inicialmente externo; en la verificación incremental instalado en client/). Inició Vite en 127.0.0.1:5174 y una instancia de la aplicación backend real con repositorio aislado. Usó la conexión de server/.env sin imprimirla, cinco colecciones temporales y contraseñas aleatorias exclusivamente de prueba.

Diez grupos completos, registrados en [resultados.json](evidence/resultados.json):

1. Login real, recarga y limpieza de identidad heredada sin borrar una preferencia ajena.
2. Alta y edición de cuenta, inmutabilidad de correo, activación inicial, desactivación, correo duplicado y último administrador rechazado.
3. Historial real, siguiente/anterior/final, filtros y actor nulo.
4. Layout a 1280×900, 768×1024 y 360×800, teclado y foco; reflow de 640 px equivalente al espacio de 1280 px con zoom 200 %, y preferencia de movimiento reducido.
5. Estados adversos controlados: campos anidados, 403 sin logout, error de cursor conservando la página, 503 de cuentas sin ocultar el total comercial y respuesta tardía de otro filtro descartada.
6. Contraseña actual incorrecta conserva acceso; cambio confirmado revoca todas las sesiones del usuario.
7. Soporte sin peticiones administrativas ni baja; alta comercial real, búsqueda en q y apertura en alta=1.
8. Gerencia elimina con confirmación y no ve administración.
9. Administrador elimina; cambio de estado revoca otra sesión, y una segunda conexión Mongo confirma persistencia.
10. Cambiar el rol del propio Administrador confirma el cambio y termina su acceso.

Cero errores de página en la ejecución completa.

Los casos 400/403/503 y demora del grupo 5 son respuestas controladas mediante rutas de Playwright, para probar el comportamiento de la interfaz. No acreditan un fallo real de Atlas. Las demás operaciones usan autenticación, servicios, HTTP y transacciones reales del backend. El vencimiento temporal y algunos errores 429/red se prueban con reloj/transporte controlados en la suite nativa, sin esperar ocho horas.

## Aislamiento y limpieza

No se usaron ni modificaron usuarios, clientes o ejemplos del equipo. Cada ejecución creó exclusivamente cinco colecciones apacheta_frontend_verificacion_<UUID>_<recurso>. Bootstrap solo se ejecutó contra esas colecciones aisladas. El cierre elimina los cinco nombres exactos y consulta individualmente su ausencia; la ejecución final confirmó cero residuos de ese conjunto. Nunca se borró la base ni se consultó un prefijo arbitrario para eliminar colecciones.

Durante el desarrollo se corrigió un desbordamiento de la navegación administrativa móvil y se adaptaron las filas de cuentas para mantener visibles datos y acciones. También se ajustó la comprobación final de ausencia al filtro por nombre admitido por Atlas, y los selectores/esperas del verificador a los textos y cargas reales. Las ejecuciones completas finales aprobaron todos los casos; los diagnósticos transitorios se retiraron.

## Evidencia visual y límites

Capturas de datos ficticios de una ejecución real aislada; IDs de auditoría pertenecen a esa ejecución temporal, no a cuentas del equipo:

- [Cuentas escritorio](evidence/desktop-cuentas.png), [tablet](evidence/tablet-cuentas.png), [móvil](evidence/mobile-cuentas.png).
- [Historial escritorio](evidence/desktop-historial.png), [tablet](evidence/tablet-historial.png), [móvil](evidence/mobile-historial.png).
- [Mi cuenta escritorio](evidence/desktop-mi-cuenta.png), [tablet](evidence/tablet-mi-cuenta.png), [móvil](evidence/mobile-mi-cuenta.png).

Se revisaron capturas y layout sin desbordamiento global, navegación y campos por teclado, foco visible, mensajes y pares de contraste. El reflow equivalente no es una prueba del control de zoom nativo de todos los navegadores. No se declara conformidad WCAG completa ni revisión exhaustiva con lector de pantalla.

Las suites automatizadas no acceden con cuentas permanentes del equipo. La siembra incremental posterior usa el Administrador proporcionado explícitamente y se registra debajo. El usuario confirmó su validación funcional final; los tokens y las credenciales administrativas no se necesitan en este documento.

## Mejora del arranque local

Mejoras incrementales autorizadas y ejecutadas el 2026-10-04:

- Playwright Test instalado y cuatro E2E independientes aprobados (sesión, permisos de Gerencia/Soporte, búsqueda/alta/desactivación/revocación y contraseña). Cada prueba prepara cinco colecciones temporales y comprueba su eliminación; Chrome/Chromium, un worker, sin reintentos. Trazas de fallos locales ignoradas por Git.
- Historial conserva resultados al editar y aplica filtros mediante Actualizar historial; AbortController cancela consultas reemplazadas y el desmontaje, manteniendo el descarte por secuencia. Verificador amplio actualizado al nuevo circuito y a comprobar ausencia de consultas intermedias.
- Cuentas combina búsqueda por nombre/email, rol y estado sin nuevas solicitudes. E2E comprueba combinación, vacío filtrado y limpieza. Capturas renovadas; revisadas Cuentas móvil e Historial escritorio, sin desbordamiento en los tres tamaños verificados.
- Siembra ejecutada mediante la API local con autorización explícita: administrador@example.test, gerencia@example.test y soporte@example.test activas con sus respectivos roles. Contraseña de demostración igual al email, según decisión del usuario. Login y logout confirmados para cada cuenta. Segunda siembra omitió las tres sin modificar datos; no se repitió bootstrap. Credenciales administrativas usadas solo en entorno del proceso, sin guardarlas en archivos versionados.
- Suite nativa 17/17, lint y build aprobados. El verificador amplio vuelve a comprobar diez grupos reales/controlados y limpieza exacta. El backend conserva sus endpoints y políticas; ninguna implementación en server/ fue modificada.

El script `dev` incorpora `vite --port 5173 --strictPort`, por lo que basta ejecutar `npm run dev` desde `client/`. Se verificó el arranque de Vite en http://localhost:5173 y luego se detuvo el proceso de prueba. Los README del cliente y del repositorio reflejan el comando abreviado. El puerto fijo coincide con el origen CORS predeterminado del backend; si está ocupado, el arranque termina en lugar de cambiar silenciosamente de puerto.

## Asistencia de IA

Codex produjo planificación, implementación React/JavaScript, pruebas y documentación. Se aplicaron openspec-explore, openspec-propose, openspec-update-change y openspec-apply-change; para el frontend, interface-design, impeccable y web-development. La organización separada de Cuentas/Historial/Mi cuenta fue confirmada por el usuario. La propuesta fue revisada y la implementación autorizada; el usuario confirmó que probó el circuito y que todo está validado. Esto acredita aceptación funcional, sin afirmar auditoría exhaustiva de código o WCAG.

Uso y comandos reproducibles en [client/README.md](../../../../client/README.md).
