# integracion-frontend Specification

## Purpose
Define el comportamiento observable de la integración del frontend con la API REST propia de clientes, asegurando consumo parametrizado por entorno, retiro de contraseñas comerciales y persistencia verificable.

## Requirements

### Requirement: Consumo parametrizado de la API de clientes
El frontend SHALL realizar todas las operaciones de consulta, creación y eliminación de clientes a través de la URL base provista por la variable de entorno `VITE_API_URL`, utilizando `http://localhost:3001/api/clientes` como valor por defecto, sin depender de FakeStoreAPI.

#### Scenario: Obtención de listado desde el backend propio
- **WHEN** el usuario navega a la sección de listado de clientes
- **THEN** el frontend solicita los registros mediante GET a la URL base configurada y renderiza la lista devuelta por el backend propio

#### Scenario: Consulta de cliente individual por ID
- **WHEN** el usuario accede al detalle de un cliente con un ID alfanumérico persistido
- **THEN** el frontend solicita GET a `<VITE_API_URL>/<id>` y muestra la información recuperada

### Requirement: Métrica de total de clientes en el Dashboard
El Dashboard SHALL obtener el número total de clientes consumiendo el servicio de clientes conectado al backend propio, eliminando cualquier llamada directa a FakeStoreAPI y preservando el tratamiento de estados de carga y error.

#### Scenario: Conteo de clientes en el panel de control
- **WHEN** un usuario administrador autenticado accede al Dashboard
- **THEN** el sistema consulta la API propia y actualiza la tarjeta de Clientes con el total de registros devueltos

#### Scenario: Fallo de conectividad en el Dashboard
- **WHEN** la API de clientes no se encuentra disponible durante la carga del Dashboard
- **THEN** el componente presenta un mensaje de alerta accesible sin interrumpir la visualización de las tarjetas de sectores

### Requirement: Desacople de contraseñas comerciales en creación y detalle
El sistema SHALL gestionar los datos comerciales de clientes sin requerir ni almacenar contraseñas ficticias en el flujo comercial, diferenciando los clientes comerciales de las cuentas de acceso administrativo.

#### Scenario: Creación de cliente desde el formulario comercial
- **WHEN** el usuario completa y envía el formulario de nuevo cliente con nombre, email, teléfono y ciudad válidos
- **THEN** el frontend envía la solicitud POST a la API propia omitiendo la propiedad password y recibe el cliente creado con su identificador persistente

#### Scenario: Visualización de ficha de cliente sin contraseñas
- **WHEN** se visualiza la ficha de un cliente existente
- **THEN** la pantalla expone los datos de contacto y campos de dirección disponibles omitiendo la sección o visualización de contraseña comercial

### Requirement: Eliminación de cliente y actualización de estado
El frontend SHALL permitir la eliminación de clientes mediante petición HTTP DELETE al backend propio cuando el rol del usuario conectado tenga permisos suficientes.

#### Scenario: Eliminación confirmada por usuario con permisos
- **WHEN** un usuario con rol Gerencia confirma la eliminación de un cliente desde su ficha de detalle
- **THEN** el frontend emite DELETE a `<VITE_API_URL>/<id>`, informa el resultado exitoso y redirige al listado de clientes
