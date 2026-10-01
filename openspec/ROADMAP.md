# Dirección de desarrollo y coordinación del TP2

Referencia: 1 de octubre de 2026. Documento para revisión del equipo.

## Propósito y uso

Esta guía permite que cualquier integrante y su agente entiendan el objetivo, el estado de referencia y qué change proponer para su responsabilidad. No es un change implementable completo ni una asignación de personas. Se mantienen cinco áreas; el coordinador asignará los integrantes mediante issues detallados.

Flujo acordado: roadmap → issue asignado → change del integrante → revisión → implementación → PR. El issue delimita la tarea; el change desarrolla su propuesta técnica sin ampliar unilateralmente el alcance.

Antes de actuar, verificar el repositorio y los changes actuales. Este documento es una referencia fechada, no prueba de estado vigente en futuras sesiones. Las instrucciones del usuario prevalecen sobre la guía.

## Objetivo general y primer hito

El proyecto plantea un CRM para necesidades de empresas regionales, como complemento de un ERP. El TP2 reúne Lean Canvas, estudio simulado de mercado, proyecto informático y evolución técnica del prototipo del TP1.

La dirección técnica es sustituir la API pública por un backend propio con datos persistentes, preservar el frontend y establecer una base ampliable. Cumplir la consigna académica es el primer hito, no el límite definitivo del producto. Las ampliaciones posteriores requieren propuestas y validación propias.

El documento académico TP02LyEP2026Grupo15 registra aportes individuales y fundamentos para la defensa. Esta guía no reemplaza sus cuatro puntos ni acredita su cumplimiento. No se verificó aquí el contenido vigente del Google Doc.

## Estado de referencia comprobado

- Repo del equipo: https://github.com/MauroNanda/ProyectoLyEP2026-TP2.
- PR #1 de migración fusionado en main, commit ef5c595.
- client/ contiene React/Vite migrado del TP1; server/ todavía no existe.
- clientesService.js consume FakeStoreAPI para listado, consulta individual, creación y eliminación.
- Dashboard.jsx consulta FakeStoreAPI directamente para contar clientes. También debe contemplarse en la integración.
- La autenticación del frontend es simulada, sin autorización real de backend comprobada.
- OpenSpec 1.7.0 tiene integraciones Codex, Claude y Antigravity; inicialización registrada en 1ce4781.
- Protección de main confirmada por el usuario: PR, una aprobación, invalidación tras nuevos commits y bloqueo de force push y eliminación. No se consultó mediante API en esta revisión.
- No se ejecutaron verificaciones funcionales del frontend en esta revisión. El README registra comprobaciones anteriores y problemas heredados.

## Criterios del hito académico

Fecha límite indicada: domingo 11 de octubre de 2026.

1. client/ funciona sin errores en localhost:5173 y conserva funcionalidades y mejoras del TP1.
2. server/ responde en localhost:3001 y ofrece las operaciones que necesita el cliente.
3. Los datos persisten en MongoDB Atlas, una de las alternativas admitidas por la cátedra. Un arreglo en memoria o un endpoint de salud no cumplen la persistencia.
4. El frontend utiliza la API propia en todos los consumidores de FakeStoreAPI, incluido el dashboard.
5. Cada integrante publica su rama feature/ con nombre y apellido y al menos dos commits semánticos descriptivos.
6. Los PR al repo del equipo incluyen qué se hace, cómo, archivos modificados, referencia al issue cuando corresponda y declaración de IA: herramienta, asistencia y evaluación humana.
7. Se documentan ejecución, verificaciones y aportes individuales.

El plan docente menciona deploy, pero el trabajo actual se organiza alrededor de los controles locales suministrados. El despliegue queda como evolución futura opcional, para una etapa muy posterior si se decide abordarlo; no es prioridad ni una tarea de los cinco changes actuales. Esta decisión de alcance no modifica el enunciado docente.

El prototipo leído requiere listado, detalle, creación y eliminación. No se detectó edición de clientes; incorporarla requiere acordar su alcance. La expresión “API REST completa” debe interpretarse y validarse con la cátedra si implica operaciones adicionales.

## Arquitectura y contratos compartidos

Dirección acordada: client/ React/Vite → API REST Node.js + Express en JavaScript en server/ → MongoDB Atlas.

Decisiones adoptadas:

- MongoDB Atlas: se elige una única base documental para trabajar con estructuras cercanas a los datos del frontend y evitar incorporar otro ecosistema al backend. La elección prioriza sencillez para este equipo; no implica que siempre sea más simple que Firestore. Sigue requiriendo configurar conexión y acceso.
- JavaScript + Express: comparte lenguaje con el frontend y evita añadir TypeScript a esta etapa.
- Recurso HTTP /api/clientes: expresa el dominio del proyecto. Contempla GET /api/clientes, GET /api/clientes/:id, POST /api/clientes y DELETE /api/clientes/:id. El cambio de URL corresponde al área de integración.
- Identificador público id como cadena, adaptado desde el identificador de MongoDB: evita gestionar una secuencia numérica. Verificar compatibilidad con navegación y consumidores.
- Datos ficticios propios: un conjunto pequeño, reproducible y suficiente para verificar búsqueda, detalle, alta y baja; no copiar datos reales de personas.
- Clientes comerciales separados de usuarios de acceso. Las credenciales simuladas no forman parte del modelo comercial persistente. La integración debe ajustar la ficha y el formulario que actualmente muestran o envían password, preservando las demás funcionalidades. La autenticación real queda para evolución posterior.
- Documentación técnica y evidencias en el repositorio; participación, decisiones y enlaces en el documento académico.

Estas decisiones fijan la dirección, no prueban una implementación. No introducir una segunda base ni abstracciones adicionales sin necesidad acordada.

| Operación actual | Contrato a conservar |
|---|---|
| Listado | Arreglo de clientes con identificadores estables. |
| Consulta | Cliente localizado por el id usado en la navegación. |
| Creación | Aceptar el formulario actual y devolver al menos el id creado. |
| Eliminación | Eliminar el cliente identificado y comunicar el resultado por HTTP. |

Las pantallas consumen id, email, phone, username, name.firstname, name.lastname y address.city. El detalle también presenta address.street, address.number, address.zipcode y password. El formulario no aporta toda la dirección y envía una contraseña ficticia. Este es el contrato observado, no una obligación de persistir credenciales. Los issues deben precisar cómo retirar password del flujo comercial y representar los campos de dirección ausentes sin romper las pantallas. Conservar los demás campos consumidos mientras no se acuerde otra adaptación.

El backend devuelve id como cadena derivada del identificador de MongoDB, utilizable en rutas. No devolver solo _id u otro identificador incompatible.

Antes de implementar por partes, detallar en los issues cuerpos, respuestas, códigos HTTP, errores y validaciones de las rutas acordadas. Precisar también interfaces entre persistencia, servicios y controladores. El uso del driver de MongoDB o de una biblioteca de modelos se definirá en el issue de persistencia. Registrar contratos en el change responsable y referenciarlos desde los dependientes.

Contrato HTTP acordado para detallar los issues:

| Solicitud o condición | Resultado |
|---|---|
| GET /api/clientes | 200 y arreglo de clientes; [] cuando no haya registros. |
| GET /api/clientes/:id | 200 y cliente; 404 cuando no exista. |
| POST /api/clientes | 201 y cliente creado, incluido id. |
| DELETE /api/clientes/:id | 204 sin cuerpo; 404 cuando no exista. |
| Identificador o entrada inválidos | 400 con error descriptivo. |
| Error inesperado | 500 con mensaje sin secretos ni detalles internos. |

Formato de error común: { "error": { "code": "...", "message": "..." } }. Los issues deben definir los códigos de error, campos obligatorios y valores compatibles para campos opcionales. El login simulado del prototipo se conserva; retirar credenciales del cliente comercial no significa implementar o eliminar el sistema de acceso.

## Cinco áreas de trabajo

Adaptación de la sugerencia docente: modelos, servicios, controladores, rutas/middleware e integración/documentación. Las áreas orientan changes independientes, coordinados mediante contratos. Cada una puede originar un change; subdividir solo por una razón acordada.

| Área y change orientativo | Responsabilidad | Dependencias | Criterio de aceptación |
|---|---|---|---|
| Modelos y conexión: modelos-persistencia-clientes | Modelo, conexión a MongoDB Atlas, configuración por entorno y acceso persistente. | Contrato de cliente y acceso al entorno Atlas. | Crear, consultar y eliminar datos; comprobar conservación tras reiniciar servidor. |
| Servicios: servicios-clientes | Casos de uso y reglas acordadas; coordinación con persistencia. | Interfaz de modelos. | Operaciones cumplen contratos y distinguen resultados válidos de errores previstos. |
| Controladores: controladores-clientes | Traducir entradas HTTP a llamadas de servicios y construir respuestas. | Contratos HTTP y de servicios. | Respuestas compatibles, códigos y errores consistentes. |
| Rutas y middleware: servidor-rutas-middleware | Setup, puerto 3001, rutas, JSON, CORS y tratamiento transversal. | Contrato HTTP; controladores para conectar flujos. | Servidor ejecutable y rutas integradas; acceso desde localhost:5173 según contrato. |
| Integración y documentación: integracion-frontend-verificacion | Conectar consumidores del frontend, verificar conjunto y documentar. | API y persistencia disponibles. | Listado, búsqueda, detalle, alta, baja y contador operativos; persistencia e instrucciones comprobadas. |

Límites para evitar solapamientos:

- Modelos posee esquema y conexión; servicios posee reglas de negocio. Distribuir explícitamente validación y normalización.
- Controladores adapta resultados a HTTP; rutas/middleware registra endpoints y trata errores comunes. Acordar un formato de errores.
- Rutas/middleware coordina bootstrap y server/package.json; los demás acuerdan cualquier edición compartida.
- Integración posee los ajustes necesarios en client/, sin rediseñar pantallas ni ampliar funciones por conveniencia.
- Cada área verifica y documenta su contribución. La quinta reúne las comprobaciones del conjunto; no absorbe todas las pruebas.

La conexión a Atlas pertenece al change modelos-persistencia-clientes: configuración por entorno, apertura y cierre de conexión, modelo y acceso a datos. Preparar el entorno externo de Atlas es un prerrequisito operativo de esa área, no un sexto change ni una asignación personal en este documento.

El change servidor-rutas-middleware consume esa conexión y coordina su ciclo de vida con el arranque y cierre del servidor. No crea otra conexión paralela ni implementa el modelo. El change de persistencia puede verificar sus operaciones con un procedimiento independiente de Express; no necesita implementar rutas o todo el servidor para comprobar acceso real a Atlas.

Los issues deben fijar la interfaz de conexión y las operaciones de persistencia (listar, buscar por id, crear y eliminar), qué resultados representan ausencia de datos y cómo se propagan errores. Servicios valida y normaliza entradas; controladores traduce resultados a HTTP; middleware trata fallos comunes. La implementación concreta y nombres de módulos se precisan antes de delegar.

Orden orientativo: contratos → setup/modelos → servicios → controladores/rutas → integración/verificación. Se pueden redactar propuestas en paralelo; implementar según dependencias. No duplicar archivos compartidos ni crear stubs sin coordinación.

## Orden sugerido para proceder

1. Revisar roadmap y configuración en la rama actual. Tras validación y autorización explícita, crear el commit de documentación, publicar la rama, abrir un PR completo y obtener la aprobación antes de fusionar a main. Cada acción Git conserva su autorización correspondiente.
2. Preparar los cinco issues con contratos consistentes, archivos previstos, exclusiones y criterios de aceptación; vincular sus dependencias y asignarlos fuera de este documento. No duplicar la preparación de Atlas en issues distintos.
3. Preparar el entorno Atlas: acceso al servicio, usuario de base de datos, acceso de red y configuración de conexión privada. La URI y credenciales quedan fuera de Git.
4. Desde main actualizado, iniciar una nueva rama feature/ para el issue de modelos y persistencia. Proponer su change, revisarlo e implementar solo tras autorización. La conexión a Atlas forma parte de este change.
5. Coordinar el bootstrap de server/ con el issue de rutas/middleware antes de editar package.json o el lockfile. Puede adelantarse su setup y contrato, pero no declarar completa la API hasta integrar controladores y servicios. Si persistencia necesita dependencias antes del setup, acordar expresamente quién crea los archivos compartidos; no abrir un sexto change por defecto.
6. Implementar servicios sobre el contrato de persistencia; luego controladores y su integración con rutas/middleware. Cada contribución mantiene su change, rama, verificaciones y PR.
7. Integrar frontend y verificar el conjunto: consumidores de FakeStoreAPI, datos persistentes, navegación, búsqueda, alta/baja, contador y retiro de credenciales comerciales. Completar documentación técnica y registro académico.

No es necesario terminar los cinco issues en secuencia estricta. Sin Atlas se puede analizar, proponer y verificar servicios/controladores con dependencias controladas; la prueba de persistencia y la aceptación del conjunto requieren Atlas real. Una prueba con dobles no acredita integración ni autoriza sustituir Atlas por memoria en la entrega.

## Procedimiento para integrantes y agentes

1. Leer esta guía, config.yaml y el issue asignado; inspeccionar archivos pertinentes, git status, ramas y openspec list.
2. Tomar área y alcance del issue asignado por el coordinador. Si falta un issue o hay contradicciones, plantearlas antes de proponer; no asignar ni elegir trabajo automáticamente.
3. Identificar decisiones o contratos pendientes; no inventar acuerdos.
4. Usar openspec-propose para generar un change acotado con propuesta, diseño, specs y tareas según el esquema. Identificar el issue de origen y referenciar contratos de las áreas dependientes. No ampliar el issue sin validación.
5. Presentar artefactos para revisión. No convertir esta guía completa en una lista de implementación ni implementar sin autorización.
6. Verificar y registrar resultados reales, distinguiendo defectos, límites de entorno y pendientes externos.
7. Obtener validación y autorización explícita antes de cada commit. Push y PR requieren autorización para la acción.

Los dos commits exigidos deben expresar avances coherentes, sin divisiones artificiales para alcanzar un número. Los nombres orientativos no reservan responsabilidades ni constituyen aprobación.

## Contenido de los issues

El coordinador y su agente prepararán los issues antes de delegar. Cada issue debe precisar objetivo, alcance y exclusiones, archivos previstos, contratos de entrada/salida, dependencias, criterios de aceptación, verificaciones y documentación esperada, incluida la declaración de uso de IA. Los archivos previstos orientan el trabajo; cualquier ajuste necesario fuera de ese listado debe justificarse y revisarse si cambia el alcance.

Las decisiones compartidas deben ser consistentes entre los cinco issues. Si un contrato sigue pendiente, identificar quién lo define y qué tareas dependen de él; evitar que cada agente invente una alternativa incompatible.

## Registro del uso de IA

Esta sección establece la regla común; las intervenciones reales se registran por contribución, incluyendo planificación y documentación además del código.

- En el PR de cada integrante: issue de origen, herramienta utilizada, modelo si se conoce, asistencia recibida, archivos o artefactos afectados, decisiones humanas y cómo se revisó y verificó el resultado. Indicar pendientes o resultados no comprobados.
- En el punto 4 del documento académico: aporte individual, decisiones tomadas con asistencia de IA, enlaces al issue y PR, y evidencias relevantes para la defensa.
- En la documentación técnica del repo: instrucciones reproducibles y resultados de verificación a los que pueda enlazar el PR. No hace falta duplicar toda la declaración en cada archivo.

El roadmap describe el procedimiento, no acredita revisiones que no ocurrieron. No declarar pruebas, evaluación humana o funcionalidades como realizadas sin evidencia. La herramienta no sustituye la responsabilidad individual de comprender y defender el aporte.

## Reglas de colaboración

- Ramas feature/<tu-nombre-apellido>-<tarea>. Reemplazar el marcador por el nombre y apellido del integrante que realiza la tarea, en minúsculas y separados por guiones. No copiar el nombre de otro integrante.
- Commits descriptivos con feat, fix, refactor, docs o chore; nunca sin autorización y validación previa.
- Nunca push directo a main. Nunca PR sin descripción completa ni apertura, cierre o fusión no autorizados.
- Cambiar solo archivos relacionados con el alcance y preservar funcionalidades existentes.
- No configurar todavía checks obligatorios del frontend. Esto no elimina la verificación de funcionamiento.
- No versionar secretos de la DB; documentar variables con ejemplos sin credenciales.
- OpenSpec orienta a agentes, pero no impone permisos Git ni acredita implementaciones; siguen siendo necesarias protecciones y revisión humana.

## Prompt sugerido para tomar una tarea

Reemplazar los marcadores antes de enviarlo al agente. Proporcionar el enlace al issue y su descripción completa si el agente no puede acceder a GitHub. Este prompt inicia el análisis; no autoriza implementación, commits o publicación.

```text
Estoy trabajando en el repositorio ProyectoLyEP2026-TP2 del equipo.
Mi nombre y apellido son: <tu nombre y apellido>.
Mi tarea asignada es el issue <número y enlace>.
Descripción completa del issue:
<pegar objetivo, alcance, exclusiones, contratos, dependencias,
criterios de aceptación y verificaciones indicados en el issue>.

Leé openspec/ROADMAP.md y openspec/config.yaml. Analizá el estado
actual del repositorio: rama activa, cambios locales, estructura,
archivos relacionados, ramas y changes existentes y dependencias
de esta tarea. Distinguí el estado local, las referencias remotas
disponibles y lo que puedas comprobar actualmente en GitHub.
No tomes el roadmap, memorias o documentación histórica como
prueba de que una funcionalidad ya está implementada.

Explicame qué pide el issue, qué existe, qué falta, qué contratos
de otras tareas necesita y si hay solapamientos, contradicciones
o decisiones que requieren consulta. No amplíes el alcance ni
implementes soluciones provisionales para dependencias faltantes
sin acordarlo.

Primero presentame ese análisis y un alcance propuesto, sin
modificar archivos. Indicá también el nombre de rama adecuado:
feature/<mi-nombre-apellido>-<tarea>, usando mi propio nombre.
Después de mi revisión, te indicaré cuándo crear la rama y
generar el change de OpenSpec vinculado al issue. La propuesta
debe incluir diseño, specs y tareas según el esquema, con
criterios verificables y dependencias explícitas.

No implementes hasta que te autorice esa etapa. No hagas commits
sin mi validación previa y autorización explícita. No hagas push,
abras ni fusiones PR sin autorización para esa acción. Nunca
hagas push directo a main. Registrá la asistencia de IA y las
verificaciones reales para documentarlas luego en el PR y en
el documento académico.
```

## Evolución posterior propuesta

Después del hito, evaluar changes específicos para autenticación/autorización real de backend, edición y segmentación de clientes, historial de interacciones, integración con ERP y mejoras de despliegue, pruebas y operación.

Estas líneas mantienen una dirección de desarrollo, pero no son funciones aprobadas ni obligaciones actuales. El estudio de mercado debe fundamentar su prioridad y puede modificarlas o descartarlas. Cada avance requiere alcance, aceptación y validación propios.

## Pendientes de coordinación y especificación

- Preparar el entorno MongoDB Atlas y configurar accesos sin versionar secretos; la conexión de código corresponde al change de modelos y persistencia.
- Preparar los cinco issues con contratos HTTP e internos detallados y asignarlos por decisión del coordinador.
- Precisar biblioteca de acceso a MongoDB, datos ficticios iniciales y representación de campos ausentes.
- Detallar en el issue de integración el retiro de credenciales simuladas del flujo comercial.
- Revisar y vincular documento académico, registrando participación del equipo.
- Considerar deploy únicamente en una etapa futura si se decide abordarlo; sin tareas actuales ni prioridad en este hito.

Actualizar esta guía con decisiones validadas y evidencia fechada. Su existencia no acredita finalización de las áreas ni del TP.
