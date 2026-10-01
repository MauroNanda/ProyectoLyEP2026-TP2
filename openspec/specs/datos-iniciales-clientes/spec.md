# datos-iniciales-clientes Specification

## Purpose

Proporcionar ejemplos ficticios reproducibles para demostrar gestión de clientes, sin duplicar registros ni destruir datos existentes.

## Requirements

### Requirement: Carga explícita e idempotente
La carga inicial SHALL ejecutarse solo por petición explícita y SHALL insertar ejemplos ausentes sin borrar, duplicar ni sobrescribir registros existentes.

#### Scenario: Primera carga
- **WHEN** se ejecuta la carga y los ejemplos no existen
- **THEN** se incorporan clientes ficticios compatibles con el contrato y sin contraseñas

#### Scenario: Repetición de carga
- **WHEN** se vuelve a ejecutar con los ejemplos ya presentes
- **THEN** no aumenta la cantidad de registros por duplicación

#### Scenario: Registro existente modificado
- **WHEN** se carga un ejemplo cuyo identificador ya existe con cambios
- **THEN** el registro existente se conserva sin sobrescritura

#### Scenario: Apertura normal
- **WHEN** se abre la conexión para uso normal
- **THEN** no se cargan ejemplos ni se reinicializa la colección automáticamente
