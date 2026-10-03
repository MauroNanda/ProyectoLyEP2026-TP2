# Design

## Context

Ver `proposal.md` para el objetivo y `specs/controladores-clientes/spec.md` para requisitos. Base: `main` en `4be04b9`, con los issues #3 y #4 integrados. El backend usa JavaScript ESM, Node >=24 y `node:test`. Express todavía no está instalado; su setup pertenece a #6.

El usuario autorizó avanzar con el diseño presentado en el análisis: controladores `(req, res, next)`, respuestas de éxito y propagación al middleware común. Solicitó únicamente backend y conservar commits, push y PR bajo su control.

## Goals / Non-Goals

**Goals:** adaptadores pequeños, probables sin servidor ni Atlas, con un único dueño de la respuesta por solicitud y compatibles con los servicios reales.

**Non-Goals:** registrar rutas, definir el servidor/middleware de #6, modificar servicios/modelos, implementar validaciones de negocio o añadir dependencias.

## Decisions

### Módulo y funciones

`server/controllers/clientes.js` exportará `listarClientes`, `obtenerClientePorId`, `crearCliente` y `eliminarCliente`, todas asíncronas con firma `(req, res, next)`. También exportará `crearControladoresClientes(servicio)`, siguiendo la fábrica usada en servicios y persistencia. Las exportaciones normales usarán el servicio real; la fábrica permite comprobar los controladores con dependencias controladas sin reemplazar módulos.

Se leerá `req.params.id` sin conversión y `req.body` sin validar ni normalizar otra vez. Las respuestas JSON contendrán directamente el resultado del servicio. La eliminación esperará la finalización del servicio antes de ejecutar `res.status(204).end()`.

Alternativa: importar servicios directamente sin fábrica. Dificulta aislar fallos y espera asíncrona. Alternativa: adaptador genérico parametrizado para todos los endpoints. Evita unos pocos bloques repetidos pero oculta operaciones y argumentos; se prefieren cuatro funciones explícitas por claridad.

### Un mecanismo de errores

Cada función captura rechazos y fallos síncronos del servicio y llama una sola vez a `next(error)` con el mismo error, sin enviar respuesta ni convertir el fallo en éxito. Así se conserva `code`, `message` y `campos` para el consumidor.

El controlador no serializa errores. El middleware de #6 deberá aplicar el contrato `{ error: { code, message } }`: `ENTRADA_INVALIDA`/`ID_INVALIDO` -> 400, `CLIENTE_NO_ENCONTRADO` -> 404, demás -> 500 con código y mensaje públicos seguros. No reenviar `error.message` o `stack` indiscriminadamente ni añadir `campos` al JSON sin coordinar un cambio de contrato.

Alternativa: responder errores en cada controlador. Duplicaría el trabajo del middleware y permitiría formatos diferentes entre endpoints. Alternativa: confiar solo en el manejo de promesas del framework. Ata la compatibilidad a la versión que elija #6; `try/catch` con `next` explícito evita esa dependencia.

La firma y el mecanismo son el contrato de esta contribución, aprobado por el usuario. No se afirma una aprobación del responsable de #6: debe revisarlo al conectar rutas y middleware. No se inventarán esas piezas para declarar integrada la API.

### Pruebas y secuencia

1. Escribir pruebas antes del controlador y comprobar el fallo por ausencia de implementación.
2. Implementar las cuatro operaciones con `await`, `try/catch` y respuestas acordadas.
3. Verificar llamada/argumentos, estados/cuerpos, listado vacío, espera asíncrona y que un fallo no envíe respuesta ni llame dos veces a `next`.
4. Usar además el servicio real con un modelo controlado para cubrir validación, inexistencia y campos comerciales sin Atlas.
5. Ejecutar toda la suite, validación estricta de OpenSpec, comprobación de sintaxis y revisión del alcance.

Los objetos `req`, `res` y `next` son dobles de prueba del borde HTTP. El modelo controlado existe solo dentro de las pruebas; no sustituye Atlas en producción. No se implementa middleware ficticio para fingir una API completa.

## Risks / Trade-offs

- [Middleware #6 ausente] -> dejar contrato documentado y la integración HTTP explícitamente pendiente; no archivar el change ni cerrar el issue automáticamente.
- [Errores internos expuestos durante la integración] -> los controladores nunca serializan errores; #6 debe comprobar mensajes públicos seguros en respuestas 500.
- [Pruebas locales confundidas con integración real] -> registrar sus límites; no afirmar verificación de Express, CORS o Atlas.
- [Aporte individual sin commits] -> entregar los archivos sin staging ni commits, con una guía de dos avances semánticos para que el usuario los revise y registre.
