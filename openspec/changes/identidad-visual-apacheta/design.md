## Context

El contexto estable y los límites del producto se mantienen en [PRODUCT.md](../../../PRODUCT.md). El sistema visual implementado se registra en [DESIGN.md](../../../DESIGN.md); los resultados y la base de integración, en [verification.md](verification.md). Este documento conserva las decisiones y sus fundamentos para el change.

## Goals / Non-Goals

Facilitar consulta y operaciones existentes mediante una interfaz reconocible, legible y contenida. No desarrollar funciones comerciales futuras, alterar contratos, reemplazar autenticación ni agregar un kit UI.

## Decisions

### Dirección y primera pantalla

THESIS: directorio comercial que prioriza consulta y acción. OWN-WORLD: superficies neutrales de papel y piedra; arcilla como acento, símbolo de piedras apiladas y tipografía humanista. STORY: acompañar el seguimiento cotidiano sin prometer funciones futuras. FIRST VIEWPORT: navegación estable, título Clientes, búsqueda y tabla; alta secundaria hasta solicitarla. FORM: construcción desde código existente; semilla de exploración 69afd06d. Las restricciones explícitas del producto prevalecen sobre metáforas sugeridas por la herramienta.

La identidad no depende de paisajes, ilustraciones decorativas, métricas gigantes, degradados, glassmorphism ni mosaicos de tarjetas. Las filas, separadores y espacios organizan información real. Los iconos son SVG consistentes para acciones reconocibles.

### Marca

El usuario indicó el 3 de octubre de 2026 que el logo debe ser una apacheta como tal. El símbolo representa cinco piedras apiladas, con siluetas irregulares y estabilidad en la base. Se comparte geometría entre componente, archivo público y favicon. No se sustituye por una letra A. La marca usa Lora y la UI Source Sans 3, alojadas localmente con licencias SIL OFL; no se requieren servicios de fuentes externos.

### Sistema visual compartido

Los colores, tipografías, espaciados, radios y reglas de componentes se mantienen únicamente en [DESIGN.md](../../../DESIGN.md), con representación estructurada para Impeccable en [.impeccable/design.json](../../../.impeccable/design.json). El código de estilos es la evidencia de su implementación. No mantener una segunda tabla de tokens en este change.

### Topología y comportamiento

Acceso: dos áreas, marca y propósito frente al formulario; se apilan en móvil. Navegación lateral de 232 px en escritorio y horizontal en tamaños pequeños. Inicio: entrada a Clientes con contador real, sesión y recuentos existentes secundarios. Clientes: búsqueda etiquetada, cantidad de coincidencias y tabla; en móvil las filas distribuyen contacto, ciudad y ficha sin desbordar ni ocultar acciones.

El filtro y la apertura del alta se representan mediante q y alta en URL. Se conserva el criterio previo apellido/ciudad. Abrir el panel mueve el foco al primer campo; cerrarlo conserva los datos y devuelve foco al disparador. Los errores llevan al primer campo inválido. Alta y baja mantienen etiquetas durante carga y evitan envíos repetidos; los fallos permiten continuar o reintentar. La baja conserva permisos y confirmación, con retorno de foco al cancelar. Carga, vacío, filtro sin resultados y error son estados diferentes.

El formulario advierte antes de cerrar/recargar la página, cambiar ruta mediante enlace o salir de la sesión con datos pendientes. El retroceso mediante historial del navegador no está bloqueado; no se afirma protección completa de navegación. Se preserva la integración técnica: no se envían ni muestran contraseñas de clientes comerciales. Los usuarios de acceso simulados permanecen separados.

### Criterios incorporados

Se instalaron en el proyecto Impeccable, Interface Design y web-design-guidelines. Interface Design coincide con el último repositorio suministrado y se instala una sola vez. Sus principios se aplican al trabajo real: densidad útil, jerarquía, componentes coherentes, superficies contenidas y controles reconocibles. Vercel aporta semántica, foco, estados persistentes en URL, etiquetas, recuperación, tamaños táctiles y carga local de fuentes. No se importan convenciones idiomáticas ajenas al español ni funcionalidades nuevas por cumplir una plantilla.

La procedencia y versiones de las skills están en [design-sources.json](../../../.codex/skills/design-sources.json). La referencia de producto es la [presentación Apacheta](https://docs.google.com/presentation/d/1sSn5naMXwgjRABN0CGozVunVdoHAvRK7jiCnmhbd6A4/edit).

## Verification and integration

Ver verification.md: build, lint acotado, recorridos iniciales con API interceptada, capturas multiancho y auditoría automática, y posterior recorrido real contra API propia/Atlas. La revisión visual fue aprobada por el usuario; zoom real y evaluación manual completa siguen pendientes. No publicar ni hacer commits sin autorización explícita.
