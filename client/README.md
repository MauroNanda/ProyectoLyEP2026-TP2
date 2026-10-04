# Apacheta — frontend

React/Vite para clientes comerciales, cuentas internas y auditoría administrativa. Consume el backend existente de `server/`, con MongoDB Atlas. El login no contiene cuentas ni contraseñas hardcodeadas; el script local de siembra crea datos de demostración mediante la API.

## Ejecución local

Requiere Node 24+ y el backend configurado según [seguridad.md](../server/documents/seguridad.md). Desde `server/`, instalar dependencias y ejecutar `npm start`. El equipo debe tener una cuenta activa; el bootstrap del primer administrador se coordina una sola vez en una base sin cuentas.

Desde `client/`:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Abrir http://localhost:5173 y usar el email/contraseña de una cuenta real. El backend determina el rol; no hay selector de sector. Su CORS_ORIGIN debe coincidir con el origen del frontend.

El script dev fija el puerto 5173 y usa strictPort: si está ocupado, Vite informa el error y termina en lugar de cambiar a otro puerto. Así se mantiene el origen previsto por CORS del backend. No hace falta escribir esos argumentos al iniciar.

## URLs de API

`VITE_API_URL` sigue siendo la URL completa de clientes (default `http://localhost:3001/api/clientes`). `VITE_API_BASE_URL` configura la base de auth, cuentas y auditoría. Si falta, se deriva quitando el sufijo `/clientes` de VITE_API_URL; funciona con prefijos personalizados. Si la URL comercial no tiene ese sufijo, indicar explícitamente la base.

Ambas URLs deben ser HTTP/HTTPS absolutas del mismo origen, sin usuario/contraseña, query ni fragmentos. Ejemplo sin secretos:

```env
VITE_API_URL=http://localhost:3001/api/clientes
VITE_API_BASE_URL=http://localhost:3001/api
```

No usar estas variables para secretos: Vite las publica en el cliente. Reiniciar Vite tras cambiar configuración.

## Sesión y permisos

Token opaco exclusivamente en memoria, enviado mediante Authorization Bearer. Recargar solicita login; no se restaura identidad desde localStorage ni sessionStorage. Solo se retiran las claves antiguas admin/role. Expiración y revocación limpian los datos privados. Logout siempre termina el acceso local; si falla la red, informa que no pudo confirmar revocación remota.

Los tres roles consultan/crean clientes y usan Mi cuenta. Administrador y Gerencia eliminan clientes con confirmación. Solo Administrador ve Cuentas e Historial administrativo y su resumen real de cuentas en Inicio. El backend valida cada petición.

Cuentas permite alta activa y editar nombre/rol/estado; el email es inmutable. Cambiar rol/estado revoca sesiones; no se permite dejar sin administrador activo. No hay baja física, reset ajeno, recuperación ni registro público. Cambiar contraseña desde Mi cuenta exige la actual y cierra todas las sesiones. Se admiten 12–128 caracteres Unicode sin recorte ni requisitos inventados de complejidad.

Historial es de solo lectura: tipo, cuenta, fechas con hora en la zona indicada y límite 1–100. Editar filtros no consulta; Actualizar historial los aplica juntos y reinicia el cursor. Limpiar filtros aplica los valores iniciales. Se cancelan solicitudes anteriores al reemplazar la consulta. Siguiente/Anterior usan cursor opaco, sin totales ficticios. Los eventos conservan actorId y rol histórico; un nombre actual solo es ayuda.

Cuentas permite buscar por nombre/email y combinar rol/estado sobre el listado recibido, sin nuevas solicitudes; muestra cantidad visible y permite limpiar filtros.

Se conservan listado, búsqueda por apellido/ciudad (q), alta (alta=1), ficha, confirmación de baja, advertencia de datos pendientes y estilo Apacheta.

## Verificación

```powershell
npm test
npm run build
npm run lint
```

Las pruebas nativas de Node no requieren Atlas ni cuentas del equipo. Cubren transporte, sesión, permisos, validación, errores y filtros. Regresión backend: `npm test` desde server/.

E2E reproducibles de navegador + API real + Atlas:

```powershell
npm run test:e2e
```

Requiere instalar dependencias de client/ y server/, Chrome y configurar server/.env para Atlas. Son cuatro casos independientes: sesión, permisos, cuentas/revocación y contraseña. Cada caso crea y elimina cinco colecciones propias `apacheta_frontend_e2e_<UUID>_<recurso>`; nunca usa las cuentas permanentes. Vite usa 127.0.0.1:5175. Las trazas de fallos quedan en test-results/ (ignorado por Git); contienen datos de prueba y deben mantenerse locales. Playwright Test es dependencia de desarrollo, sin impacto en el bundle.

Verificación adicional amplia, con responsive y estados adversos:

```powershell
# Opcional si Chrome no está en su ubicación habitual:
$env:BROWSER_EXECUTABLE = '<ruta absoluta al ejecutable del navegador>'
npm run verificar:integracion
```

Usa Playwright instalado con npm ci, Chrome, server/.env y permisos de Atlas para índices/transacciones y eliminación de las colecciones propias. El script inicia una API aislada y Vite en 127.0.0.1:5174; no usar ese puerto para otro proceso durante la prueba.

Crea cinco colecciones `apacheta_frontend_verificacion_<UUID>_<recurso>`, con cuentas y contraseñas aleatorias temporales; no usa las cuentas ni clientes del equipo. El bootstrap es exclusivamente de ese repositorio aislado. Al finalizar elimina únicamente esos cinco nombres y comprueba ausencia. Si se interrumpe abruptamente, revisar exclusivamente el prefijo exacto de esa ejecución, sin borrar la base ni colecciones compartidas. Un fallo de permisos no autoriza bajar controles.

Guarda resultados públicos y capturas en el [change OpenSpec](../openspec/changes/archive/2026-10-04-cuentas-sesiones-permisos-auditoria-frontend/verification.md). Distingue operaciones reales de respuestas adversas controladas en navegador. Los datos/IDs de capturas son ficticios temporales y no representan cuentas del equipo.

## Cuentas locales de demostración

Con el backend iniciado, configurar SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD en el entorno de la terminal o en server/.env local, y ejecutar desde client/:

```powershell
npm run seed:cuentas
```

Usa la API en http://localhost:3001/api (SEED_API_BASE_URL permite cambiarla), requiere un Administrador activo y cierra su sesión al finalizar. Crea administrador@example.test, gerencia@example.test y soporte@example.test con sus roles respectivos. Por decisión del usuario, cada correo es también su contraseña de demostración. Si el email ya existe, lo omite: no cambia contraseña, rol ni estado. Son datos de prueba reales del backend local configurado, separados de las colecciones temporales E2E. No hay bootstrap ni autenticación simulada; las credenciales administrativas no se versionan.

## Procedencia y asistencia

La integración comercial anterior se conserva; su historia está en el change archivado integracion-frontend-verificacion. Codex asistió en esta integración de sesión, pantallas, pruebas y documentación. El usuario revisó/aprobó la propuesta y autorizó implementar. El usuario confirmó su prueba manual y validación funcional final; resultados ejecutados y límites se registran en verification.md. No se crearon commits ni publicación automáticamente.
