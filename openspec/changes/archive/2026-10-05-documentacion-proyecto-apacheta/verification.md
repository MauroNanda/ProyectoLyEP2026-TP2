# Verificación documental — 5 de octubre de 2026

## Alcance y base

Change `documentacion-proyecto-apacheta`, exclusivamente documental (`skip_specs: true`). El usuario revisó la propuesta, añadió visualizaciones y capturas y autorizó implementar el 2026-10-05. Rama `feature/mauro-gutierrez-nanda-documentacion-proyecto`, basada en `main`/`origin/main` `e5079f515cec09adc15b47cd5c21d04b0beb8048`; fetch y comparación repetidos durante la implementación. PR #14 y #15 fusionados, sin dependencia backend pendiente.

Se amplió el README raíz con propósito, resolución, alcance, matriz de permisos, arquitectura, pruebas, contribuciones y relación académica. La primera redacción incluía consultas a MongoDB y procedimientos operativos extensos; se retiraron durante la revisión editorial solicitada por el usuario. Se corrigieron únicamente textos de transición de `server/README.md` y `server/documents/seguridad.md`. No se cambió código, contratos, dependencias, tests ni configuración local. No se modificaron documentos Google, memorias ni changes anteriores; no se cerró el change de identidad visual.

## Fuentes revisadas

1. PRODUCT, DESIGN, README de ambos subsistemas, package.json, .env.example y scripts: propósito, comandos y configuración.
2. Modelos, servicios, app, pantallas, specs y documentos del backend: colección/campos, roles, sesiones, validación y responsabilidades.
3. Git y API pública de GitHub: PR #1, #2 y #8–#15, ramas, autores, descripciones y estados de merge. Los aportes se atribuyen a la contribución, no a quien fusionó. En #12 se conserva el nombre Sebastián con la cuenta `sebaVel`; no se completa un apellido a partir de la rama abreviada.
4. Evidencias de backend/frontend del 2026-10-04 e identidad visual: resultados previos y pendientes. Los 74 tests backend, 17 tests frontend, cuatro E2E y diez grupos de integración se citan como históricos; **no se ejecutaron otra vez en esta tarea de texto**.
5. ROADMAP, consigna TP2 compartida previamente por el usuario y memorias metodológicas: cuatro partes académicas, prompts originales, simulación frente a hechos y equipo híbrido. No se publicaron rutas personales ni conversaciones. Horas y presupuesto no disponibles se identifican como pendientes, sin inferir esfuerzo desde commits.
6. Documentación oficial de GitHub para Mermaid, imágenes, alertas y desplegables; MongoDB Compass para conexión y filtros. Los enlaces Google se recuperaron como referencias del equipo: su contenido actual no fue consultado ni modificado, y no acreditan completitud de la entrega.

## Capturas reales y limpieza

Se utilizó un helper temporal basado en el patrón del verificador existente: Chrome headless con Playwright instalado en client/, API real mediante las fábricas de server/, Vite en `127.0.0.1:5174`, Atlas y repositorio aislado. No se modificaron tests ni scripts versionados.

Preparó un Administrador, una cuenta Gerencia, una Soporte y tres clientes ficticios mediante el servicio real. Inició sesión desde el navegador y capturó Inicio, Clientes e Historial administrativo con filtro `CLIENTE_CREADO`. Viewport 1440×1000, páginas completas, fuentes y cargas esperadas, animaciones desactivadas. La captura de Historial mide 1440×1610; las otras dos, 1440×1000.

Ejecución final: `2026-10-05T14:37:05.070Z`. Cero errores de página. Prefijo propio: `apacheta_readme_2b42e29712594dcea7c608cd50a049f5`; cinco nombres exactos terminados en `_usuarios`, `_sesiones`, `_auditoria`, `_control` y `_clientes`. El cierre eliminó exclusivamente esos nombres y consultó su ausencia individualmente; también cerró Chrome, Vite, HTTP y la conexión MongoDB. No accedió a cuentas ni clientes permanentes del equipo.

Se corrigieron un selector que coincidía con una opción oculta y la codificación de acentos en los datos del helper. Las ejecuciones anteriores también completaron su limpieza; no son fallos del código de la aplicación. Los helpers se retiraron después de verificar la documentación.

Assets finales revisados visualmente, sin credenciales ni datos permanentes:

| Archivo | Dimensiones | Tamaño |
|---|---|---|
| [Inicio](../../../../docs/assets/readme/inicio.png) | 1440×1000 | 85 657 bytes |
| [Clientes](../../../../docs/assets/readme/clientes.png) | 1440×1000 | 83 912 bytes |
| [Historial](../../../../docs/assets/readme/historial.png) | 1440×1610 | 156 931 bytes |

Peso total: 326 500 bytes. Todas las imágenes conservan texto alternativo y descripción de origen/datos ficticios en README. Las capturas acreditan presentación observada, no una nueva suite exhaustiva de permisos o persistencia.

## Controles de la primera redacción

Vista previa local con Marked 15.0.12 (GFM), Mermaid 11.4.1 y estilos de GitHub Markdown 5.8.1, descargados exclusivamente a una carpeta temporal. No se agregaron dependencias al proyecto. Chrome renderizó el diagrama y la página; se comprobaron cuatro imágenes cargadas con alt, diez enlaces del índice, seis tablas, dos desplegables y dos alertas. Revisión de portada y diagrama; lectura en anchos 1280 y 390 sin desbordamiento global. Las tablas y bloques largos conservan su desplazamiento interno.

La revisión automática de aprobación rechazó enviar el README completo al endpoint de GitHub Markdown por posible exposición de información interna. Se utilizó render local y el navegador de verificación bloqueó destinos externos. **No se envió el README a ese endpoint ni se publicó una vista previa.** El render local prueba la sintaxis y presentación aproximada; el render exacto en GitHub queda para revisión tras publicación autorizada.

Se comprobaron 58 referencias locales/anchors en los cuatro documentos modificados/creados, JSON de filtros y coincidencia de comandos con package.json. Se comprobó ausencia de valores secretos de la configuración local en los textos; no se imprimieron esas variables. Validación OpenSpec estricta y `git diff --check` aprobados. El diff final contiene únicamente los documentos previstos, artefactos de este change y tres PNG; los helpers temporales no permanecen en el repositorio.

## Revisión editorial y controles finales

El usuario solicitó centrar el README en el trabajo y su resolución, sin tutorial de consultas a la base, detalles de IP, identificadores internos, emojis ni información accesoria. Se reorganizó alrededor de problema, resultados implementados, decisiones, aportes individuales y validación; instalación y pruebas se resumieron con enlaces al detalle. Se retiraron alertas, consultas MongoDB, UUID, hashes y explicaciones del helper. Las capturas originales se conservaron sin volver a conectar a Atlas. Propuesta, diseño y tareas se alinearon con este criterio.

README final: 194 líneas. Se verificaron 23 referencias locales, incluidos los diez destinos del índice; los enlaces externos de PR conservan las fuentes revisadas previamente. Se contrastaron los comandos esenciales con package.json. Vista previa local GFM/Mermaid: cuatro imágenes cargadas con texto alternativo, un diagrama, una galería desplegable y cero alertas. Sin errores de página ni desbordamiento global a 1280 y 390 px. Los recursos de presentación temporales ya disponibles se reutilizaron sin nuevas dependencias ni solicitudes de red del navegador. Validación OpenSpec estricta y `git diff --check` aprobados tras la revisión.

## Revisión humana y publicación

Refinamiento adicional solicitado: aportes agrupados en una fila por integrante, destacando responsabilidades complementarias. La enumeración individual de PR se sustituyó por un enlace al historial conjunto. Se retiraron del README las fechas de validación y capturas; se conservan aquí para trazabilidad. No cambian las atribuciones ni los resultados registrados.

El usuario revisó el documento y solicitó los ajustes editoriales registrados. Después autorizó explícitamente archivar el change, ejecutar los commits propuestos y pushear la rama. Esta confirmación cierra la tarea de revisión humana. No se autoriza apertura ni fusión de PR. El cierre documental no acredita cierre completo del TP2.

## Archivado

Archivado mediante el CLI oficial como `2026-10-05-documentacion-proyecto-apacheta`, con doce tareas completas y sin delta specs. Se corrigieron las rutas relativas de las capturas al mover el documento. Los cinco commits de contenido se complementan con un sexto commit de archivado. Se conserva la rama dedicada para el push autorizado.
