## 1. Revisar y fijar alcance

- [ ] 1.1 Revisar con el usuario matriz de permisos, transporte/duración de sesión, gestión de cuentas, reglas comerciales y exclusiones; ajustar artefactos antes de implementar.
- [ ] 1.2 Confirmar base actual y dependencias de frontend; verificar soporte de transacciones Atlas sin alterar ejemplos ni secretos.
- [ ] 1.3 Registrar baseline del backend y criterios de transición coordinada; mantener separado el cierre del change visual.

## 2. Correcciones críticas

- [ ] 2.1 Implementar límites/formato de clientes y compartir validación con el seed; comprobar entradas válidas, inválidas y compatibilidad de datos existentes.
- [ ] 2.2 Publicar campos de validación y traducir errores controlados de JSON y almacenamiento sin revelar secretos; probar 400/413/503.
- [ ] 2.3 Validar configuración y manejar fallos de escucha con limpieza de MongoDB; probar puerto inválido y ocupado.
- [ ] 2.4 Limitar cierre ordenado, devolver códigos de salida correctos y agregar diagnóstico mínimo seguro; probar señales, timeout y fallo de cierre.

## 3. Cuentas y primer administrador

- [ ] 3.1 Crear modelos/DTO e índices únicos de cuentas y documento de control administrativo; probar normalización de email sin imponer unicidad a clientes.
- [ ] 3.2 Implementar hash/verificación scrypt y medir costo/memoria/concurrencia local; confirmar perfil antes de integrarlo.
- [ ] 3.3 Implementar bootstrap interactivo sin secretos por argumento ni importación de hardcodeados; probar repetición y concurrencia.
- [ ] 3.4 Implementar servicios administrativos y la protección transaccional del último administrador; probar dos cambios simultáneos y rechazo de campos ajenos.

## 4. Sesiones y permisos

- [ ] 4.1 Implementar sesiones con token opaco/hash, expiración, revocación e índices; verificar que TTL no sea condición de autorización.
- [ ] 4.2 Implementar login/me/logout/cambio de contraseña, errores genéricos y limitación de intentos/concurrencia; probar inexistencia, inactividad y expiración.
- [ ] 4.3 Implementar autenticación y matriz de permisos en rutas; probar 401/403 y rol/actor falsificados sin ejecutar mutaciones.
- [ ] 4.4 Exponer administración de cuentas y revocar sesiones por cambios de rol/estado; verificar respuesta pública sin secretos.

## 5. Historial para administradores

- [ ] 5.1 Implementar eventos e índices de auditoría con transacciones de mutaciones y sesiones; probar rollback ante fallo de evento y retry sin duplicación.
- [ ] 5.2 Exponer consulta administrativa filtrada y limitada con cursor validado; probar permisos, fechas, orden y ausencia de secretos.
- [ ] 5.3 Verificar que historial no tenga endpoints de edición/borrado y que logs técnicos no se expongan como eventos de negocio.

## 6. Verificación e integración

- [ ] 6.1 Ejecutar suite backend con cuentas/sesiones/historial controlados, casos adversos y concurrencia; mantener pruebas existentes o justificar adaptaciones del contrato.
- [ ] 6.2 Preparar procedimiento HTTP integrado con cuenta/cliente ficticios propios y limpieza; verificar persistencia real sin alterar datos compartidos ni dejar sin administrador.
- [ ] 6.3 Documentar contratos para frontend, bootstrap, configuración, límites de seguridad/retención y resultados reales; registrar asistencia de IA y revisión humana.
- [ ] 6.4 Coordinar prueba con el change frontend antes de integrar protección en main; no dejar bypass de autenticación ni cliente hardcodeado como integración final.
- [ ] 6.5 Revisar alcance y validación OpenSpec con el usuario; solicitar por separado autorización de commits/publicación y archivar solo tras cumplimiento verificado.
