# Servidor backend y persistencia

Base JavaScript ESM con Express y MongoDB Atlas. Requiere Node.js 24 o superior.

La configuración, contratos y verificaciones están en:
- Persistencia y base de datos: [documents/persistencia.md](documents/persistencia.md)
- Servicios y reglas de negocio: [documents/servicios.md](documents/servicios.md)
- Controladores de clientes: [documents/controladores.md](documents/controladores.md)
- Servidor Express, rutas y middleware: [documents/servidor.md](documents/servidor.md)

## Ejecución del servidor

Desde `server/`:

```powershell
npm ci
npm start
```

Para desarrollo con reinicio automático:
```powershell
npm run dev
```

El servidor escucha por defecto en `http://localhost:3001` y expone las rutas en `/api/clientes`.

## Configuración de cada integrante

Crear un `.env` local desde `.env.example` si todavía no existe y completar `MONGODB_URI` y `MONGODB_DB_NAME` con el acceso al entorno compartido. Opcionalmente configurar `PORT` (por defecto 3001) y `CORS_ORIGIN` (por defecto `http://localhost:5173`). Las credenciales se reciben por un canal privado; no se incluyen en Git, issues ni PR. La IP de cada integrante que se conecte debe estar habilitada en Atlas.

Los tres ejemplos iniciales ya fueron cargados en la base compartida. No ejecutar el seed como parte de cada instalación: solo corresponde al preparar una base nueva o reponer ejemplos ausentes, de forma coordinada. Repetirlo no duplica registros existentes, pero sí vuelve a crear ejemplos eliminados.

Para comprobar el acceso personal, ejecutar `npm run verificar:persistencia`: crea un registro de prueba propio, comprueba persistencia y lo elimina. No modifica los ejemplos compartidos.

## Pruebas y verificación

Ejecutar la suite completa de pruebas locales (no requiere conexión activa a Atlas):
```powershell
npm test
```
