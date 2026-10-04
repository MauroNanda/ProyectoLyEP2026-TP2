## MODIFIED Requirements

### Requirement: Creación de clientes validada
El servicio SHALL crear un cliente solo si el cuerpo es un objeto; email, phone, `name.firstname` y `address.city` son cadenas no vacías después de eliminar espacios iniciales y finales; y el email tiene formato válido. Los campos opcionales `username`, `name.lastname`, `address.street`, `address.zipcode` y `address.number` MUST aceptarse ausentes y, si están presentes, con un tipo compatible; ausentes, MUST representarse con los valores compatibles con las pantallas: `"-"` para `name.lastname` y `""` para los demás. Una entrada inválida MUST rechazarse con código `ENTRADA_INVALIDA`, indicar los campos rechazados y no llegar a la persistencia.

La validación SHALL aplicar los límites de longitud y formatos definidos en design.md, incluyendo teléfono de 7–15 dígitos con separadores permitidos y nombre/ciudad con al menos una letra Unicode. SHALL conservar la estructura pública y no exigir unicidad de email comercial.

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
