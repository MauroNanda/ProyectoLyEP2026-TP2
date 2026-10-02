# Controladores de clientes

Contribución del issue [#5](https://github.com/MauroNanda/ProyectoLyEP2026-TP2/issues/5), responsable Gabriel Calisaya. Change activo: `controladores-clientes`. JavaScript ESM, sin dependencias nuevas ni modificaciones del frontend.

## Operaciones y respuestas

`controllers/clientes.js` exporta cuatro funciones asíncronas con firma `(req, res, next)`, listas para consumir desde el módulo de rutas del issue #6:

| Solicitud prevista | Exportación | Argumento al servicio | Éxito |
|---|---|---|---|
| GET /api/clientes | listarClientes | Sin argumentos | 200 y arreglo JSON, incluido [] |
| GET /api/clientes/:id | obtenerClientePorId | req.params.id, sin conversión | 200 y cliente JSON |
| POST /api/clientes | crearCliente | req.body | 201 y cliente JSON con id generado |
| DELETE /api/clientes/:id | eliminarCliente | req.params.id, sin conversión | 204 sin cuerpo |

Se espera la finalización del servicio antes de responder. El alta responde con el cliente devuelto por el servicio, no con el cuerpo recibido. La eliminación no interpreta su retorno `undefined` como inexistencia: el servicio comunica la inexistencia mediante un error.

Las reglas de negocio, selección de campos comerciales y validación de identificadores están en los [servicios existentes](servicios.md). No se duplican en el controlador.

También se exporta `crearControladoresClientes(servicio)`, siguiendo las fábricas de las capas previas. Permite verificar el borde HTTP sin abrir Atlas; las exportaciones normales usan el servicio real. Importar el módulo no inicia un servidor ni abre la conexión.

## Contrato de integración con #6

Las rutas deben importar las exportaciones de `controllers/clientes.js` y conectar cada operación correspondiente. No necesitan envolver nuevamente los rechazos del servicio: cada controlador usa `try/catch` y deriva errores con `next(error)` una sola vez, conservando el objeto original, su código y los campos de validación.

El middleware común de #6 debe construir la respuesta de error acordada:

```json
{ "error": { "code": "...", "message": "..." } }
```

| Código recibido | Tratamiento HTTP requerido al integrar |
|---|---|
| ENTRADA_INVALIDA | 400 |
| ID_INVALIDO | 400 |
| CLIENTE_NO_ENCONTRADO | 404 |
| Otros códigos o errores sin código | 500 con código y mensaje públicos seguros |

Reconocer los códigos, sin interpretar textos ni asumir que todo error es `ErrorServicio`. Para fallos internos, no reenviar indiscriminadamente `error.message`, el stack o detalles de Atlas. El controlador no envía JSON ante un error; esta contribución comprueba su derivación, no las respuestas finales del middleware.

`campos` se conserva en el error recibido por el middleware, pero no forma parte del JSON público acordado. Agregarlo requiere coordinación. El código público para fallos inesperados y rutas inexistentes lo define #6; no se crea otro catálogo de errores aquí.

Esta contribución documenta su interfaz para el responsable de #6. Su aprobación e integración siguen pendientes; no se atribuye un acuerdo que aún no ocurrió. También son responsabilidad de #6 el setup de Express, JSON/CORS, registro de rutas y arranque/cierre con la conexión compartida. No se modificaron `package.json`, lockfile, `models/`, `config/`, `services/` ni `client/`.

## Verificación reproducible

Usar Node.js >=24. Desde `server/`:

```powershell
npm ci
node --test test/controladores.test.js
npm test
node --check controllers/clientes.js
node --check test/controladores.test.js
```

Desde la raíz del repositorio:

```powershell
openspec validate controladores-clientes --strict
git diff --check
```

Resultados locales del 2 de octubre de 2026, con Node.js 24.19.0:

- Base previa: 26 pruebas aprobadas, 0 fallos.
- Pruebas de controladores escritas antes del módulo: ejecución inicial fallida con `ERR_MODULE_NOT_FOUND` para `controllers/clientes.js`, que todavía no existía.
- Después de implementar: 24 pruebas nuevas aprobadas, 0 fallos.
- Suite completa: 50 pruebas aprobadas, 0 fallos, 0 omitidas.
- Validación estricta de OpenSpec y comprobaciones de sintaxis aprobadas.
- Revisión independiente de código y alcance sin hallazgos de corrección; no acredita revisión humana final del aporte.

Las pruebas cubren estados/cuerpos de éxito, listado vacío, argumentos, espera asíncrona, fallos síncronos y asíncronos, preservación del error y ausencia de respuestas duplicadas. Además ejercitan los servicios reales con un modelo controlado para entradas inválidas, inexistencia y exclusión de `id`, `_id` y `password` recibidos.

Los objetos de solicitud/respuesta y el modelo controlado son exclusivamente de prueba. No se comprobó una API real en localhost:3001, CORS, el middleware común, Atlas ni el frontend. Para cerrar la integración, #6 debe conectar estas exportaciones y verificar solicitudes reales, incluidos 400/404/500 seguros y DELETE sin cuerpo. El change queda activo con esa comprobación pendiente; no se cierra el issue ni se archiva automáticamente.

## Uso de IA y entrega individual

Codex asistió en análisis, propuesta OpenSpec, pruebas previas al código, implementación, verificaciones locales y documentación. El usuario aprobó avanzar con el diseño del análisis y acotó el trabajo al backend, dejando commits, publicación y PR a su cargo. La revisión humana final y la defensa del aporte corresponden al integrante; no se presentan como realizadas.

No se crearon commits, staging, push ni PR durante esta implementación. No se configuró atribución de coautoría. La declaración factual de IA debe incluirse en el PR y en el registro académico, según el procedimiento del equipo.
