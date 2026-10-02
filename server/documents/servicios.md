# Servicios de clientes

Casos de uso de clientes sobre la persistencia de [persistencia.md](persistencia.md). Aplican las reglas de negocio acordadas en el issue #4 y no dependen de Express: no conocen rutas, solicitudes ni códigos HTTP.

Change de OpenSpec: `servicios-clientes`.

## Operaciones

`services/clientes.js` exporta funciones asíncronas construidas sobre `models/cliente.js`:

| Operación | Resultado | Errores de servicio |
|---|---|---|
| listarClientes() | Arreglo de clientes; [] si no hay registros. | Ninguno. |
| obtenerClientePorId(id) | Cliente. | ID_INVALIDO, CLIENTE_NO_ENCONTRADO |
| crearCliente(datos) | Cliente creado, con id generado por el backend. | ENTRADA_INVALIDA |
| eliminarCliente(id) | Finaliza sin resultado. | ID_INVALIDO, CLIENTE_NO_ENCONTRADO |

Los clientes tienen la forma pública de persistencia: id, email, phone, username, name.firstname/lastname y address.city/street/number/zipcode, sin password.

También exporta `crearServicioClientes(modelo)`, que recibe cualquier objeto con la interfaz de persistencia. Se usa en las pruebas para reemplazar Atlas por un modelo controlado. Importar el módulo no abre conexiones: el servidor debe llamar `conectarBaseDeDatos()` antes de usar las operaciones.

## Contrato de errores para controladores (#5) y middleware (#6)

`services/errores.js` exporta la clase `ErrorServicio` y las constantes `CODIGOS`. Cada error tiene la forma `{ name: 'ErrorServicio', code, message, campos? }`. Reconocerlos por `code`, no por el texto del mensaje.

| code | Cuándo ocurre | HTTP sugerido |
|---|---|---|
| ENTRADA_INVALIDA | Datos de alta inválidos. `campos` lista cada campo rechazado, por ejemplo `['email', 'address.city']`; `['cuerpo']` si el cuerpo no es un objeto. | 400 |
| ID_INVALIDO | El id no es una cadena hexadecimal de 24 caracteres. Persistencia usa el mismo código. | 400 |
| CLIENTE_NO_ENCONTRADO | El id es válido pero no corresponde a ningún cliente. | 404 |
| Cualquier otro code o error sin code | Fallos de persistencia (`ALMACENAMIENTO_FALLIDO`, `SIN_CONEXION`, etc.) o errores inesperados. Se propagan sin modificar. | 500 |

La correspondencia HTTP es una sugerencia para controladores y middleware; esta capa no la aplica. Los mensajes son fijos y no incluyen datos de la entrada ni detalles internos.

## Reglas de validación

Al crear, el servicio selecciona explícitamente los campos comerciales y entrega a persistencia un objeto nuevo; nunca reenvía el cuerpo recibido.

- El cuerpo debe ser un objeto (no nulo ni arreglo).
- email, phone, name.firstname y address.city son obligatorios: cadenas con contenido después de quitar espacios.
- email debe tener formato usuario@dominio.ext. No se pasa a minúsculas ni se transforma de otra manera.
- username, name.lastname, address.street y address.zipcode son opcionales: ausentes o cadenas. address.number admite también un número finito.
- name y address deben ser objetos si están presentes; si no lo son, se informa solo el grupo.
- Todas las cadenas se guardan sin espacios iniciales ni finales.
- Se informan todos los campos inválidos juntos, para que el frontend pueda mostrarlos a la vez.
- id, _id, password y cualquier otro campo se ignoran sin rechazar la solicitud. Así el formulario actual, que envía password, sigue funcionando.
- No hay reglas de unicidad de email ni de username.

Valores de los opcionales ausentes, aplicados por persistencia y comprobados por las pruebas del servicio:

| Campo | Valor |
|---|---|
| name.lastname | "-" |
| username, address.street, address.number, address.zipcode | "" |
| address.number numérico | Se guarda como cadena, por ejemplo 123 → "123". |

## Verificaciones

Pruebas locales en `test/servicios.test.js`, con un modelo controlado y con el modelo real sobre una colección en memoria. No requieren Atlas.

```powershell
cd server
npm test
```

Cubren casos válidos (datos del formulario actual, opcionales ausentes, espacios, número de dirección), inválidos (cuerpo, obligatorios, email, tipos de opcionales y grupos, ids malformados sin acceso a persistencia), inexistentes (consulta y eliminación) y la propagación de fallos de persistencia e inesperados.

Resultados del 2 de octubre de 2026, Node.js 24.19.0:

- npm test: 26 pruebas aprobadas, 0 fallos (11 de persistencia y 15 de servicios).
- Comprobación real en Atlas con las operaciones del servicio, sobre la base compartida y con un cliente ficticio propio (`verificacion.servicios@example.com`), eliminado al finalizar:

```json
{
 "listadoInicial": 3,
 "alta": true,
 "consulta": true,
 "entradaInvalida": "ENTRADA_INVALIDA [\"email\",\"phone\",\"name.firstname\",\"address.city\"]",
 "idInvalido": "ID_INVALIDO",
 "baja": true,
 "consultaPosterior": "CLIENTE_NO_ENCONTRADO",
 "bajaRepetida": "CLIENTE_NO_ENCONTRADO",
 "listadoFinal": 3
}
```

El alta se hizo con los datos del formulario, más espacios sobrantes y un id impuesto: el cliente se creó con id generado, campos sin espacios y sin password. Los tres ejemplos compartidos no se modificaron. La comprobación no prueba la API HTTP ni la integración del frontend.

## Uso de IA

Implementación asistida por Claude Code (Claude Opus 5.5) a partir del change revisado: redacción del change, pruebas, código, ejecución de verificaciones y documentación. El responsable aprobó las decisiones del change y revisa el resultado antes de cada commit; la declaración completa está en el PR.
