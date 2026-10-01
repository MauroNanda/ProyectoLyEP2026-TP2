## Context

Ver proposal.md para motivación y alcance. El repositorio todavía no tiene server/. La arquitectura coloca las carpetas del backend directamente bajo server/, separadas de client/. No se verificó el entorno Atlas ni sus accesos.

## Goals / Non-Goals

**Goals:** definir una interfaz de persistencia utilizable sin Express y una conexión compartida que el servidor pueda administrar; comprobar datos reales con operaciones aisladas y reproducibles.

**Non-Goals:** servidor HTTP, servicios de negocio, autorización real, integración del frontend y deploy. No resolver requisitos de otras áreas mediante stubs permanentes.

## Decisions

### Estado de las decisiones

MongoDB Atlas, JavaScript y separación de clientes/usuarios son acuerdos vigentes. Se adopta la estructura directa de server/ y se autoriza incluir package.json y lockfile en el alcance de este change. Esto no implica que la implementación ya esté realizada.

### Driver e interfaces

Usar mongodb con ESM para evitar añadir un ODM a cuatro operaciones simples. Alternativa: Mongoose introduce otra API y una capa de esquemas innecesaria para el alcance acordado. La versión compatible se verificará al implementar.

Módulos previstos:

- server/config/database.js: conectarBaseDeDatos(), obtenerBaseDeDatos(), cerrarBaseDeDatos().
- server/models/cliente.js: selección de campos, transformación pública y operaciones listarClientes(), buscarClientePorId(id), crearCliente(datos), eliminarCliente(id). El acceso persistente se mantiene aquí, sin una carpeta repositories adicional.
- server/scripts/seed-clientes.js y server/fixtures/clientes.json: carga explícita de ejemplos.
- server/scripts/verificar-persistencia.js: comprobación real con un registro creado por el procedimiento.
- server/test/: verificaciones de transformación, errores y carga repetida pertinentes.
- server/.env.example y server/.gitignore: configuración sin secretos y exclusiones.
- server/documents/persistencia.md: contratos, configuración, instrucciones y evidencia.
- server/README.md: punto de entrada breve a la documentación técnica.

Crear server/package.json con base ESM, dependencia mongodb y scripts de persistencia/pruebas; generar package-lock.json mediante npm. El servidor HTTP agregará posteriormente sus dependencias y scripts, conservando esta base. No modificar client/ ni el roadmap en la implementación.

La arquitectura completa prevé config/, controllers/, documents/, middleware/, models/, routes/ y services/ directamente dentro de server/. Este change crea únicamente sus carpetas necesarias; no genera módulos vacíos de las áreas posteriores.

### Configuración y conexión

MONGODB_URI y MONGODB_DB_NAME obligatorias, sin valores de producción por defecto. El entorno se carga desde el proceso/comando; el módulo no abre la conexión al importarse. conectarBaseDeDatos() devuelve la base lista tras comprobar conectividad. Llamadas repetidas o concurrentes reutilizan el mismo cliente y promesa de apertura. Un fallo limpia el estado parcial y permite reintentar; no devuelve una base supuestamente lista. obtenerBaseDeDatos() falla explícitamente si no hubo conexión. cerrarBaseDeDatos() libera el cliente y puede repetirse sin error; no cierra automáticamente después de cada operación.

El servidor espera conectarBaseDeDatos() antes de escuchar y llama cerrarBaseDeDatos() al detenerse. Los scripts usan try/finally. No imprimir URI, contraseña ni errores crudos que puedan incluirlas; mantener causa utilizable internamente y documentar mensajes seguros.

### Modelo e interfaz pública

Colección clientes. _id generado por MongoDB; id público es su representación hexadecimal como cadena. Respuestas sin _id, password ni metadatos de carga. Crear selecciona email, phone, username, name y address; ignora identificadores y campos no comerciales recibidos. Servicios es responsable de validación/normalización de negocio; el modelo exige al menos estructura compatible y no convierte una entrada malformada en un registro silenciosamente válido.

Campos name.firstname, name.lastname y address.city como cadenas; lastname ausente se representa como "-". Opcionales address.street, address.zipcode y address.number ausentes se representan como cadenas vacías; un número de dirección aportado se representa como cadena. Esto conserva visualización y evita imponer cálculo numérico a domicilios. name y address siempre existen en respuestas. username se conserva como dato heredado, no como credencial. No incorporar reglas de unicidad de email/username.

listarClientes() devuelve arreglo sin envoltorio. buscarClientePorId() devuelve cliente o null. crearCliente() devuelve el documento público persistido. eliminarCliente() devuelve booleano, true solo si se eliminó un registro. IDs malformados rechazan con error reconocible de entrada; IDs válidos inexistentes devuelven null/false. Otros fallos se propagan sin convertirlos en lista vacía o éxito. No hay códigos HTTP en esta capa.

### Carga inicial y verificación

Carga manual, nunca al arrancar servidor o conectar. Cada ejemplo tiene un _id fijo válido y reservado al fixture; es una excepción interna del script, no una entrada permitida al crear clientes desde servicios. Usar inserción condicionada a ausencia del _id, sin actualizar registros ya existentes. El fixture se valida para detectar IDs duplicados. No borrar colección ni reinicializarla; segunda carga no agrega duplicados ni sobreescribe cambios existentes.

Verificación Atlas: crear un registro ficticio exclusivo del procedimiento, consultar, cerrar/reabrir conexión, consultar mismo id, eliminar, cerrar/reabrir y confirmar ausencia. Limpiar solo el registro generado por esta prueba, incluso tras un fallo. Nunca eliminar otros clientes. Registrar fecha, comando y resultado sanitizado; si no hay acceso a Atlas, marcar aceptación pendiente, no sustituirla por una prueba en memoria.

## Risks / Trade-offs

- Acceso Atlas no disponible → avanzar en artefactos y pruebas locales, mantener integración pendiente.
- Cambios posteriores del servidor → conservar manifiesto y contratos de conexión al ampliar la base del backend.
- Operaciones concurrentes de conexión → probar reutilización de apertura y recuperación después de fallos.
- Credenciales en salida → errores y evidencia sanitizados; .env fuera de Git.
- Login simulado no asegura API → documentar esta limitación; autorización real pertenece a evolución futura.
- Seed podría ocultar cambios → solo insertar ausentes, reportar existentes y no reemplazarlos.

## Migration Plan

No hay migración de datos reales ni despliegue en este change. Tras autorización de implementación, incorporar módulos, instalar dependencias del backend y verificar con datos ficticios en Atlas. El frontend continúa usando FakeStoreAPI hasta su integración posterior. Ante fallo, detener scripts y conservar registros ajenos; cambios de código futuros se revierten mediante el flujo de PR, sin borrar colecciones para recuperar el entorno.
