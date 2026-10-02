## Context

Ver proposal.md para motivación y alcance; los requisitos están en specs/servicios-clientes/spec.md.

La persistencia (`server/models/cliente.js`, change archivado `modelos-persistencia-clientes`) expone `listarClientes()`, `buscarClientePorId(id)` → cliente o `null`, `crearCliente(datos)` y `eliminarCliente(id)` → booleano. Ya descarta campos no comerciales, completa opcionales (`lastname` → `"-"`, dirección → `""`) y lanza `ErrorPersistencia` con `code`. Solo valida tipos: acepta cadenas vacías y emails sin formato. El modelo exporta además la fábrica `crearModeloCliente(obtenerBase)`, que permite pruebas sin Atlas.

El formulario actual envía email, username, `password: "1234"`, `name.firstname`, `name.lastname: "-"`, `address.city` y phone.

## Goals / Non-Goals

**Goals:** casos de uso independientes de Express, probables con un modelo controlado, y un contrato de errores estable para controladores.

**Non-Goals:** respuestas HTTP, mapeo a códigos de estado, middleware, conexión a Atlas, cambios en el modelo o en `client/`, unicidad de email o username, edición de clientes.

## Decisions

### Estado de las decisiones

Aprobadas por el responsable del issue antes de redactar este change: códigos de error, ignorar `password`, normalizar email solo con trim y no modificar `models/`, `config/` ni `package.json`.

Módulo compartido: `server/services/errores.js` lo importarán controladores (issue #5) para reconocer los errores y middleware (issue #6) tratará los no previstos. Como las tareas son secuenciales y #5 y #6 comienzan después de fusionar este change, el acuerdo se registra en esta entrega: la ubicación, el nombre `ErrorServicio`, la forma `{ code, message, campos? }`, los códigos y su correspondencia HTTP sugerida se documentan en `server/documents/servicios.md` y en una sección del PR dirigida a controladores y middleware. Es la referencia que leen sus responsables antes de proponer sus changes, sin modificar issues ajenos; si plantean otra forma, se coordina el ajuste en un change posterior.

### Módulos

- `server/services/errores.js`: clase `ErrorServicio extends Error` con `code` y, para entradas inválidas, `campos` (arreglo de rutas como `email` o `name.firstname`). Exporta las constantes de código.
- `server/services/clientes.js`: fábrica `crearServicioClientes(modelo)` que recibe la interfaz de persistencia y devuelve las cuatro operaciones; exporta además las operaciones construidas sobre el modelo real. La validación y normalización son funciones internas del mismo módulo, porque solo las usa este servicio.

Alternativa descartada: un archivo `validaciones.js` separado. Con un único consumidor agrega un módulo sin beneficio; puede extraerse si otra área lo necesita.

Alternativa descartada: importar el modelo directamente sin fábrica. Obligaría a usar Atlas o a reemplazar módulos en las pruebas; la fábrica sigue el patrón de `crearModeloCliente`.

### Validación y normalización

Se construye un objeto nuevo con los campos comerciales seleccionados explícitamente; nunca se reenvía el cuerpo recibido. Las cadenas se recortan con `trim`. Se acumulan todos los campos inválidos antes de lanzar un único `ENTRADA_INVALIDA`, para que el frontend pueda informar todos los errores juntos.

- Cuerpo: objeto no nulo y no arreglo.
- `name` y `address`: objetos, porque contienen campos obligatorios.
- Obligatorios: cadenas con contenido después de `trim`.
- Email: `^[^\s@]+@[^\s@]+\.[^\s@]+$`. Se elige una expresión simple porque el objetivo es rechazar errores evidentes, no validar RFC 5322; sin pasar a minúsculas.
- Opcionales: ausentes, o cadenas (`address.number` también admite número finito, como acepta el modelo).

### Valores de campos opcionales

Los valores compatibles quedan definidos en la spec: `name.lastname` ausente es `"-"` (lo mismo que envía el formulario y muestran las pantallas), y `username`, `address.street`, `address.number` y `address.zipcode` ausentes son `""`; `address.number` numérico se guarda como cadena. El servicio no los duplica: el modelo ya los aplica con esos valores (`seleccionarDatosCliente`). Para que el contrato no dependa de una suposición, las pruebas del servicio comprueban esos valores en el cliente creado. Alternativa descartada: aplicar los defaults también en el servicio, lo que dejaría dos fuentes de verdad que podrían divergir.

### Identificadores

Se valida `^[a-f\d]{24}$` (insensible a mayúsculas) antes de invocar la persistencia y se lanza `ErrorServicio` con `ID_INVALIDO`. El modelo valida lo mismo con su propio `ID_INVALIDO`; el servicio lo adelanta para no depender del orden interno del modelo. El código coincide intencionalmente para que el controlador lo trate igual sin importar la capa que lo produzca.

### Ausencia y errores

`null` de la consulta y `false` de la eliminación se convierten en `CLIENTE_NO_ENCONTRADO`. Los errores del modelo (`ErrorPersistencia`) y cualquier fallo inesperado se dejan propagar sin capturarlos; no hay `try/catch` que los envuelva ni los convierta en un error previsto. Un error sin código de servicio debe tratarse como error interno por las capas siguientes. Mensajes de servicio fijos y sin datos de la entrada más allá de los nombres de campo.

## Risks / Trade-offs

- [Los responsables de #5 o #6 prefieren otra forma de error] → el contrato queda documentado en esta entrega antes de que propongan sus changes; un ajuste posterior se coordina y se refleja en `server/documents/servicios.md`.
- [El controlador interpreta mal un código] → documentar la tabla de códigos en `server/documents/servicios.md` y compartirla con el issue #5 antes de su implementación.
- [El formulario deja de enviar `lastname` o agrega campos] → los opcionales ausentes se aceptan y los desconocidos se ignoran.
- [Las pruebas con modelo controlado no acreditan Atlas] → ejecutar además una verificación real con el modelo de Atlas cuando el acceso de red esté habilitado; si no lo está, dejarla registrada como pendiente.
- [Validación duplicada de id con el modelo] → se acepta para mantener el contrato del servicio independiente de detalles internos de persistencia.
