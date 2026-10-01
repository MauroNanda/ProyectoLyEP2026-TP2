## Purpose

Proporcionar acceso compartido a MongoDB Atlas y un ciclo de conexión verificable para el servidor y los procedimientos de persistencia.

## ADDED Requirements

### Requirement: Configuración externa y errores seguros
El sistema SHALL requerir configuración externa de conexión y nombre de base, sin versionar secretos ni incluirlos en mensajes visibles.

#### Scenario: Configuración ausente
- **WHEN** falta una variable obligatoria al solicitar conexión
- **THEN** la apertura falla con un error que identifica la variable sin revelar secretos

#### Scenario: Atlas inaccesible
- **WHEN** la apertura no puede comprobar acceso a Atlas
- **THEN** se informa fallo sin simular una conexión válida ni imprimir credenciales

### Requirement: Conexión reutilizable
El sistema SHALL ofrecer una conexión compartida a los consumidores dentro del proceso y SHALL permitir cierre explícito y nueva apertura.

#### Scenario: Solicitudes simultáneas
- **WHEN** varios consumidores solicitan apertura simultáneamente
- **THEN** comparten el acceso inicializado sin crear conexiones independientes por consumidor

#### Scenario: Cierre y nueva apertura
- **WHEN** se cierra la conexión y se solicita nuevamente
- **THEN** la conexión anterior queda liberada y se obtiene acceso utilizable a la misma base

#### Scenario: Uso antes de apertura
- **WHEN** un consumidor intenta usar la base sin apertura satisfactoria
- **THEN** recibe un error explícito, sin resultados ficticios

#### Scenario: Reintento después de fallo
- **WHEN** una apertura falla y posteriormente se solicita abrir con acceso válido
- **THEN** puede establecerse conexión sin reutilizar el estado fallido
