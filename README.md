# ProyectoLyEP2026-TP2

Repositorio del TP2 de Legislación y Ejercicio Profesional del Grupo 15.

## Frontend del TP1

`client/` contiene los archivos versionados de `main` del repositorio
https://github.com/prieto555/ProyectoLyEP2026, incluyendo los PR del TP1 integrados.

Base de la migración: `a11e589ced824ab107b47e99daedb9c7d7ff3173`.
Se utilizó `git archive` para conservar el contenido original sin trasladar el historial Git.

## Instalación y ejecución

Requiere Node.js y npm. Validado con Node.js 24.15.0.

```powershell
cd client
npm ci
npm run dev -- --port 5173 --strictPort
```

Frontend: http://localhost:5173

## Verificación

Desde `client/`:

```powershell
npm run build
npm run lint
```

La compilación de producción pasó durante la migración del 1 de octubre de 2026.
ESLint conserva tres errores heredados del TP1: imports sin uso en `App.jsx` y
`routes.jsx`, y la exportación del contexto junto al componente en
`AutorizacionesContext.jsx`.

La instalación informó ocho vulnerabilidades en las dependencias: una moderada
y siete altas. Su revisión queda pendiente; esta migración conserva el lockfile original.

El cliente continúa utilizando FakeStoreAPI. El backend y su integración se desarrollarán
en las siguientes ramas del TP2.

## Uso de IA

Codex asistió en la exportación del frontend, documentación y verificaciones técnicas.
Se comprobó la procedencia de los archivos y se ejecutaron instalación, build y lint.
Las verificaciones de interacción manual en navegador quedan pendientes del equipo.
