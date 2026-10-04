# ProyectoLyEP2026-TP2

Repositorio del TP2 de Legislación y Ejercicio Profesional del Grupo 15. Apacheta conserva el frontend comercial del TP1 y consume la API propia de Node/Express con MongoDB Atlas.

## Ejecución

Node 24+. Configurar el backend según [server/documents/seguridad.md](server/documents/seguridad.md), sin versionar secretos. Desde server/: `npm ci`, `npm start`. Usar una cuenta activa del equipo; el primer administrador se crea mediante bootstrap coordinado una sola vez.

Desde client/: `npm ci`, copiar `.env.example` a `.env` y ejecutar `npm run dev`. El script fija el puerto 5173 y falla si está ocupado. Abrir http://localhost:5173. Configuración y uso: [client/README.md](client/README.md).

## Comportamiento

Login real por email y contraseña; el backend determina Administrador, Gerencia o Soporte. Token en memoria: recargar requiere nuevo login. Directorio comercial con consulta, búsqueda, alta y baja autorizada. Administrador también gestiona cuentas y consulta historial administrativo con filtros/cursor. Mi cuenta permite cambiar la contraseña personal. Se preserva la identidad visual Apacheta.

## Verificación y procedencia

Desde client/: `npm test`, `npm run build`, `npm run lint`. Desde server/: `npm test`. Verificación navegador/Atlas aislada y evidencia: [change frontend](openspec/changes/archive/2026-10-04-cuentas-sesiones-permisos-auditoria-frontend/verification.md).

La migración del TP1 tomó como base a11e589ced824ab107b47e99daedb9c7d7ff3173 del repositorio https://github.com/prieto555/ProyectoLyEP2026 mediante git archive, sin trasladar su historial. OpenSpec mantiene propuestas y evidencias por contribución.

Codex asistió en el change frontend actual, aprobado para implementación por el usuario. El usuario confirmó validación funcional final; commits, push y PR requieren autorización explícita.
