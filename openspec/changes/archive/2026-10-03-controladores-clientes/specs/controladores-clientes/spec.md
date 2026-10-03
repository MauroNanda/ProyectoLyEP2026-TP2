# Spec Delta

## Purpose

Adaptar las solicitudes de clientes a los servicios existentes, construir respuestas de éxito compatibles con la API y entregar los fallos al mecanismo común sin exponerlos como respuestas propias.

## ADDED Requirements

### Requirement: Listado de clientes por HTTP
El controlador de listado SHALL consultar el servicio de listado y devolver estado 200 con el arreglo resultante, sin envoltorio adicional. La respuesta MUST esperar la finalización del servicio.

#### Scenario: Clientes existentes
- **WHEN** el servicio resuelve el listado de clientes
- **THEN** el controlador responde 200 con ese arreglo y no deriva la solicitud al mecanismo de errores

#### Scenario: Lista vacía
- **WHEN** el servicio resuelve un arreglo vacío
- **THEN** el controlador responde 200 con `[]`, no 404

### Requirement: Consulta de cliente por identificador
El controlador de consulta SHALL entregar al servicio el identificador recibido en los parámetros de la solicitud sin convertirlo a número y devolver estado 200 con el cliente encontrado.

#### Scenario: Cliente existente
- **WHEN** la solicitud contiene un identificador como cadena y el servicio resuelve un cliente
- **THEN** el servicio recibe esa cadena y la respuesta es 200 con el cliente público, incluido su id

### Requirement: Creación de cliente
El controlador de creación SHALL entregar al servicio el cuerpo recibido, delegando las reglas de negocio, y responder estado 201 con el cliente persistido que devuelve el servicio, incluido su id generado. MUST NOT devolver el cuerpo original como si fuera el resultado persistido.

#### Scenario: Datos válidos
- **WHEN** el servicio crea un cliente a partir del cuerpo recibido
- **THEN** el controlador responde 201 con el resultado del servicio y su identificador generado

#### Scenario: Campos internos enviados
- **WHEN** la solicitud incluye campos que el servicio excluye del cliente comercial
- **THEN** la respuesta contiene el cliente público devuelto por el servicio, sin reintroducir esos campos

### Requirement: Eliminación sin cuerpo
El controlador de eliminación SHALL entregar al servicio el identificador de la solicitud y, únicamente tras su finalización correcta, responder estado 204 sin cuerpo. MUST NOT interpretar la ausencia de valor de retorno como inexistencia.

#### Scenario: Cliente eliminado
- **WHEN** el servicio finaliza correctamente la eliminación sin retornar un valor
- **THEN** el controlador finaliza la respuesta con estado 204 sin enviar JSON

#### Scenario: Operación pendiente
- **WHEN** la eliminación todavía no ha finalizado
- **THEN** el controlador no envía estado ni cuerpo hasta que el servicio resuelva

### Requirement: Propagación de errores al mecanismo común
Todos los controladores SHALL entregar una sola vez al mecanismo común los errores del servicio, tanto rechazos asíncronos como fallos síncronos, conservando el error original. Ante un fallo MUST NOT enviar respuesta de éxito, serializar el error ni exponer mensajes internos o stack traces. La construcción de respuestas de error pertenece al middleware común y no se implementa en este change.

#### Scenario: Entrada o identificador inválido
- **WHEN** el servicio falla con `ENTRADA_INVALIDA` o `ID_INVALIDO`
- **THEN** el controlador entrega el error original al mecanismo común para su tratamiento como 400, sin enviar respuesta propia

#### Scenario: Cliente inexistente
- **WHEN** la consulta o eliminación falla con `CLIENTE_NO_ENCONTRADO`
- **THEN** el controlador entrega el error original para su tratamiento como 404, sin responder con éxito

#### Scenario: Fallo de almacenamiento o inesperado
- **WHEN** cualquier operación falla con un código distinto o con un error sin código
- **THEN** el controlador entrega el error original para su tratamiento seguro como 500, sin publicar sus detalles

#### Scenario: Fallo síncrono
- **WHEN** una operación del servicio lanza un error antes de devolver una promesa
- **THEN** el controlador entrega ese error una sola vez al mecanismo común sin enviar respuesta propia
