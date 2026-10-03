## Purpose

Dar al cliente una identidad coherente con Apacheta y facilitar las operaciones comerciales existentes mediante jerarquía clara, accesibilidad y presentación honesta de sus capacidades.

## ADDED Requirements

### Requirement: Identidad consistente
El cliente SHALL mostrar Apacheta como nombre del producto en acceso y navegación, con tratamientos visuales coherentes en todas las pantallas del alcance.

#### Scenario: Recorrido de pantallas
- **WHEN** una persona recorre acceso, inicio, clientes y ficha
- **THEN** reconoce la misma marca, vocabulario, estilos de controles y ubicación de navegación.

### Requirement: Consulta prioritaria y alta disponible
El listado SHALL presentar búsqueda etiquetada y resultados antes del formulario de alta, y SHALL permitir desplegar ese formulario mediante una acción identificable sin perder sus entradas al alternar su visibilidad.

#### Scenario: Buscar y agregar
- **WHEN** una persona abre Clientes y activa Agregar cliente
- **THEN** puede buscar por los criterios existentes y acceder al alta sin abandonar el contexto del listado.

#### Scenario: Alternar el formulario
- **WHEN** una persona ingresa datos y cierra y vuelve a desplegar el panel de alta
- **THEN** conserva los datos ingresados y puede continuar la operación.

### Requirement: Capacidades y datos honestos
El cliente SHALL conservar el acceso a funciones y datos existentes, distinguir clientes comerciales de usuarios de acceso y evitar controles, métricas o mensajes que presenten capacidades futuras como disponibles.

#### Scenario: Inicio sin funciones futuras
- **WHEN** una persona visita el inicio
- **THEN** encuentra acceso a Clientes y datos actuales sin compromisos, alertas o indicadores comerciales inventados.

### Requirement: Operaciones compatibles
La presentación SHALL preservar búsqueda, detalle, alta, baja, navegación y acceso existentes sobre el contrato integrado, manteniendo identificadores y resultados sin cambios de significado.

#### Scenario: Operación completa
- **WHEN** una persona autorizada crea, busca, consulta y elimina un cliente
- **THEN** obtiene los resultados del flujo integrado previo y conserva sus restricciones de acceso.

### Requirement: Estados comprensibles
El cliente SHALL distinguir carga, error, colección vacía y búsqueda sin coincidencias, y SHALL describir el estado sin revelar detalles internos ni ofrecer acciones inexistentes.

#### Scenario: Búsqueda sin coincidencias
- **WHEN** la búsqueda no devuelve coincidencias aunque existen clientes
- **THEN** informa que no hay resultados para ese criterio y permite modificarlo, sin afirmar que la colección está vacía.

#### Scenario: Fallo de carga
- **WHEN** falla la consulta de clientes
- **THEN** presenta un error de carga reconocible sin convertirlo en cero clientes o datos comerciales ficticios.

### Requirement: Accesibilidad y adaptación
El cliente SHALL permitir operar controles con teclado y foco visible, asociar etiquetas a campos y mantener contenido y acciones utilizables en PC, tablet y pantallas pequeñas. El texto normal SHALL alcanzar contraste mínimo 4.5:1 y el grande 3:1; los estados SHALL tener una señal además del color.

#### Scenario: Teclado y pantalla estrecha
- **WHEN** una persona navega con teclado a 360 px de ancho
- **THEN** puede alcanzar búsqueda, alta, ficha y baja sin controles ocultos o desbordamiento global, con desplazamiento localizado de tabla si es necesario.

#### Scenario: Estados y contraste
- **WHEN** se presentan mensajes de error y controles con sus estados visuales
- **THEN** el texto cumple los umbrales definidos y el significado permanece comprensible sin distinguir colores.

### Requirement: Símbolo reconocible de Apacheta
El cliente SHALL representar la marca mediante una apacheta de piedras apiladas, compartiendo el símbolo entre acceso, navegación y favicon.

#### Scenario: Identificar el producto
- **WHEN** una persona abre acceso o navega por el cliente
- **THEN** encuentra el mismo símbolo de piedras apiladas junto a la identidad Apacheta.

### Requirement: Continuidad de consulta y errores
El cliente SHALL conservar filtro y apertura del alta en URL, enfocar el primer campo al abrir el panel y el primer campo inválido al fallar una validación, sin borrar datos de un formulario al ocultarlo o ante un fallo de envío.

#### Scenario: Restaurar consulta
- **WHEN** una persona filtra clientes y recarga la página
- **THEN** mantiene el filtro y la consulta correspondiente.

#### Scenario: Corregir alta
- **WHEN** una persona intenta guardar campos inválidos
- **THEN** identifica los errores y recibe foco en el primer campo que debe corregir.
