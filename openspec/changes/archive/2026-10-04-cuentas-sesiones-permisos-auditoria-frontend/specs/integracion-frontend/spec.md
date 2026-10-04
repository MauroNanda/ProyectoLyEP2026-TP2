## MODIFIED Requirements

### Requirement: Consumo parametrizado de la API de clientes
El frontend SHALL realizar todas las operaciones de consulta, creación y eliminación de clientes a través de la URL base provista por `VITE_API_URL`, utilizando `http://localhost:3001/api/clientes` por defecto y sin FakeStoreAPI. SHALL enviar Authorization Bearer de la sesión en memoria y conservar id como cadena. Auth/cuentas/auditoría SHALL usar VITE_API_BASE_URL o la base derivada del sufijo /clientes, exigiendo configuración explícita si no puede derivarse y rechazando orígenes incoherentes.

#### Scenario: Obtención de listado desde el backend propio
- **WHEN** el usuario autenticado navega al listado
- **THEN** solicita GET a la URL configurada con Bearer y renderiza los registros recibidos.

#### Scenario: Consulta de cliente individual por ID
- **WHEN** el usuario autenticado accede a una ficha por ID persistido
- **THEN** solicita GET a `<VITE_API_URL>/<id>` con Bearer y muestra los datos.

#### Scenario: Configuración incompatible
- **WHEN** no puede derivarse la base /api o los orígenes configurados son incoherentes
- **THEN** se informa error de configuración sin enviar el token a otro origen.

### Requirement: Métrica de total de clientes en el Dashboard
El Dashboard SHALL obtener el total mediante el servicio autenticado de clientes para los tres roles, sin FakeStoreAPI ni conteos locales simulados y diferenciando carga, cero real y error. El resumen administrativo SHALL seguir administracion-cuentas-frontend y fallar independientemente del total comercial.

#### Scenario: Conteo de clientes en el panel de control
- **WHEN** Administrador, Gerencia o Soporte accede a Inicio
- **THEN** se consulta la API propia con Bearer y se muestra el total del arreglo recibido.

#### Scenario: Fallo de conectividad en el Dashboard
- **WHEN** falla la consulta comercial
- **THEN** se muestra Total no disponible de forma accesible sin convertirlo en cero ni ocultar la sesión o información autorizada recuperada.

### Requirement: Eliminación de cliente y actualización de estado
El frontend SHALL permitir DELETE al backend propio solo mediante acción confirmada visible para Administrador/Gerencia y SHALL ocultarla para Soporte. SHALL enviar Bearer y esperar confirmación antes de actualizar estado.

#### Scenario: Eliminación confirmada por usuario con permisos
- **WHEN** Administrador o Gerencia confirma baja y el servidor responde 204
- **THEN** se informa éxito y se redirige al listado.

#### Scenario: Rechazo del servidor
- **WHEN** DELETE responde 403
- **THEN** se informa falta de permiso sin simular baja ni cerrar sesión válida.

## ADDED Requirements

### Requirement: Validación comercial y errores por campo
El formulario SHALL conservar el contrato comercial sin password y validar las reglas vigentes del backend: email <=254 con patrón backend; teléfono <=40, patrón permitido y 7–15 dígitos; nombre/ciudad obligatorios <=100 con letra Unicode; username derivado <=100. SHALL contar puntos de código, mapear campos públicos anidados a controles y representar errores generales/desconocidos en resumen accesible. SHALL conservar datos tras rechazo, enfocar primer error y evitar envíos duplicados.

#### Scenario: Error comercial por campo
- **WHEN** POST clientes devuelve error.campos con phone o address.city
- **THEN** se señalan Teléfono o Ciudad con aria-invalid y mensaje asociado, conservando valores.

#### Scenario: Formato inválido local
- **WHEN** el teléfono tiene dígitos insuficientes o la ciudad carece de letras
- **THEN** se muestra el error antes del envío y no se sustituye al servidor como autoridad.
