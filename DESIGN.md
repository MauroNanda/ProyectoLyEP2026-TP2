---
name: Apacheta
description: "Que ningún compromiso con el cliente quede en el camino."
colors:
  clay: "#9c4a33"
  clay-hover: "#7d3825"
  clay-soft: "#f1e7df"
  ink: "#292d27"
  secondary: "#535c4e"
  muted: "#65705f"
  disabled: "#788170"
  trail: "#faf9f6"
  stone: "#f0f1eb"
  paper: "#ffffff"
  strata: "#e7e0d4"
  border: "#dfe3d8"
  control: "#f8f9f5"
  control-border: "#7f8976"
  focus: "#9c4a33"
  danger: "#a12b34"
  danger-soft: "#fff2f3"
  success: "#286044"
  success-soft: "#edf6f0"
typography:
  brand:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "25px"
    fontWeight: 600
  headline:
    fontFamily: "Source Sans 3, Segoe UI, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Source Sans 3, Segoe UI, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Source Sans 3, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Source Sans 3, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 500
rounded:
  control: "6px"
  panel: "12px"
spacing:
  step-1: "4px"
  step-2: "8px"
  step-3: "12px"
  step-4: "16px"
  step-5: "20px"
  step-6: "24px"
  step-8: "32px"
  step-10: "40px"
  step-12: "48px"
  step-16: "64px"
components:
  button-primary:
    backgroundColor: "{colors.clay}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.clay-hover}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.danger}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  input:
    backgroundColor: "{colors.control}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
    typography: "{typography.body}"
---

# Design System: Apacheta

## Overview

**Creative North Star: "Directorio comercial de papel y piedra"**

Directorio comercial sobrio: papel y piedra organizan datos reales; la arcilla señala marca, foco y acciones. Una apacheta de cinco piedras apiladas expresa continuidad. La consulta y las operaciones existentes conservan controles reconocibles y espacio para nombres extensos.

Este registro describe el sistema implementado en client/src/css/app.css y sus componentes. La propuesta, sus cambios y la evidencia se mantienen en openspec/changes/identidad-visual-apacheta/. No reemplaza OpenSpec. El contexto y las capacidades del producto se mantienen en [PRODUCT.md](PRODUCT.md); resultados y límites de verificación, en el change de OpenSpec.

**Key Characteristics:**

- Superficies neutrales con un acento de arcilla.
- Marca serif; lectura y operación con sans humanista.
- Filas y separadores para información comercial.
- Controles etiquetados, foco visible y recuperación de errores.

## Colors

### Primary

Arcilla identifica la marca y acción principal; su variante profunda responde al hover y su tono suave señala navegación activa.

### Neutral

Tinta sostiene lectura principal; secundario y atenuado jerarquizan información. Sendero es el fondo de trabajo, piedra la navegación, papel las superficies y estrato el área de marca en acceso. Borde de control distingue campos del fondo. Éxito y peligro acompañan texto explícito; el color no comunica por sí solo. Los valores normativos están en el frontmatter.

## Typography

Source Sans 3 y Lora se sirven localmente en WOFF2 con font-display: swap. La interfaz usa la sans humanista; el nombre de marca usa Lora.

### Hierarchy

- **Headline:** título operativo; en móvil pasa de 32 a 28 px.
- **Title:** encabezado de sección (22 px); las secciones secundarias emplean 18 px.
- **Body:** lectura habitual (16 px), interlineado 1.5.
- **Label:** etiqueta de campo (14 px, peso 500). Botones usan 15 px, peso 600 e interlineado 1.4.
- **Brand:** nombre en navegación (25 px, peso 600); acceso usa 36 px y adapta hasta 26 px.

La promesa de acceso usa Source Sans 3, peso 500: 40 px en escritorio, 36/32/26 px en las adaptaciones existentes. No es una nueva fuente de display.

**The Marca y operación Rule.** Reservar Lora al nombre Apacheta; usar Source Sans 3 en datos, títulos y controles.

## Layout

Estructura autenticada: lateral de 232 px y cuerpo flexible; lateral de 204 px hasta 1100 px. Hasta 800 px la navegación ocupa una franja superior. El contenido llega a 1200 px y usa padding base de 40 px, 32 px en tamaños intermedios y 20 px de margen horizontal hasta 600 px; desde 1600 px utiliza 48 px verticales y 64 px horizontales.

Espaciado basado en 4 px con los pasos declarados. Tabla de clientes con columnas 30/30/24/16%; hasta 600 px cada fila distribuye nombre, contacto, ciudad y acceso a ficha. Formularios de dos columnas pasan a una. El acceso se divide en áreas de proporción 0.95/1.05 y se apila hasta 600 px. Nombres y datos largos admiten salto de línea.

## Elevation & Depth

Superficies planas; separación por tono y bordes finos. Los campos enfocables no emplean sombras: el foco usa outline de 3 px en arcilla, separado 4 px (3 px dentro del modal). El modal mantiene la capa y backdrop de React Bootstrap; no se inventa una escala de sombras.

**The Profundidad contenida Rule.** Diferenciar regiones mediante tono, espacio y separadores; no añadir sombras decorativas a los controles.

## Shapes

Controles suavemente curvados (6 px); panel modal (12 px). Símbolo vectorial de cinco piedras orgánicas sobre base más amplia, viewBox de 64 por 64; nunca una letra A. El avatar de iniciales existente es circular. Iconos de acciones son SVG lineales consistentes, separados del símbolo de marca.

## Components

### Buttons

Acciones con texto y SVG auxiliar, altura mínima de 44 px. Principal arcilla, hover profundo, active tinta. Secundario papel con borde de control; peligro con contorno rojo y fondo suave al hover. Transiciones de color de 160 ms; disabled conserva texto, indica espera y reduce opacidad a 0.65.

### Inputs / Fields

Entradas con fondo de control, borde visible y etiqueta superior. Foco cambia borde a arcilla y fondo a papel. Errores inline acompañan aria-invalid y el primer campo inválido recibe foco. Alta conserva datos tras fallo y evita envíos simultáneos; spinner acompaña la etiqueta estable.

### Navigation

Lateral con Inicio y Clientes, tono activo arcilla suave y texto reforzado. En móvil pasa arriba sin ocultar acciones principales. El enlace de salto lleva al contenido y el breadcrumb describe ubicación.

### Directory

Filas separadas por borde tenue, hover de control y enlace a ficha de 44 px. Búsqueda conserva q en URL; alta conserva alta=1. Abrir alta enfoca Nombre; cerrar conserva datos y devuelve foco. Carga estática, vacío, sin coincidencias y error tienen mensajes y siguiente paso propio.

### Messages and confirmation

Mensajes inline con texto, icono y superficie de estado; baja requiere confirmación y permisos existentes. La reducción de movimiento desactiva transiciones y animaciones. Advertencia de datos pendientes cubre recarga, cierre, enlaces y salida de sesión; el retroceso del historial no está protegido.

## Do's and Don'ts

### Do:

- **Do** representar el símbolo con piedras apiladas y conservar su silueta compartida.
- **Do** mantener etiquetas legibles, foco visible y acciones accesibles en móvil.
- **Do** distinguir carga, vacío, búsqueda sin coincidencias y error recuperable.
- **Do** registrar la evolución de la propuesta en OpenSpec y extraer aquí únicamente reglas implementadas.

### Don't:

- **Don't** sustituir la apacheta por una inicial ni añadir paisajes ornamentales.
- **Don't** simular compromisos, alertas o métricas aún no disponibles.
- **Don't** convertir la interfaz en un mosaico de tarjetas, degradados o glassmorphism.

El estado de implementación y los pendientes se mantienen en [verification.md](openspec/changes/identidad-visual-apacheta/verification.md), sin duplicarlos en este sistema visual.
