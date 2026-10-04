import { isIP } from 'node:net';
import { ErrorPersistencia } from './database.js';
export function validarEntorno(entorno = process.env) {
  const puerto = entorno.PORT === undefined ? 3001 : Number(entorno.PORT);
  const host = entorno.HOST === undefined ? '127.0.0.1' : entorno.HOST;
  const corsOrigin = entorno.CORS_ORIGIN === undefined ? 'http://localhost:5173' : entorno.CORS_ORIGIN;
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535 || !/^\d+$/.test(String(entorno.PORT ?? 3001))) throw new ErrorPersistencia('CONFIGURACION_INVALIDA', 'PORT debe ser un entero entre 1 y 65535.');
  if (host !== 'localhost' && !isIP(host)) throw new ErrorPersistencia('CONFIGURACION_INVALIDA', 'HOST debe ser localhost o una dirección IP.');
  try { const u = new URL(corsOrigin); if (!['http:','https:'].includes(u.protocol) || u.username || u.password || u.origin !== corsOrigin) throw new Error(); }
  catch { throw new ErrorPersistencia('CONFIGURACION_INVALIDA', 'CORS_ORIGIN debe ser un origen HTTP válido sin ruta.'); }
  return { puerto, host, corsOrigin };
}
