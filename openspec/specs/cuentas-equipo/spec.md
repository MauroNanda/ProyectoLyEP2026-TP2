# cuentas-equipo Specification

## Purpose

Gestionar las cuentas internas de Apacheta y hacer que el servidor determine identidad, vigencia de sesión y permisos, separando a los integrantes del equipo de los clientes comerciales.

## Requirements

### Requirement: Cuentas internas separadas
El backend SHALL persistir cuentas en una colección distinta de clientes y SHALL publicar solo el DTO Cuenta definido en [diseño del change](../../changes/archive/2026-10-04-cuentas-permisos-auditoria-backend/design.md), sin contraseña, salt ni hash. El email normalizado SHALL ser único entre cuentas. Los roles SHALL ser Administrador, Gerencia y Soporte.

#### Scenario: Crear una cuenta
- **WHEN** un administrador autenticado presenta nombre, email, rol y contraseña válidos
- **THEN** recibe 201 con la cuenta activa y los datos públicos, sin secretos ni un cliente comercial nuevo.

#### Scenario: Cuenta duplicada
- **WHEN** se intenta crear una cuenta con email equivalente a uno existente, incluso concurrentemente
- **THEN** solo una creación puede confirmar y las restantes responden 409.

### Requirement: Bootstrap controlado
El sistema SHALL crear el primer administrador solo mediante un procedimiento local explícito cuando no existen cuentas, sin credenciales por defecto ni importación automática de usuarios del frontend.

#### Scenario: Inicialización concurrente
- **WHEN** dos inicializaciones intentan crear el primer administrador
- **THEN** se confirma solo una y ninguna sobrescribe cuentas o datos existentes.

### Requirement: Autenticación y sesión revocable
El backend SHALL autenticar email y contraseña mediante hash lento con salt individual, entregar un token opaco impredecible y almacenar solo su hash. SHALL verificar expiración absoluta, revocación y cuenta activa en cada solicitud protegida. La duración propuesta SHALL ser 8 horas. SHALL limitar intentos y concurrencia de derivaciones según [diseño del change](../../changes/archive/2026-10-04-cuentas-permisos-auditoria-backend/design.md).

#### Scenario: Inicio correcto
- **WHEN** una cuenta activa ingresa credenciales correctas
- **THEN** obtiene 200 con token, expiresAt y DTO Cuenta, y una sesión registrada sin token en claro en MongoDB.

#### Scenario: Inicio rechazado
- **WHEN** el usuario no existe, está desactivado o la contraseña no coincide
- **THEN** recibe el mismo error público 401, sin revelar cuál condición ocurrió.

#### Scenario: Sesión vencida o revocada
- **WHEN** se presenta un token vencido o revocado, aunque el documento aún exista por demora del TTL
- **THEN** el servidor responde 401 sin ejecutar la operación.

#### Scenario: Límite de intentos
- **WHEN** una IP supera el límite de intentos o se supera la capacidad de derivaciones definida
- **THEN** recibe 429 y Retry-After sin generar una sesión.

### Requirement: Permisos comprobados por servidor
El backend SHALL determinar permisos desde la cuenta autenticada, nunca desde rol o actor suministrado por el navegador. Tres roles SHALL consultar/crear clientes; solo Administrador y Gerencia SHALL eliminarlos; solo Administrador SHALL gestionar cuentas y consultar historial.

#### Scenario: Soporte intenta eliminar
- **WHEN** una sesión de Soporte solicita DELETE de un cliente e intenta declarar rol Administrador en el cuerpo
- **THEN** recibe 403 y el cliente permanece intacto.

#### Scenario: Falta identidad
- **WHEN** se solicita una ruta protegida sin sesión válida
- **THEN** recibe 401 sin invocar el caso de uso de negocio.

### Requirement: Administración de cuentas
El backend SHALL permitir al Administrador listar y crear cuentas y modificar nombre, rol o estado mediante los contratos de [diseño del change](../../changes/archive/2026-10-04-cuentas-permisos-auditoria-backend/design.md). SHALL conservar al menos un administrador activo bajo concurrencia, impedir cambios de campos no autorizados y revocar sesiones tras cambios de rol/estado.

#### Scenario: Administrador modifica una cuenta
- **WHEN** el Administrador cambia nombre, rol o activo con una entrada válida
- **THEN** recibe 200 con DTO actualizado y las sesiones del afectado se revocan si cambió rol o estado.

#### Scenario: Protección del último administrador
- **WHEN** uno o varios cambios concurrentes dejarían sin administradores activos
- **THEN** el sistema impide ese resultado y responde 409 a los cambios incompatibles.

### Requirement: Control de sesión personal
Una cuenta autenticada SHALL consultar su identidad, cerrar su sesión o cambiar su contraseña demostrando la actual; el cambio SHALL revocar todas sus sesiones. No habrá recuperación pública ni cambio de contraseña ajena en este hito.

#### Scenario: Cierre o cambio de contraseña
- **WHEN** la persona cierra la sesión o cambia correctamente su contraseña
- **THEN** recibe 204 y el token afectado no permite una nueva operación; al cambiar contraseña se invalidan todas sus sesiones.
