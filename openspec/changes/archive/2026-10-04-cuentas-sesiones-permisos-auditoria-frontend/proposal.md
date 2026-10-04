## Why

El backend de Apacheta ya exige sesiones y permisos reales, mientras el frontend conserva cuentas hardcodeadas, identidad persistida y solicitudes sin Bearer. Integrar ambos circuitos permitirá conservar las operaciones comerciales y ofrecer administración de cuentas e historial con la autoridad del servidor.

## What Changes

- **BREAKING**: retirar cuentas/contraseñas simuladas, selector de sector y restauración de identidad desde localStorage; recargar requerirá login.
- Conectar login, identidad, logout y cambio de contraseña a `/api/auth`; token exclusivamente en memoria, Bearer en todas las solicitudes protegidas y tratamiento de expiración/revocación.
- Adaptar rutas, navegación y acciones a Administrador, Gerencia y Soporte, sin sustituir los controles del backend.
- Agregar Cuentas e Historial administrativo como secciones separadas solo para Administrador; Mi cuenta para los tres roles, conforme a la preferencia confirmada por el usuario.
- Gestionar listado, alta, nombre/rol y activación/desactivación de cuentas; consultar historial de solo lectura con filtros y cursor.
- Sustituir conteos simulados por datos consultables según el rol y alinear validaciones y errores por campo con el backend vigente.
- Preservar identidad Apacheta, búsqueda, listado, ficha, alta, baja autorizada y tratamiento de datos sin guardar.

## Capabilities

### New Capabilities
- `sesion-frontend`: autenticación real, memoria, ciclo de sesión, navegación y permisos visibles.
- `administracion-cuentas-frontend`: gestión administrativa y resumen real de cuentas.
- `historial-administrativo-frontend`: consulta administrativa filtrada y paginación por cursor.

### Modified Capabilities
- `integracion-frontend`: solicitudes comerciales autenticadas, validaciones y total de clientes para los tres roles.

## Impact

Principalmente `client/src/services`, contexto/hooks, rutas, App, navegación, páginas y formularios; estilos existentes y documentación/configuración de URL del cliente. Sin ampliación de server/, cambios en Atlas ni framework visual nuevo. Los contratos de cuentas y auditoría del servidor permanecen intactos.

Solicitud directa del usuario «TP2 CLIENTE». El usuario revisó la propuesta y autorizó implementar el 4 de octubre de 2026. El usuario autorizó archivar tras confirmar validación funcional final. Commits, push y PR permanecen sin autorización.

Dependencia verificada el 2026-10-04: main local y remoto `533cdf6` contienen el merge #14 del backend `b17d580`; identidad visual integrada mediante #13 `550d861`. El change visual sigue activo (15/16 tareas), por lo que no se lo archiva ni se reescribe. ROADMAP, config y seguridad.md contienen referencias históricas que no prueban ausencia del backend.

Rama de implementación: `feature/mauro-gutierrez-nanda-integracion-cuentas-frontend`, creada desde main 533cdf6 tras volver a verificar el remoto y la ascendencia del backend, conservando la planificación sin commit. No fue necesario merge/cherry-pick adicional. El circuito API/Atlas se comprobó con cuentas activas temporales aisladas; ver verification.md. Para otra base sin backend, resolver primero su integración autorizada, sin copiar server/ ni desactivar autenticación.

Exclusiones: recuperación/reset administrativo de contraseña, registro público, refresh, token persistente, backend adicional, edición de clientes, paginación comercial, métricas nuevas, compromisos, alertas, ERP, deploy y checks obligatorios de frontend. No commits, push ni PR sin autorización explícita.

Mejoras incrementales autorizadas: suite E2E pequeña reproducible, aplicación explícita y cancelación de filtros del historial, búsqueda/filtros locales de cuentas y siembra de cuentas locales mediante contratos existentes. Sin cambios en permisos ni endpoints del backend.
