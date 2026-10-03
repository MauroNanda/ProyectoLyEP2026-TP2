# Frontend - Panel de Control de Clientes (CRM)

Proyecto de interfaz de usuario desarrollado con React y Vite para la gestión y visualización de clientes comerciales, integrado con API REST propia persistida en MongoDB Atlas.

Contribución del issue [#7](https://github.com/MauroNanda/ProyectoLyEP2026-TP2/issues/7), responsable Sebastián Velázquez. Change activo: `integracion-frontend-verificacion`.

---

## 1. Configuración de Entorno

El cliente consume la API REST a través de la variable de entorno `VITE_API_URL`.

Copiar el archivo de ejemplo para configurar el entorno local:
```bash
cp .env.example .env
```

Contenido de `.env.example`:
```env
# URL base de la API REST propia de clientes
VITE_API_URL=http://localhost:3001/api/clientes
```

> **Nota:** Si `VITE_API_URL` no está definida, el cliente utiliza por defecto `http://localhost:3001/api/clientes`.

---

## 2. Instalación y Ejecución

Desde la carpeta `client/`:

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en http://localhost:5173
npm run dev

# Compilar para producción (validación de build)
npm run build
```

---

## 3. Puesta en Marcha Coordinada (Frontend + Backend)

Para el funcionamiento completo del sistema:

1. **Backend (`server/`)**:
   - Asegurar que `server/.env` contenga la cadena de conexión a MongoDB Atlas (`MONGODB_URI`) y el puerto 3001.
   - Ejecutar `npm start` o `npm run dev` en `server/`.
   - Verificar que el backend esté disponible en `http://localhost:3001/api/clientes`.

2. **Frontend (`client/`)**:
   - Ejecutar `npm run dev` en `client/`.
   - Abrir `http://localhost:5173` en el navegador.

---

## 4. Cambios de Integración Realizados

- **Sustitución de FakeStoreAPI**:
  - `client/src/services/clientesService.js`: consume `import.meta.env.VITE_API_URL` para `obtenerClientes`, `obtenerClientePorId`, `crearCliente` y `eliminarCliente`.
  - `client/src/pages/Dashboard.jsx`: sustituye la llamada directa a `https://fakestoreapi.com/users` por `clientesService.obtenerClientes()`, preservando estados de carga, error y conteo dinámico.
- **Desacople de credenciales comerciales**:
  - `client/src/components/FormCliente.jsx`: eliminación del envío de contraseñas ficticias (`password`) en el alta de clientes comerciales.
  - `client/src/pages/DetalleCliente.jsx`: remoción de la sección de visualización de contraseñas y aplicación de encadenamiento opcional para renderizar con seguridad campos de dirección opcionales (`street`, `number`, `zipcode`).
  - `client/src/pages/ListaClientes.jsx`: protección con optional chaining en filtros de búsqueda y renderizado de tabla.

---

## 5. Verificación de Funcionamiento

- **Build de producción:** `npm run build` compila limpiamente sin advertencias ni errores.
- **Dashboard:** visualiza la cantidad real de clientes devueltos por el backend y muestra el mensaje accesible de alerta en caso de desconexión.
- **Listado de Clientes:** carga los clientes persistidos desde MongoDB Atlas con soporte de búsqueda por apellido y ciudad.
- **Detalle de Cliente:** navega por ID de MongoDB, presenta los datos de contacto y dirección sin credenciales comerciales.
- **Alta de Cliente:** formulario operativo que persiste registros comerciales en la base de datos Atlas.
- **Baja de Cliente:** eliminación confirmada por rol Gerencia conectada con el endpoint `DELETE /api/clientes/:id`.

---

## Declaración de Uso de IA

- **Herramienta:** Asistente AI Antigravity.
- **Asistencia recibida:** Definición de propuesta OpenSpec, especificaciones formales, diseño de integración, adaptación de consumidores a variables de entorno Vite, retiro de credenciales comerciales y documentación técnica.
- **Control humano y autorización:** Todas las decisiones y código fueron supervisadas y autorizadas según el roadmap y el issue asignado. Commits, ramas y PR quedan bajo validación y control explícito del integrante.