# Tasks

## 1. Preparación y contratos

- [x] 1.1 Revisar issue #5, roadmap, configuración, ramas y servicios actuales; verificar que no existe un controlador o change que se solape.
- [x] 1.2 Documentar el diseño autorizado, exportaciones y propagación por `next(error)` en proposal, design y spec; revisar que no se asigna ni implementa trabajo de #6.

## 2. Pruebas e implementación

- [ ] 2.1 Crear `server/test/controladores.test.js` antes de implementar y ejecutar `node --test test/controladores.test.js`; comprobar el fallo esperado por controlador ausente.
- [ ] 2.2 Crear `server/controllers/clientes.js` con fábrica y cuatro exportaciones; verificar respuestas 200/200/201/204, argumentos y listado vacío mediante las pruebas nuevas.
- [ ] 2.3 Verificar espera de promesas, fallos síncronos y asíncronos, una sola entrega a `next` y ausencia de respuesta propia ante fallos con las pruebas nuevas.
- [ ] 2.4 Comprobar con servicios reales y modelo controlado entradas inválidas, inexistencia y exclusión de campos internos; ejecutar las pruebas sin Atlas.

## 3. Documentación y verificación local

- [ ] 3.1 Crear `server/documents/controladores.md` y enlazarlo desde `server/README.md`; registrar contrato con #6, comandos, resultados reales y límites de las pruebas.
- [ ] 3.2 Ejecutar toda la suite con Node >=24, comprobación de sintaxis y `openspec validate controladores-clientes --strict`; registrar salidas y confirmar ausencia de fallos nuevos.
- [ ] 3.3 Revisar diff y archivos nuevos contra el issue; verificar que `client/`, servicios, modelos, conexión y dependencias no cambian y que no se crean commits ni staging.
- [ ] 3.4 Entregar guía para revisión y dos commits semánticos a cargo del usuario, sin coautoría, con declaración factual de IA y pendientes para su PR.

## 4. Integración externa pendiente

- [ ] 4.1 Cuando #6 esté disponible, revisar con su responsable el contrato y comprobar respuestas HTTP reales, 400/404/500 seguros y DELETE sin cuerpo; requiere servidor integrado y evidencia de esas solicitudes.

El change queda activo: la tarea 4.1 no se acredita con dobles de solicitud/respuesta. Archivar, publicar, crear commits y cerrar el issue quedan fuera de esta ejecución.
