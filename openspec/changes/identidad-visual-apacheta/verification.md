## Revisión visual previa al traslado de base (3 de octubre de 2026)

Registro histórico de la revisión sobre base 4be04b9, antes del traslado. Las comprobaciones contra backend propio se detallan al final.

- Build de producción exitoso; lint de archivos modificados exitoso. El lint global conserva dos problemas previos: exportaciones de AutorizacionesContext.jsx y Navigate sin uso en routes.jsx.
- Navegador Chrome/Playwright: acceso, validación y foco; filtro en URL y recarga; búsqueda sin resultados; apertura de alta, errores y conservación de entradas; creación; consulta; cancelación de baja y retorno de foco; eliminación; colección vacía; fallo de carga y reintento; restricciones de Soporte; salida y 404. Una creación y una eliminación verificadas con respuestas interceptadas, no con Atlas.
- Sin errores de ejecución del cliente en esos recorridos.
- Capturas de acceso, inicio, clientes y ficha a 360, 768, 1280 y 1920 px: sin desbordamiento global. Incluyen nombres largos. También se capturó alta a 360 px.
- axe-core con reglas WCAG 2/2.1/2.2 A/AA: cero violaciones detectadas en acceso, inicio, listado, alta, ficha, confirmación y 404. El diálogo se mide después de completar la transición: auditar durante su fundido produjo falsos fallos de contraste.
- Fuentes Source Sans 3 y Lora WOFF2 válidas, renderizadas y servidas localmente; licencias y procedencia en client/public/fonts/.
- Detector Impeccable ejecutado una sola vez: señaló un borde ornamental en una hoja anterior sin uso. Las ocho hojas antiguas sin importaciones se retiraron; el detector no se repitió.

Capturas y resultado JSON: carpeta temporal apacheta-review-v2. No se agregan capturas de datos simulados al producto. Herramientas de revisión instaladas temporalmente fuera del repositorio; no se agregan como dependencias del cliente.

## Pendientes y límites

Zoom real, lector de pantalla y evaluación manual completa. Integración con API propia y reconciliación desde main se comprobaron posteriormente, según la sección siguiente. La auditoría automática no acredita conformidad WCAG completa. El aviso de datos pendientes cubre cierre/recarga, enlaces de ruta y cierre de sesión, no retroceso del historial.

## Asistencia de IA

Codex: instalación de skills solicitadas, revisión de referencias, implementación de marca SVG y pantallas, estilos, estados y verificaciones. Impeccable, Interface Design y lineamientos Vercel orientan los criterios; las instrucciones explícitas del producto y el alcance OpenSpec prevalecen. La validación visual humana fue confirmada por el usuario; la verificación integrada posterior consta abajo. Sin commits ni publicación autorizados para esta revisión.

## Revisión independiente

El reviewer de Impeccable inspeccionó capturas de acceso, listado y ficha en escritorio y móvil. Único ajuste material: ampliar el control de datos secundarios de la ficha a 44 px de alto. Corrección aplicada y capturas regeneradas; veredicto final del arreglo: ship. Sin comp gráfico aprobado ni QUALITY BAR externa, no se afirma fidelidad a una referencia visual inexistente. Esta revisión no sustituye aprobación humana; las pruebas con API propia constan abajo.

## Base integrada y circuito real (3 de octubre de 2026)

- Fetch de origin y base vigente f75fec581ed779ee79c5ca7b2c761b0fee91df7f, PR de integración técnica fusionado. Revisados contratos y changes técnicos archivados.
- Nueva rama local feature/mauro-gutierrez-nanda-identidad-visual-apacheta desde origin/main, sin merge ni commits nuevos. La rama anterior permanece; respaldo recuperable de archivos y patch en carpeta temporal apacheta-base-main-1791061868557.
- Revisados cuatro solapamientos: Dashboard, ListaClientes, FormCliente y DetalleCliente. El servicio conserva VITE_API_URL y la API propia. Inicio usa ese servicio; alta no incluye password; ficha no muestra contraseñas, conserva username opcional y campos ausentes. No hay cambios de backend.
- npm ci en server; npm test: 63 pruebas aprobadas. Build del cliente aprobado. Lint de archivos modificados aprobado; los problemas globales previos no se cambian en este alcance.
- Backend iniciado con server/.env existente, sin copiar ni imprimir secretos. Cliente en http://localhost:5173 y API en http://localhost:3001/api/clientes.
- Chrome/Playwright sin interceptar respuestas: acceso Gerencia, conteo inicial real, alta por formulario con HTTP 201 y id Mongo de 24 caracteres, búsqueda por ciudad y recarga conservando consulta y registro persistido, ficha por id con campos opcionales, contador aumentado, cancelación y confirmación de baja con HTTP 204, consulta posterior HTTP 404 y contador original restaurado. Cero errores de ejecución del navegador.
- Registro ficticio exclusivo de verificación creado y eliminado; conjunto de identificadores originales comparado antes/después e intacto. Sin seed ni borrado de ejemplos compartidos. Evidencia resumida sin datos personales en archivo temporal apacheta-integracion-real.json.

Para repetir: iniciar backend desde server con npm start (o npm run dev), y cliente desde client con npm run dev -- --port 5173 --strictPort. Mantener localhost para coincidir con CORS_ORIGIN; comprobar GET /api/clientes. La autenticación sigue simulada en frontend: estos resultados no acreditan autorización real de backend.

## Revisión humana y organización documental

El usuario confirmó que visualmente lo ve bien y que pudo crear un cliente manualmente. Se registró la aprobación visual y su prueba de alta; no se atribuyen al usuario pruebas adicionales.

PRODUCT.md conserva contexto estable; DESIGN.md y su sidecar describen el sistema visual; OpenSpec conserva propuesta, requisitos, fundamentos, tareas y evidencias. Se retiraron de PRODUCT.md referencias a commits y estados transitorios, y la tabla de tokens duplicada de design.md. Las fuentes y versiones de skills se consultan en design-sources.json.

Autenticación real y reglas comerciales más estrictas de validación quedan fuera del change. El formulario y backend actuales comprueban campos obligatorios y formato básico de email; no verifican que nombre, teléfono o ciudad representen datos comerciales válidos. Se propondrán como trabajo independiente, sin implementarlos ni crear cambios nuevos en esta revisión.

El change permanece activo: evaluación manual completa, zoom y lector de pantalla pendientes. Esta organización documental y la propuesta de commits no autorizan crear commits, publicar ni archivar.
