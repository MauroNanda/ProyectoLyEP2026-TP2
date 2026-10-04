# sesion-frontend Specification

## Purpose
Conectar el acceso y la navegación de Apacheta a sesiones reales del backend, conservando el token solo en memoria y ofreciendo controles personales coherentes con los permisos vigentes.
## Requirements
### Requirement: Circuitos E2E reproducibles
El proyecto SHALL ofrecer npm run test:e2e con Playwright Test como dependencia de desarrollo y cuatro casos independientes: sesión, permisos, gestión/revocación y contraseña. Cada caso SHALL usar cuentas y colecciones temporales aisladas y verificar su limpieza, sin usar cuentas permanentes ni restaurar token desde almacenamiento.

#### Scenario: Ejecución independiente
- **WHEN** se ejecuta un caso E2E
- **THEN** prepara sus propios datos, verifica el circuito en Chromium y elimina únicamente sus colecciones temporales.

### Requirement: Login real sin identidad simulada
El frontend SHALL autenticar mediante POST /api/auth/login con email/password, sin sector ni cuentas hardcodeadas, y SHALL usar token, expiresAt y usuario devueltos por el servidor. SHALL validar contraseñas de 12–128 puntos de código Unicode sin recortarlas ni exigir mayúsculas/números.

#### Scenario: Inicio correcto
- **WHEN** el backend responde 200 a credenciales válidas
- **THEN** se muestra la identidad y el rol retornados y se habilita la navegación permitida.

#### Scenario: Credenciales rechazadas o límite
- **WHEN** login responde 401 o 429
- **THEN** permanece en acceso con mensaje genérico de credenciales o espera según Retry-After, sin crear sesión.

### Requirement: Memoria y finalización de sesión
El cliente SHALL mantener token/identidad solo en memoria, enviar Authorization Bearer en solicitudes protegidas, retirar las claves heredadas admin/role sin borrar datos ajenos y terminar sesión ante expiresAt o 401 NO_AUTENTICADO. SHALL comprobar vencimiento al recuperar foco y descartar respuestas pendientes de sesiones anteriores.

#### Scenario: Recarga y almacenamiento heredado
- **WHEN** se recarga con claves simuladas previas en localStorage
- **THEN** se solicita login y esas claves no restauran acceso ni token.

#### Scenario: Vencimiento o revocación
- **WHEN** vence expiresAt o una ruta protegida rechaza la sesión
- **THEN** se limpia identidad/datos privados y se solicita nuevo login, sin ejecutar nuevos envíos con ese token.

#### Scenario: Respuesta antigua
- **WHEN** una solicitud de una sesión anterior termina después de otro login
- **THEN** no restaura sus datos ni invalida la sesión nueva.

### Requirement: Operaciones personales
Mi cuenta SHALL consultar GET /api/auth/me y permitir PATCH /api/auth/password con actual/nueva; logout SHALL usar POST /api/auth/logout. Cambio exitoso SHALL terminar sesión; logout SHALL limpiar memoria incluso ante fallo remoto, distinguiendo salida local de revocación confirmada.

#### Scenario: Contraseña actual inválida
- **WHEN** PATCH password responde 401 CREDENCIALES_INVALIDAS
- **THEN** se señala actual sin aplicar el cierre global reservado a sesión inválida.

#### Scenario: Cambio confirmado
- **WHEN** PATCH password responde 204
- **THEN** se eliminan secretos y sesión y se comunica la necesidad de nuevo login.

#### Scenario: Logout remoto fallido
- **WHEN** falla la solicitud de logout por red o servidor
- **THEN** se termina el acceso local y se informa que la revocación remota no pudo confirmarse.

### Requirement: Rutas y acciones por rol
El frontend SHALL ofrecer Inicio, clientes, alta y Mi cuenta a los tres roles; baja solo a Administrador/Gerencia; cuentas/historial solo a Administrador. SHALL mostrar rol en lugar de sector y conservar identidad visual, navegación comercial y advertencia de datos pendientes, sin impedir expiración forzada. El backend SHALL seguir siendo autoridad; 403 no SHALL cerrar una sesión válida.

#### Scenario: Acceso administrativo directo sin permiso
- **WHEN** Gerencia o Soporte navega a cuentas/historial
- **THEN** se informa acceso no permitido sin consultar usuarios ni auditoria.

#### Scenario: Baja visible y autoridad remota
- **WHEN** Administrador o Gerencia solicita baja confirmada y el backend responde 403
- **THEN** se muestra el rechazo y no se presenta el cliente como eliminado ni se cierra sesión.
