# Persistencia de clientes

## Instalación y configuración

Desde server/ ejecutar `npm ci`. Requiere Node.js 24 o superior; los scripts usan su soporte de archivos de entorno, sin dotenv.

Preparar externamente MongoDB Atlas:

1. Crear o seleccionar un cluster.
2. Crear un usuario de base de datos con lectura/escritura sobre la base de esta práctica.
3. Habilitar el acceso de red desde la IP de cada integrante que necesite conectarse.
4. Obtener la URI desde Connect → Drivers y completar usuario/contraseña. Codificar caracteres especiales de credenciales según las instrucciones de Atlas.
5. Copiar `.env.example` a `.env` y completar MONGODB_URI y MONGODB_DB_NAME. El archivo local está excluido de Git. No pegar credenciales en chats, documentación o capturas.

```powershell
cd server
npm ci
Copy-Item .env.example .env
# Editar .env localmente antes de ejecutar las operaciones de Atlas.
npm test
npm run verificar:persistencia
```

No sobrescribir un .env existente. También se pueden proporcionar las variables desde el entorno del proceso; prevalecen sobre el archivo. Los imports no cargan .env ni abren conexiones automáticamente. El futuro servidor debe cargar su configuración al arrancar.

Cada integrante configura su propio .env y acceso de red para la misma base compartida. Obtener credenciales por un canal privado; no copiarlas al repositorio, issues o PR. La carga inicial es por base de datos, no por integrante: los tres ejemplos ya están cargados en el entorno compartido. No ejecutar seed durante la instalación habitual. La verificación de acceso crea y elimina solo su propio registro de prueba.

## Contratos para servicios y servidor

`config/database.js` exporta:

- conectarBaseDeDatos(): abre y comprueba acceso mediante ping; devuelve la base y reutiliza una conexión por proceso, incluidas solicitudes de apertura concurrentes.
- obtenerBaseDeDatos(): devuelve la base abierta o lanza SIN_CONEXION.
- cerrarBaseDeDatos(): espera la apertura pendiente, libera conexión y admite llamadas repetidas. Detener primero solicitudes activas al cerrar el servidor.

El servidor debe esperar apertura antes de escuchar. Un fallo no implica disponibilidad ni dispara carga inicial. Los scripts cierran en finally.

`models/cliente.js` exporta operaciones asíncronas:

| Operación | Resultado |
|---|---|
| listarClientes() | Arreglo; [] si no hay registros. |
| buscarClientePorId(id) | Cliente o null. |
| crearCliente(datos) | Cliente almacenado con id generado. |
| eliminarCliente(id) | true si eliminó; false si no existía. |

ID público: cadena hexadecimal de 24 caracteres. La colección es clientes. No se devuelve _id ni password. Datos públicos: email, phone, username, name.firstname/lastname, address.city/street/number/zipcode. Campos de texto se conservan, lastname ausente es "-", username y campos opcionales de dirección ausentes son ""; number se representa como cadena.

La capa valida estructura/tipos y selecciona campos comerciales. Servicios debe validar campos no vacíos, formato de email y reglas de negocio; no se impone unicidad de email/username. id/_id/password y otros campos de la entrada no se guardan. El login simulado del frontend no es autorización de esta capa.

Los errores tienen `code` y mensaje seguro: CONFIGURACION_INVALIDA, CONEXION_FALLIDA, SIN_CONEXION, CIERRE_FALLIDO, ENTRADA_INVALIDA, ID_INVALIDO y ALMACENAMIENTO_FALLIDO. No son respuestas HTTP; controladores/middleware los adaptarán. Fallos de almacenamiento no se convierten en ausencia ni éxito. Los mensajes del driver no se imprimen ni se adjuntan como causa pública para evitar exposición accidental de secretos.

## Datos ficticios y comprobación real

`npm run seed:clientes` carga manualmente tres ejemplos con IDs reservados. Solo inserta ausentes; no borra la colección ni sobreescribe modificaciones. Ejecutarlo otra vez debe informar cero insertados si siguen presentes. No se ejecuta al abrir la conexión. Los datos son ficticios y usan example.com.

Ejecutar el seed solo al preparar una base nueva o cuando se acuerde reponer ejemplos ausentes. Si se eliminó un ejemplo durante una prueba, una nueva carga lo vuelve a insertar; coordinarlo para no alterar la evidencia de eliminación de otro integrante.

`npm run verificar:persistencia` crea un registro de prueba propio, consulta, cierra/reabre y consulta el mismo ID, elimina, cierra/reabre y confirma ausencia. Solo limpia el registro creado por el procedimiento. Si falla la limpieza, informa su ID para revisión puntual. No prueba la API HTTP ni la integración del frontend.

## Evidencia y uso de IA

Implementación asistida por Codex a partir del change revisado. La evaluación humana de implementación y la declaración final se completarán al revisar el PR; no se dan por realizadas en este documento.

Las pruebas locales usan dependencias controladas para comprobar contratos y fallos. No acreditan persistencia real en Atlas. Registrar por separado fecha, comando y resultado de las verificaciones reales, sin URI ni credenciales.

Estado de referencia de implementación: acceso y persistencia real en Atlas comprobados mediante las ejecuciones del usuario transcritas en la sesión del 1 de octubre de 2026. El frontend continúa sin cambios y no hay servidor HTTP en esta contribución.

Verificaciones del 1 de octubre de 2026, Node.js 24.15.0:

- npm install: dependencia mongodb 7.7.0 y lockfile generados; cero vulnerabilidades reportadas en el backend.
- npm test: 11 pruebas locales aprobadas, cero fallos; conexión y almacenamiento con dependencias controladas.
- Verificación inicial antes de configurar Atlas: finalizó con código 1 por configuración ausente. Posteriormente se configuró el entorno y las siguientes ejecuciones del usuario confirmaron acceso y persistencia.
- npm run seed:clientes (primera carga, salida aportada por el usuario): {"carga":"correcta","insertados":3,"existentes":0}.
- npm run seed:clientes (repetición, salida aportada por el usuario): {"carga":"correcta","insertados":0,"existentes":3}.
- npm run verificar:persistencia (ejecutado por el usuario): {"persistencia":"correcta","alta":true,"consulta":true,"reapertura":true,"baja":true,"ausenciaPosterior":true}.
- git check-ignore: confirma exclusión de server/.env, server/atlas-credentials.env y dependencias instaladas.
- OpenSpec validate --strict: change válido. Frontend sin modificaciones.

Fuentes técnicas consultadas: [conexión del driver MongoDB](https://www.mongodb.com/docs/drivers/node/current/connect/mongoclient/) y [carga de entorno de Node.js](https://nodejs.org/api/cli.html#--env-file-if-existsfile).
