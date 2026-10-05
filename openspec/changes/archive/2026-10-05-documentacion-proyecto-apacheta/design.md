## Context

Ver proposal.md para motivación y alcance. El estado integrado fue comprobado con Git el 2026-10-04: `main` y `origin/main` en `e5079f5`, frontend #15, seguridad backend #14, identidad #13 y las cinco áreas técnicas #8–#12. La rama documental parte de esa base y no tiene dependencia funcional pendiente.

Exploración: README raíz de 21 líneas centrado en arranque; detalles repartidos entre client/README, server/README, server/documents, PRODUCT, DESIGN, specs y evidencias OpenSpec. `server/README.md` y el apartado Estado y transición de `server/documents/seguridad.md` aún presentan la integración frontend como pendiente. El change visual mantiene una tarea abierta de evaluación, pese al merge del código: no declarar todos los changes cerrados ni cumplimiento WCAG completo.

La memoria de LyEP del 2026-09-17 contiene el registro metodológico del estudio simulado y el análisis del TP1. Se recuperó además del chat del 2026-10-01 el enunciado completo del TP2 proporcionado por el usuario. Esa referencia distingue cuatro puntos: Lean Canvas de nueve bloques, estudio simulado con tres prompts, proyecto informático y evolución técnica. Los cinco commits exigidos en el antecedente del TP1 no sustituyen los dos indicados para el punto técnico del TP2.

Enlace académico recuperado: https://docs.google.com/document/d/109X2vP-VzaDP5os7oULu-7fnR0H1Idj8MN_xPvwOFiI/edit?tab=t.0. Identificación prevista: TP02LyEP2026Grupo15. Antecedente de presentación del producto: https://docs.google.com/presentation/d/1sSn5naMXwgjRABN0CGozVunVdoHAvRK7jiCnmhbd6A4/edit. Los contenidos actuales de estos recursos externos no se consultaron ni se modificarán en esta tarea; no inferir su grado de completitud por existir un enlace.

## Goals / Non-Goals

**Goals:** un lector nuevo puede comprender qué problema aborda Apacheta, qué está disponible, cómo ejecutarlo y verificarlo, quién aportó qué con evidencia y qué información permite defender el trabajo. README sirve como síntesis reutilizable y mapa documental, con explicación suficiente sin duplicar contratos extensos.

**Non-Goals:** convertir README en la entrega completa de los cuatro puntos, completar presupuestos o horas mediante suposiciones, copiar conversaciones privadas, certificar seguridad/accesibilidad o cerrar el TP2 por el cierre de documentación. No editar código, contratos ni el documento académico externo.

## Decisions

### 1. Una entrada principal con detalles enlazados

Decisión propuesta: mejorar README raíz. Conservar los README por subsistema como referencias operativas y limitar cambios en backend a los textos de transición contradictorios. Alternativa descartada: otro informe largo que replique README y evidencias, porque aumenta mantenimiento y dispersión. No incorporar generadores, badges de resultados no automatizados ni dependencias para Markdown.

### 2. Estructura editorial prevista

1. **Apacheta y resumen ejecutivo:** nombre, Grupo 15, contexto de la materia y síntesis de 3–5 oraciones. Producto orientado a distribuidoras del NOA, con CRM como complemento del ERP; distinguir propósito de largo plazo de operaciones disponibles.
2. **Problema, justificación y objetivos:** explicar por qué evolucionó el prototipo y qué resuelve hoy; objetivos verificables de API propia, persistencia y continuidad funcional, sin presentar escenarios simulados como entrevistas reales.
3. **Alcance y funcionamiento:** directorio comercial, acceso, cuentas y auditoría; matriz corta por rol; sesiones en memoria y recarga; exclusiones y visión futura claramente identificadas.
4. **Arquitectura y estructura:** diagrama Mermaid pequeño de navegador/API/Atlas, carpetas y responsabilidades de modelos, servicios, controladores, rutas/middleware y frontend. Enlazar Swagger, specs y documentación técnica; evitar listados completos de endpoints duplicados.
5. **Arranque breve:** requisitos, dos terminales y cuenta activa. Configuración avanzada y siembra permanecen en las guías de subsistemas, sin detallar IP ni variables accesorias en el README.
6. **Validación del resultado:** pruebas locales, E2E y circuito integrado, con alcance y fecha. Comandos esenciales y modo UI para reproducir; datos de aislamiento y verificaciones adicionales en las guías y evidencia.
7. **Evolución y aportes:** TP1/migración → capas backend → integración → identidad → seguridad → frontend autenticado. Cada contribución indica alcance, responsable respaldado por rama/PR, fundamento y evidencia; historial de merges acredita integración, no autoría individual del código. Verificar detalles de PR si se afirma su contenido, no reconstruirlos solo del título.
8. **Organización y proyecto informático:** actividades, secuencia/dependencias y equipo humano con apoyo de IA. Horas, calendario de trabajo, costos y presupuesto solo cuando existan datos confirmados; de otro modo declarar disponibilidad pendiente y enlazar la sección académica. La semana del plan docente es referencia, no duración medida de cada integrante. Un resumen basado en fechas de commits no equivale a esfuerzo real.
9. **Uso de IA y validación humana:** herramienta, asistencia en análisis/planificación/código/tests/documentación, decisiones humanas y evaluación efectivamente registrada. Prompts originales/evolución pertenecen al registro metodológico; enlazar ese registro si está disponible, sin recrear textos faltantes ni volcar todo el chat.
10. **Evidencia, límites y relación con el TP2:** localizar Lean Canvas, estudio simulado, proyecto informático y aporte técnico dentro del documento académico; fuente numerada y enlaces directos a PR, changes y evidencias. Indicar pendientes del alcance y del registro, sin declarar cumplimiento total de la entrega.

### 3. Fuentes y nivel de certeza

Precedencia para estado técnico: código/scripts/specs y Git actual → evidencia fechada → documentación contemporánea → memoria y antecedentes. El ROADMAP y config conservan texto histórico sobre backend pendiente: no usarlo como estado actual ni reescribirlos incidentalmente. El enunciado recuperado respalda la estructura académica, mientras las memorias orientan presentación y trazabilidad.

Fuentes de inicio para implementación:

1. README, PRODUCT y DESIGN del repositorio: propósito, público y sistema visual.
2. client/README, server/README, package.json y .env.example de ambos subsistemas: ejecución y comandos.
3. server/documents y openspec/specs: contratos, persistencia, permisos y arquitectura; cualquier contradicción se resuelve contra implementación actual.
4. Changes archivados y `identidad-visual-apacheta/verification.md`: resultados con fecha, alcance y limitaciones.
5. `git log`, ramas del equipo y PR #1, #2, #8–#15: procedencia y aportes. No atribuir todos los merges al coordinador como trabajo individual.
6. Enunciado TP2 y notas del usuario del 2026-10-01, ROADMAP y memorias metodológicas: expectativas académicas y antecedentes, distinguiendo referencias históricas de requisitos funcionales actuales.

No publicar rutas personales de memorias/sesiones en README ni secretos de .env. Las cuentas de demostración conocidas se describen como datos ficticios optativos; nunca publicar la contraseña del administrador utilizado para crearlas.

### 4. Formato reutilizable y control de calidad

Markdown estándar con índice, títulos legibles, párrafos breves, listas y tablas solo para comparaciones útiles. Presentar fuentes como lista numerada, no una tabla de URLs. Mantener narrativa que pueda trasladarse a Google Docs; una eventual versión de texto plano corresponde a otro pedido, sin añadir duplicados aquí. No recrear los tres prompts del estudio de mercado en la guía técnica.

Aprobación requiere: secciones previstas cubiertas o ausencia de datos indicada; cada funcionalidad/aporte relevante respaldado; comandos coinciden con scripts vigentes; enlaces/rutas/anchors resolubles; contenidos legibles en preview; ausencia de secretos y contradicciones de integración. Registrar qué se comprobó y qué se heredó de evidencia previa. Esta tarea documental no necesita tests nuevos ni siembra permanente; las capturas utilizan exclusivamente datos temporales aislados según la decisión 6.

### 5. Visualizaciones al servicio de la narrativa

Refinamiento solicitado el 2026-10-05: facilitar consumo sin perder valor técnico. La lectura avanza de propósito a funcionamiento, ejecución y evidencia; cada sección comienza con una explicación breve, utiliza un recurso visual cuando aclara relaciones y termina con el detalle o enlace necesario. No convertir el documento en una sucesión de cuadros sin argumento.

Tres recursos previstos:

- **Arquitectura en Mermaid:** responder dónde vive cada responsabilidad y cómo viaja una solicitud. Mostrar frontend, API Express con rutas/middleware, controladores y servicios, persistencia y Atlas. Etiquetar HTTP/JSON y Bearer en solicitudes protegidas; login público como excepción en el texto. No representar una integración ERP existente: es parte de la visión. Mantener pocos nodos y describir el recorrido debajo.
- **Evolución por hitos:** responder qué cambió respecto del TP1 y por qué. Usar una secuencia breve de migración, persistencia/API, integración e identidad, seguridad e integración de cuentas; enlazar los PR correspondientes y señalar estados documentales pendientes. Puede ser una lista visual de hitos si comunica mejor que otro diagrama. Las flechas expresan evolución, sin inventar dependencias estrictas entre trabajos paralelos. Fechas solo verificadas; no convertirlas en horas de trabajo ni Gantt estimado.
- **Matriz de permisos:** responder qué puede hacer cada rol con filas por acción y columnas por rol, usando Sí/No explícitos. Acompañar con la explicación de autoridad del backend, estados activos y revocación, conservando diferencias entre clientes comerciales y cuentas internas.

Un esquema corto de login → operación → logout solo se agrega si revela una duda que los recursos anteriores no resuelven. Las capturas de pantallas reales forman parte de la presentación prevista: elegir aproximadamente tres vistas representativas, preferentemente Inicio, Clientes e Historial administrativo; sumar Cuentas o una variante móvil solo si aporta una diferencia relevante. Una imagen principal acompaña la introducción y las restantes se colocan junto al flujo explicado o dentro de una galería desplegable. Cada captura lleva descripción, texto alternativo e identificación de datos ficticios. No generar imágenes decorativas ni gráficos de porcentajes, costos o esfuerzo sin datos.

Mermaid y Markdown mantienen los diagramas editables y versionables, sin nuevas dependencias. GitHub admite bloques Mermaid en archivos Markdown; revisar sintaxis compatible y render, sin asumir que todos los previews o Google Docs lo interpretan. Cada diagrama conserva su descripción textual. Las capturas PNG son evidencia de interfaz real, no una exportación del diagrama ni una imagen generada. No modificar el documento externo.

Control visual: comprobar legibilidad de etiquetas y flechas, ausencia de información expresada solo por color, correspondencia exacta con código/specs/hitos y utilidad de cada recurso. La validación de un gráfico no acredita nuevas pruebas funcionales.

### 6. Presentación nativa de GitHub y capturas con Playwright

Usar identidad existente, resumen, índice y captura de producto. Galería secundaria con <details>/<summary>, imágenes relativas y texto alternativo. Mantener visibles propósito, resolución y evidencia. Sin emojis, badges ni alertas innecesarias; los detalles operativos se enlazan.

Playwright ya está instalado. Para capturas nuevas, reutilizar el patrón de preparación/aislamiento de client/e2e/fixtures.js con un helper temporal fuera del código versionado: API real, Vite y datos comerciales/cuentas ficticios en cinco colecciones temporales propias, sin alterar la base compartida ni sus cuentas de demostración. Esperar cargas y estados estables antes de capturar; cerrar procesos y eliminar exactamente esas colecciones al terminar. Si una captura archivada es suficiente, referenciarla con su fecha sin modificar su evidencia histórica.

Guardar únicamente las nuevas imágenes finales revisadas en `docs/assets/readme/`; inspeccionar contenido y peso, limitar recortes a capturas directas de página/elemento y verificar texto alternativo y enlaces. No publicar .env, URI, hashes de claves/tokens, trazas completas o terminales con credenciales. Registrar viewport, pantallas, fecha/origen y limpieza en verification.md. Estas imágenes acreditan presentación observada, no reemplazan pruebas de persistencia o permisos.

Referencias oficiales consultadas el 2026-10-05:

1. Diagramas en GitHub: https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams
2. Imágenes, rutas relativas y alertas: https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax
3. Secciones desplegables: https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-collapsed-sections

### 7. Enfoque editorial final: resolución y respaldo

Revisión solicitada por el usuario el 2026-10-05: el README debe explicar el problema, cómo se resolvió, las decisiones, los aportes individuales y la evidencia que respalda el resultado. Retirar la guía de consultas MongoDB, habilitación de IP, parámetros de URL de pantallas, UUID, hashes, nombres extensos de changes y detalles del verificador de la narrativa principal. Los enlaces conservan destinos técnicos pero usan títulos descriptivos.

Mantener arquitectura, permisos, capturas, resultados de pruebas y vínculo con los cuatro puntos académicos. Las fechas permanecen en los registros de evidencia; no en títulos ni descripciones del README. Presentar una fila por integrante, agrupando sus responsabilidades, y enlazar el historial de PR como respaldo conjunto. Reducir instalación y pruebas a comandos esenciales, con enlaces a guías por subsistema. Sin emojis ni alertas innecesarias. Esta decisión sustituye el tutorial de base de datos y los procedimientos operativos extensos previstos en la versión inicial.

## Risks / Trade-offs

- README excesivo → síntesis por sección y enlaces al detalle técnico, sin repetir todas las specs.
- Memoria o texto histórico presentado como actualidad → verificación Git y fecha/alcance de cada evidencia.
- Costos, tiempos o aportes inventados → usar datos respaldados; declarar pendientes sin números supuestos.
- Integración confundida con cierre → mostrar identidad integrada con evaluación pendiente; no marcar tareas ajenas.
- Afirmar toda la consigna cumplida → distinguir aporte técnico de puntos académicos externos no inspeccionados.
- Filtrar credenciales o contenido privado → ejemplos sanitizados y revisión del diff; no copiar .env ni chats.

## Migration Plan

Tras aprobación, releer fuentes y alcance, redactar README y ajustar dos textos de transición, validar enlaces/comandos/preview y registrar revisión. No alterar ejecución ni migrar datos. Cualquier publicación requerirá autorización propia; rollback documental conserva el código intacto. No crear commits, push ni PR durante esta propuesta.

## Open Questions

Al redactar, contrastar nombres completos, aportes y si existen tiempos/costos confirmados en las fuentes académicas autorizadas. La falta de estos datos se representa explícitamente y no impide producir la síntesis técnica. No se considera pendiente una nueva decisión de stack, permisos o alcance funcional.
