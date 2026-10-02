# Persistencia del backend

Base JavaScript ESM con MongoDB Atlas. Requiere Node.js 24 o superior.

La configuración, contratos y verificaciones están en [documents/persistencia.md](documents/persistencia.md).

Los casos de uso de clientes, sus validaciones y el contrato de errores para controladores y middleware están en [documents/servicios.md](documents/servicios.md).

Esta contribución no inicia un servidor HTTP: Express, rutas e integración del frontend se agregan en las siguientes tareas.

## Configuración de cada integrante

Desde server/, ejecutar `npm ci`. Crear un `.env` local desde `.env.example` si todavía no existe y completar MONGODB_URI y MONGODB_DB_NAME con el acceso al entorno compartido. Las credenciales se reciben por un canal privado; no se incluyen en Git, issues ni PR. La IP de cada integrante que se conecte debe estar habilitada en Atlas.

Los tres ejemplos iniciales ya fueron cargados en la base compartida. No ejecutar el seed como parte de cada instalación: solo corresponde al preparar una base nueva o reponer ejemplos ausentes, de forma coordinada. Repetirlo no duplica registros existentes, pero sí vuelve a crear ejemplos eliminados.

Para comprobar el acceso personal, ejecutar `npm run verificar:persistencia`: crea un registro de prueba propio, comprueba persistencia y lo elimina. No modifica los ejemplos compartidos. `npm test` ejecuta las pruebas locales sin requerir Atlas.
