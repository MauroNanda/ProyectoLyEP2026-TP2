## Why

El README raíz de Apacheta permite arrancar el sistema, pero no explica de manera suficiente el proyecto, sus decisiones, la evolución del TP1 al TP2 ni la evidencia de los aportes del equipo. Consolidar esa información facilitará comprender, ejecutar y defender el trabajo, y reutilizar el contenido en el documento académico sin confundir lo implementado con la simulación o las estimaciones.

## What Changes

- Reorganizar `README.md` como entrada descriptiva al proyecto: resumen ejecutivo, denominación, problema y destinatarios, justificación, objetivos, alcance implementado y límites.
- Explicar arquitectura React/Vite → Express → MongoDB Atlas, responsabilidades por capa, funcionalidades y permisos de los tres roles; enlazar contratos y documentación especializada.
- Apoyar la narrativa con un diagrama de arquitectura, una evolución resumida por hitos y una matriz de permisos. Cada recurso responde una pregunta concreta y conserva explicación textual y enlaces al detalle técnico.
- Aprovechar la presentación nativa de GitHub: capturas reales obtenidas con Playwright, imágenes con rutas relativas y texto alternativo, índice/enlaces y detalles desplegables. Evitar emojis, alertas decorativas e identificadores internos en la narrativa.
- Priorizar problema, resolución, decisiones, aportes y evidencia. Conservar arranque y pruebas esenciales, enlazando las guías de subsistemas para configuración avanzada y siembra. No incluir tutoriales de consulta a MongoDB, habilitación de IP, UUID, hashes de commits ni detalles del helper de captura en el README.
- Presentar aportes agrupados por integrante, con una fila por persona y explicación de responsabilidades complementarias. Enlazar el historial de PR como respaldo conjunto, sin una enumeración que otorgue más espacio por cantidad de cambios. Mantener fechas y metadatos de validación en la evidencia, no en la narrativa del README.
- Registrar método de trabajo, asistencia de IA, decisiones y evaluación humana, pruebas y evidencia fechada, limitaciones y evolución futura.
- Conectar el README con los cuatro puntos del TP2. Resumir actividades y equipo híbrido; tiempos y costos únicamente como datos respaldados o estimaciones identificadas. Enlazar Lean Canvas, estudio simulado y proyecto informático sin recrear resultados no disponibles.
- Corregir únicamente las indicaciones de transición que contradigan el estado integrado en `server/README.md` y `server/documents/seguridad.md`; mantener contratos, instrucciones y antecedentes técnicos.

## Capabilities

### New Capabilities

Ninguna capacidad funcional nueva. Change exclusivamente documental, con `skip_specs: true`; criterios de aceptación en diseño y tareas.

### Modified Capabilities

Ninguna. Se describen las specs vigentes sin modificarlas ni ampliar contratos.

## Impact

Archivos previstos: `README.md`, capturas nuevas necesarias en `docs/assets/readme/`, ajustes puntuales de coherencia en `server/README.md` y `server/documents/seguridad.md`, y los artefactos/evidencia de este change. Reutilizar capturas existentes cuando representen el estado actual sin duplicarlas. `client/README.md`, `PRODUCT.md`, `DESIGN.md`, specs, código, scripts, documentación técnica y changes previos se usan como fuentes. Capturas mediante herramientas temporales de documentación, sin modificar código o tests de la aplicación.

Solicitud directa del usuario después de integrar el frontend. Rama dedicada `feature/mauro-gutierrez-nanda-documentacion-proyecto`, creada desde `main`/`origin/main` `e5079f515cec09adc15b47cd5c21d04b0beb8048`, verificados mediante fetch el 2026-10-04. PR #15 y backend #14 presentes; árbol inicial limpio. El change `identidad-visual-apacheta` permanece activo (15/16 tareas), aunque su código fue integrado por #13; este trabajo no lo cierra ni reescribe.

Referencias académicas: enunciado TP2 y notas compartidos por el usuario en el chat del 2026-10-01; `openspec/ROADMAP.md`; memorias del trabajo previo de LyEP y sus distinciones entre simulación, hechos e hipótesis. El contenido actual del documento Google no se ha consultado en esta exploración. Su enlace y los antecedentes se registran en design.md para revisar su uso, no como acreditación de entrega completa.

Exclusiones: implementación de funciones, cambios visuales, dependencias, CI/deploy, edición de specs funcionales, modificación del documento Google o de las memorias, generación de PDF/Word, nuevo estudio de mercado, reconstrucción de prompts/horas/costos inexistentes y cierre de otros changes. La propuesta se preparó antes de modificar los README; el usuario autorizó su implementación documental el 2026-10-05. Esa autorización no incluye commits, push, PR ni archivado. La autorización previa de publicación correspondía al change frontend.
