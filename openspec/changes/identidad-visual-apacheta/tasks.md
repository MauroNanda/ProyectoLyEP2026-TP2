## 1. Condiciones previas

- [x] 1.1 Comprobar cierre y verificación de las cinco tareas técnicas del TP2 antes de integrar esta mejora; recrear la rama desde origin/main con autorización y revisar cambios y solapamientos. Base f75fec5 comprobada el 3 de octubre de 2026.
- [x] 1.2 Revisar propuesta, diseño y requisitos con el usuario; obtener autorización explícita para implementar. Implementación local autorizada el 2 de octubre de 2026; mantener sin publicar.
- [x] 1.3 Registrar la base funcional integrada tras completar el hito técnico: acceso, búsqueda, detalle, alta, baja, contador y datos secundarios; identificar rutas, permisos y respuestas que deben conservarse.

## 2. Validación de dirección

- [x] 2.1 Preparar una muestra revisable de acceso y listado, con datos ficticios de la estructura actualmente consumida, marca, paleta y jerarquía propuestas; no conectar funciones comerciales futuras.
- [x] 2.2 Revisar la muestra con el usuario y ajustar marca, densidad y acentos; documentar decisiones en design.md y reconciliar specs si cambia algún comportamiento.

## 3. Sistema visual y pantallas

- [x] 3.1 Centralizar tokens de color, tipografía, espaciado y estados; medir contraste de textos y controles y comprobar la tipografía renderizada.
- [x] 3.2 Aplicar identidad a acceso, encabezado, navegación, pie y metadatos; preservar el flujo de acceso y las restricciones existentes.
- [x] 3.3 Reorganizar inicio con acceso prioritario a Clientes y datos existentes disponibles con menor jerarquía; excluir indicadores inventados.
- [x] 3.4 Reorganizar listado con búsqueda etiquetada y tabla predominantes; implementar panel de alta accesible que conserve entradas al alternar visibilidad.
- [x] 3.5 Unificar ficha y formulario: agrupar datos reales, admitir campos ausentes, separar baja de consulta y preservar confirmación y resultados del flujo integrado.
- [x] 3.6 Unificar carga, errores, colección vacía y búsqueda sin coincidencias con mensajes y acciones existentes; adaptar ErrorPage.

## 4. Verificación y revisión

- [x] 4.1 Comprobar acceso, búsqueda por criterios existentes, alta, detalle, baja y contador contra la API propia; no modificar contratos para acomodar el diseño.
- [ ] 4.2 Verificar teclado, foco, etiquetas, estados no dependientes del color, movimiento reducido y zoom; registrar límites sin afirmar conformidad completa no evaluada.
- [x] 4.3 Revisar capturas a 360, 768, 1280 y 1920 px, nombres largos y campos ausentes; corregir desbordamiento global y controles inaccesibles.
- [x] 4.4 Ejecutar build y verificaciones pertinentes del cliente; registrar resultados reales y obtener revisión visual humana del conjunto.
- [x] 4.5 Documentar alcance final, asistencia de IA, decisiones y evidencias para un futuro PR; proponer commits y publicación únicamente cuando el usuario autorice esas acciones.
