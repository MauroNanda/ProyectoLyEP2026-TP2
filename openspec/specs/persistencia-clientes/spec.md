# persistencia-clientes Specification

## Purpose

Conservar clientes comerciales en Atlas mediante operaciones asíncronas con un contrato compatible con el frontend y utilizable por servicios.

## Requirements

### Requirement: Datos comerciales compatibles
La persistencia SHALL devolver id como cadena, email, phone, username, name y address compatibles con las pantallas actuales; SHALL excluir contraseñas, identificadores internos y campos ajenos al contrato público.

#### Scenario: Alta con dirección parcial
- **WHEN** se crea un cliente con los datos comerciales del formulario y solo city en address
- **THEN** la respuesta conserva esos datos, contiene id generado y objetos name/address con campos opcionales compatibles

#### Scenario: Campos no comerciales
- **WHEN** los datos recibidos incluyen password, identificadores impuestos u otros campos ajenos
- **THEN** esos campos no se persisten desde la entrada ni aparecen en el cliente público

### Requirement: Operaciones persistentes
La capa de persistencia SHALL listar, consultar, crear y eliminar clientes reales; SHALL mantener cambios después de cerrar y reabrir la conexión.

#### Scenario: Colección vacía
- **WHEN** se lista una colección sin clientes
- **THEN** se obtiene un arreglo vacío

#### Scenario: Crear y volver a consultar
- **WHEN** se crea un cliente y se cierra y reabre la conexión
- **THEN** se recupera el mismo cliente por su id generado

#### Scenario: Eliminar y volver a consultar
- **WHEN** se elimina un cliente existente y se cierra y reabre la conexión
- **THEN** la eliminación indica éxito y la consulta posterior indica ausencia

### Requirement: Ausencia y errores distinguibles
La consulta SHALL devolver null y la eliminación SHALL devolver false para IDs válidos inexistentes. Entradas de ID inválidas y fallos de almacenamiento MUST propagarse como errores reconocibles, sin resultados de éxito ficticios.

#### Scenario: Cliente inexistente
- **WHEN** se consulta o elimina un id válido sin registro
- **THEN** la consulta devuelve null y la eliminación false

#### Scenario: ID malformado
- **WHEN** se consulta o elimina un id malformado
- **THEN** se rechaza la operación con error de entrada identificable

#### Scenario: Error de almacenamiento
- **WHEN** Atlas produce un fallo al ejecutar una operación
- **THEN** se propaga el error sin convertirlo en lista vacía, ausencia o éxito
