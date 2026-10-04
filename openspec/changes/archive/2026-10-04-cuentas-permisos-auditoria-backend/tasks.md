## 1. Revisar y fijar alcance

- [x] 1.1 Revisar con el usuario matriz de permisos, transporte/duración de sesión, gestión de cuentas, reglas comerciales y exclusiones; ajustar artefactos antes de implementar.
- [x] 1.2 Confirmar base actual y dependencias de frontend; verificar soporte de transacciones Atlas sin alterar ejemplos ni secretos.
- [x] 1.3 Registrar baseline del backend y criterios de transición coordinada; mantener separado el cierre del change visual.

## 2. Correcciones críticas

- [x] 2.1 Implementar límites/formato de clientes y compartir validación con el seed; comprobar entradas válidas, inválidas y compatibilidad de datos existentes.
- [x] 2.2 Publicar campos de validación y traducir errores controlados de JSON y almacenamiento sin revelar secretos; probar 400/413/503.
- [x] 2.3 Validar configuración y manejar fallos de escucha con limpieza de MongoDB; probar puerto inválido y ocupado.
- [x] 2.4 Limitar cierre ordenado, devolver códigos de salida correctos y agregar diagnóstico mínimo seguro; probar señales, timeout y fallo de cierre.

## 3. Cuentas y primer administrador

- [x] 3.1 Crear modelos/DTO e índices únicos de cuentas y documento de control administrativo; probar normalización de email sin imponer unicidad a clientes.
- [x] 3.2 Implementar hash/verificación scrypt y medir costo/memoria/concurrencia local; confirmar perfil antes de integrarlo.
- [x] 3.3 Implementar bootstrap interactivo sin secretos por argumento ni importación de hardcodeados; probar repetición y concurrencia.
- [x] 3.4 Implementar servicios administrativos y la protección transaccional del último administrador; probar dos cambios simultáneos y rechazo de campos ajenos.

## 4. Sesiones y permisos

- [x] 4.1 Implementar sesiones con token opaco/hash, expiración, revocación e índices; verificar que TTL no sea condición de autorización.
- [x] 4.2 Implementar login/me/logout/cambio de contraseña, errores genéricos y limitación de intentos/concurrencia; probar inexistencia, inactividad y expiración.
- [x] 4.3 Implementar autenticación y matriz de permisos en rutas; probar 401/403 y rol/actor falsificados sin ejecutar mutaciones.
- [x] 4.4 Exponer administración de cuentas y revocar sesiones por cambios de rol/estado; verificar respuesta pública sin secretos.

## 5. Historial para administradores

- [x] 5.1 Implementar eventos e índices de auditoría con transacciones de mutaciones y sesiones; probar rollback ante fallo de evento y retry sin duplicación.
- [x] 5.2 Exponer consulta administrativa filtrada y limitada con cursor validado; probar permisos, fechas, orden y ausencia de secretos.
- [x] 5.3 Verificar que historial no tenga endpoints de edición/borrado y que logs técnicos no se expongan como eventos de negocio.

## 6. Verificación e integración

- [x] 6.1 Ejecutar suite backend con cuentas/sesiones/historial controlados, casos adversos y concurrencia; mantener pruebas existentes o justificar adaptaciones del contrato.
- [x] 6.2 Preparar procedimiento HTTP integrado con cuenta/cliente ficticios propios y limpieza; verificar persistencia real sin alterar datos compartidos ni dejar sin administrador.
- [x] 6.3 Documentar contratos para frontend, bootstrap, configuración, límites de seguridad/retención y resultados reales; registrar asistencia de IA y revisión humana.
- [x] 6.4 Registrar pruebas manuales de Swagger/API y frontend confirmadas por el usuario; mantener la sustitución definitiva de cuentas hardcodeadas en el change frontend, sin bypass de backend.
- [x] 6.5 Revisar alcance y validación OpenSpec con el usuario; solicitar por separado autorización de commits/publicación y archivar solo tras cumplimiento verificado.

Evidencia y pendientes: [verification.md](verification.md). La revisión de interacción del bootstrap en terminal y la creación de una cuenta permanente son pasos manuales, sin secretos por defecto.

## 7. Documentación interactiva

- [x] 7.1 Documentar todas las operaciones, esquemas y errores en OpenAPI con Bearer y servidor relativo.
- [x] 7.2 Servir Swagger UI y JSON solo en desarrollo, sin secretos ni autorización persistida.
- [x] 7.3 Verificar contrato, recursos locales y ausencia de rutas en producción; documentar uso.
