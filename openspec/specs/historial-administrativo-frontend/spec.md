# historial-administrativo-frontend Specification

## Purpose
Ofrecer al Administrador una consulta de auditoría de solo lectura, con filtros y navegación por el cursor del backend, preservando datos históricos y estados accesibles.
## Requirements
### Requirement: Consulta y filtros administrativos
Historial administrativo SHALL usar GET /api/auditoria solo para Administrador con tipo, actorId, desde/hasta ISO con hora y limit 1–100 (50 inicial), sin filtros Mongo arbitrarios. SHALL validar intervalo, convertir fechas a UTC y mostrar errores por campo/carga/vacío/error recuperable.

#### Scenario: Intervalo y actor
- **WHEN** se aplican fechas válidas y actorId de una cuenta
- **THEN** se envían filtros permitidos con fechas ISO y se muestran items recibidos.

#### Scenario: Intervalo inválido
- **WHEN** desde es posterior a hasta
- **THEN** se señalan fechas sin enviar la consulta inválida.

### Requirement: Paginación opaca coherente
La vista SHALL seguir nextCursor sin decodificarlo, permitir regresar mediante pila de cursores y detener Siguiente cuando sea null. SHALL reiniciar paginación al aplicar filtros/limit o actualizar, ignorar respuestas de consultas anteriores y no inventar totales/páginas numéricas.

#### Scenario: Continuación y final
- **WHEN** la respuesta contiene nextCursor y se solicita Siguiente
- **THEN** se envía ese cursor con los mismos filtros y se detiene avance al recibir null.

#### Scenario: Nuevo filtro y respuesta tardía
- **WHEN** se aplica un filtro mientras una consulta anterior sigue pendiente
- **THEN** se solicita la primera página y se ignora la respuesta anterior.

### Requirement: Datos históricos sin acciones de escritura
La vista SHALL mostrar fecha con zona explícita, tipo, actorId/rol histórico, recurso/recursoId, resultado, requestId y camposModificados disponibles. SHALL representar actor nulo sin inventar identidad y no SHALL ofrecer edición, eliminación, exportación ni contenidos secretos.

#### Scenario: Login fallido sin actor
- **WHEN** un evento LOGIN_FALLIDO tiene actorId nulo
- **THEN** se muestra Sin actor identificado sin correo supuesto ni acción de modificar evento.

### Requirement: Aplicación explícita de filtros
Editar filtros SHALL modificar solo el borrador; Actualizar historial SHALL validar y aplicar juntos los filtros. Limpiar filtros SHALL aplicar valores iniciales.

#### Scenario: Edición sin consulta intermedia
- **WHEN** se editan fechas o cantidad sin aplicar
- **THEN** no se envía una consulta y se conservan los resultados de los filtros aplicados.
