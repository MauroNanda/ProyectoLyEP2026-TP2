# servicios-clientes Specification

## Purpose

Aplicar las reglas de negocio de clientes sobre la persistencia existente y entregar a los controladores resultados compatibles con el frontend y errores distinguibles por código, sin depender de HTTP.

## Requirements

### Requirement: Listado de clientes
El servicio SHALL devolver el arreglo de clientes públicos informado por la persistencia, incluido el arreglo vacío. Un fallo de persistencia MUST propagarse sin convertirse en un arreglo vacío.

#### Scenario: Clientes existentes
- **WHEN** se solicita el listado y la persistencia contiene clientes
- **THEN** se obtiene un arreglo con esos clientes, cada uno con id como cadena

#### Scenario: Sin clientes
- **WHEN** se solicita el listado y la persistencia no contiene clientes
- **THEN** se obtiene un arreglo vacío

#### Scenario: Fallo al listar
- **WHEN** la persistencia falla al listar
- **THEN** la operación se rechaza con el mismo error de persistencia, sin devolver un arreglo

### Requirement: Consulta de un cliente
El servicio SHALL devolver el cliente correspondiente a un id válido existente. Un id con formato inválido MUST rechazarse con código `ID_INVALIDO` sin consultar la persistencia. Un id válido sin registro MUST rechazarse con código `CLIENTE_NO_ENCONTRADO`.

#### Scenario: Cliente existente
- **WHEN** se consulta un id válido que corresponde a un cliente
- **THEN** se obtiene ese cliente

#### Scenario: Cliente inexistente
- **WHEN** se consulta un id válido sin registro
- **THEN** la operación se rechaza con código `CLIENTE_NO_ENCONTRADO`

#### Scenario: Id malformado
- **WHEN** se consulta un id que no es una cadena hexadecimal de 24 caracteres
- **THEN** la operación se rechaza con código `ID_INVALIDO` y la persistencia no es consultada

### Requirement: Creación de clientes validada
El servicio SHALL crear un cliente solo si el cuerpo es un objeto; email, phone, `name.firstname` y `address.city` son cadenas no vacías después de eliminar espacios iniciales y finales; y el email tiene formato válido. Los campos opcionales `username`, `name.lastname`, `address.street`, `address.zipcode` y `address.number` MUST aceptarse ausentes y, si están presentes, con un tipo compatible; ausentes, MUST representarse con los valores compatibles con las pantallas: `"-"` para `name.lastname` y `""` para los demás. Una entrada inválida MUST rechazarse con código `ENTRADA_INVALIDA`, indicar los campos rechazados y no llegar a la persistencia.

La validación SHALL aplicar los límites de longitud y formatos definidos en [diseño del change](../../changes/archive/2026-10-04-cuentas-permisos-auditoria-backend/design.md), incluyendo teléfono de 7–15 dígitos con separadores permitidos y nombre/ciudad con al menos una letra Unicode. SHALL conservar la estructura pública y no exigir unicidad de email comercial.

#### Scenario: Datos del formulario actual
- **WHEN** se crea un cliente con los datos que envía el formulario del frontend: email, username, password, name con firstname y lastname, address con city, y phone
- **THEN** se obtiene el cliente creado con id generado y los datos comerciales recibidos

#### Scenario: Opcionales ausentes
- **WHEN** se crea un cliente válido sin username, name.lastname, address.street, address.number ni address.zipcode
- **THEN** el cliente creado tiene username `""`, name.lastname `"-"` y address.street, address.number y address.zipcode `""`

#### Scenario: Número de dirección numérico
- **WHEN** se crea un cliente válido con address.number como número finito
- **THEN** el cliente creado tiene address.number representado como cadena

#### Scenario: Espacios sobrantes
- **WHEN** se crea un cliente cuyos campos de texto contienen espacios al inicio o al final
- **THEN** el cliente se guarda con esos campos sin los espacios sobrantes y el email no sufre otras transformaciones

#### Scenario: Campos obligatorios vacíos o ausentes
- **WHEN** se crea un cliente con email, phone, firstname o city ausentes, vacíos o formados solo por espacios
- **THEN** la operación se rechaza con código `ENTRADA_INVALIDA`, indica cada campo rechazado y no se guarda ningún registro

#### Scenario: Email con formato inválido
- **WHEN** se crea un cliente con un email sin el formato usuario@dominio.ext
- **THEN** la operación se rechaza con código `ENTRADA_INVALIDA` indicando el campo email

#### Scenario: Cuerpo que no es un objeto
- **WHEN** se crea un cliente con un cuerpo ausente, nulo, primitivo o arreglo
- **THEN** la operación se rechaza con código `ENTRADA_INVALIDA`

#### Scenario: Opcional con tipo incompatible
- **WHEN** se crea un cliente con un campo opcional presente de tipo no admitido
- **THEN** la operación se rechaza con código `ENTRADA_INVALIDA` indicando ese campo

#### Scenario: Datos no comerciales o excesivos
- **WHEN** el alta recibe teléfono sin dígitos, nombre/ciudad sin letras o un campo que excede el límite acordado
- **THEN** rechaza con ENTRADA_INVALIDA y campos asociados sin persistir el cliente.

### Requirement: Campos no comerciales ignorados
El servicio SHALL entregar a la persistencia solo los campos comerciales acordados. `id`, `_id`, `password` y otros campos enviados por el solicitante MUST ignorarse sin rechazar la solicitud y MUST NOT aparecer en el cliente creado.

#### Scenario: Identificadores y credenciales impuestos
- **WHEN** se crea un cliente válido que incluye id, _id, password y campos desconocidos
- **THEN** el cliente se crea con un id generado por el backend y sin password ni los campos desconocidos

### Requirement: Eliminación de clientes
El servicio SHALL eliminar el cliente correspondiente a un id válido existente y finalizar sin resultado. Un id malformado MUST rechazarse con código `ID_INVALIDO` sin llegar a la persistencia y un id válido sin registro MUST rechazarse con código `CLIENTE_NO_ENCONTRADO`.

#### Scenario: Eliminación correcta
- **WHEN** se elimina un id válido que corresponde a un cliente
- **THEN** la operación finaliza correctamente

#### Scenario: Eliminación de inexistente
- **WHEN** se elimina un id válido sin registro
- **THEN** la operación se rechaza con código `CLIENTE_NO_ENCONTRADO`

#### Scenario: Eliminación con id malformado
- **WHEN** se elimina un id con formato inválido
- **THEN** la operación se rechaza con código `ID_INVALIDO` y la persistencia no es invocada

### Requirement: Errores distinguibles y fallos propagados
Los errores de servicio SHALL exponer un código estable (`ENTRADA_INVALIDA`, `ID_INVALIDO`, `CLIENTE_NO_ENCONTRADO`) y un mensaje sin secretos, reconocibles sin interpretar el texto del mensaje. Los errores de persistencia MUST propagarse sin modificar su código ni convertirse en ausencia o éxito. Cualquier otro fallo inesperado MUST propagarse como rechazo, sin convertirse en ausencia, éxito ni en un error de servicio previsto, para que el consumidor lo trate como error interno.

#### Scenario: Fallo de persistencia en cualquier operación
- **WHEN** la persistencia falla al consultar, crear o eliminar
- **THEN** la operación se rechaza con el error original de persistencia y su código

#### Scenario: Fallo inesperado
- **WHEN** la persistencia produce un error sin código conocido en cualquier operación
- **THEN** la operación se rechaza con ese error, que no tiene los códigos `ENTRADA_INVALIDA`, `ID_INVALIDO` ni `CLIENTE_NO_ENCONTRADO`

#### Scenario: Reconocimiento por código
- **WHEN** un consumidor recibe un error de servicio
- **THEN** puede identificarlo por su código sin depender del mensaje
