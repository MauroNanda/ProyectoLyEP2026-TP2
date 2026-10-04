## Why

Apacheta necesita distinguir a las personas que usan la herramienta de los clientes comerciales. El acceso actual es simulado y los permisos solo se aplican en la interfaz: el servidor no identifica al responsable de una operación ni ofrece trazabilidad para administradores.

## What Changes

- Persistir cuentas internas y sesiones separadas de clientes comerciales; crear el primer administrador mediante un procedimiento local controlado, sin importar contraseñas hardcodeadas.
- Comprobar autenticación y permisos de Administrador, Gerencia y Soporte desde el servidor.
- Permitir al administrador crear, listar, editar datos/rol y activar o desactivar cuentas, conservando al menos un administrador activo.
- Registrar accesos, cierres de sesión y cambios de cuentas/clientes en un historial de solo lectura para administradores.
- Mejorar validaciones comerciales, errores por campo, tratamiento de cuerpos excesivos y arranque/cierre.
- Entregar contratos para un change de frontend posterior, sin implementar pantallas aquí.

## Capabilities

### New Capabilities
- `cuentas-equipo`: cuentas internas, sesiones, administración y permisos.
- `auditoria-operaciones`: historial restringido de accesos y modificaciones.

### Modified Capabilities
- `servicios-clientes`: límites y formato de datos conservando la estructura pública.
- `servidor-rutas-middleware`: protección de rutas, errores ampliados y ciclo de vida robusto.

## Impact

Backend en server/, documentos y pruebas, con MongoDB Atlas existente. Nuevas colecciones usuarios, sesiones y auditoria, más un documento técnico de control para proteger cambios concurrentes de administradores. Las respuestas de éxito de clientes conservan forma e identificadores, pero exigir sesión cambia el contrato de acceso y necesita integración coordinada del frontend.

Excluye edición de clientes, paginación del directorio, duplicados comerciales, sucursales/multitenencia, recuperación por correo, MFA, registro público, métricas, deploy y gestión de compromisos. El historial tendrá consulta limitada.

Propuesta directa del usuario, sin issue nuevo asignado; evolución posterior a los cinco issues académicos. Un único change por etapas en una rama de backend. Ampliaciones posteriores requieren revisar la propuesta o changes independientes. No autoriza implementación, commits ni publicación.
