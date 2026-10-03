# Design

## Context

El backend implementado en `server/` (issues #3 a #6) expone la API REST en `http://localhost:3001/api/clientes` con soporte CORS para el frontend Vite en `http://localhost:5173`. Persiste datos en MongoDB Atlas y utiliza identificadores alfanuméricos estables como cadena (`id`), ignorando campos internos y credenciales comerciales no pertinentes.
El frontend en `client/` mantenía acoplamiento con la API externa `https://fakestoreapi.com/users` en `client/src/services/clientesService.js` y `client/src/pages/Dashboard.jsx`, y enviaba contraseñas comerciales simuladas en `client/src/components/FormCliente.jsx` y `client/src/pages/DetalleCliente.jsx`.

## Goals / Non-Goals

**Goals:**
- Parametrizar la URL base de la API mediante la variable de entorno `VITE_API_URL` en Vite (`import.meta.env.VITE_API_URL`), con valor por defecto `http://localhost:3001/api/clientes`.
- Canalizar todas las llamadas a clientes a través de `clientesService.js`, incluyendo el conteo total de clientes en `Dashboard.jsx`.
- Retirar el atributo `password` en el alta de clientes comerciales desde `FormCliente.jsx` y eliminar la visualización de contraseñas en `DetalleCliente.jsx`.
- Asegurar tolerancia a fallos en `DetalleCliente.jsx` cuando campos opcionales de dirección (`street`, `number`, `zipcode`) o nombre no existan en registros persistidos.
- Documentar las instrucciones de configuración, puesta en marcha y evidencias de verificación en `client/README.md`.

**Non-Goals:**
- No modificar el código ni los contratos del backend en `server/`.
- No alterar la autenticación ni sesiones simuladas de usuarios/administradores existentes en `client/src/services/autorizacionesServices.js` y `Login.jsx`.
- No implementar autenticación real en el backend (JWT, sesiones de servidor o cookies seguras), la cual queda reservada para fases futuras.
- No alterar la estética general ni rediseñar pantallas más allá de retirar los elementos de contraseñas comerciales no pertinentes.

## Decisions

### 1. Parametrización con `import.meta.env.VITE_API_URL` y fallback local
- **Decisión:** Definir en `clientesService.js`:
  ```javascript
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/clientes';
  ```
  y proveer un archivo `client/.env.example` de referencia.
- **Alternativa descartada:** Fijar la URL a fuego (hardcoded) en el código. Se descartó porque impide la portabilidad a diferentes puertos o entornos de prueba/despliegue.

### 2. Centralización del consumo en `Dashboard.jsx`
- **Decisión:** En lugar de realizar un `fetch` directo a una URL externa, `Dashboard.jsx` importará `clientesService.obtenerClientes()` para calcular `data.length`.
- **Alternativa descartada:** Mantener un `fetch` directo apuntando a `VITE_API_URL`. Se descartó para evitar duplicar lógica de cliente HTTP, cabeceras y manejo uniforme de respuestas.

### 3. Retiro de contraseñas comerciales
- **Decisión:**
  - En `FormCliente.jsx`, eliminar `password: "1234"` del objeto `nuevoCliente`.
  - En `DetalleCliente.jsx`, eliminar la sección que mostraba `Contraseña: {cliente.password}`, manteniendo los datos de usuario o contacto legítimos.
- **Alternativa descartada:** Seguir enviando `"1234"` y dejar que el backend lo descarte silenciosamente. Se descartó porque perpetúa un acoplamiento erróneo y confuso entre el cliente comercial y las credenciales de un usuario del sistema.

### 4. Robustez ante campos ausentes en `DetalleCliente.jsx`
- **Decisión:** Utilizar encadenamiento opcional y valores de contingencia (ej. `cliente.address?.street || '-'`) al mostrar campos de dirección, dado que el modelo de persistencia admite que algunos clientes solo tengan cargada la ciudad.
- **Alternativa descartada:** Asumir que toda la estructura de dirección siempre está presente de forma homogénea.

## Risks / Trade-offs

- **[Riesgo: Bloqueo de CORS si el cliente se ejecuta en otro puerto]** → *Mitigación:* El backend permite configurar `CORS_ORIGIN` en su `.env` y por defecto acepta `http://localhost:5173`. Si Vite asigna otro puerto (ej. 5174 por estar ocupado el 5173), documentar claramente la necesidad de alinear ambas configuraciones.
- **[Riesgo: Servidor apagado o error de conexión en la carga inicial]** → *Mitigación:* Tanto `Dashboard.jsx` como `ListaClientes.jsx` y `DetalleCliente.jsx` poseen captura de errores (`try/catch` y estados de `error`) informando adecuadamente al usuario sin generar pantallas en blanco.
