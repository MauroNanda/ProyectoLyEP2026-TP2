import { sesionStore } from './sesionStore.js';
export class ErrorApi extends Error {
  constructor(message, { status = 0, code = 'RED', campos = [], retryAfter } = {}) {
    super(message); this.name = 'ErrorApi'; Object.assign(this, { status, code, campos, retryAfter });
  }
}
export function resolverUrls(env = {}) {
  try {
    const comercial = new URL(env.VITE_API_URL || 'http://localhost:3001/api/clientes');
    if (!env.VITE_API_BASE_URL && !/\/clientes\/?$/.test(comercial.pathname)) throw new Error();
    const base = new URL(env.VITE_API_BASE_URL || comercial.href.replace(/\/clientes\/?$/, ''));
    for (const u of [comercial, base]) {
      if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password || u.search || u.hash) throw new Error();
    }
    if (comercial.origin !== base.origin) throw new Error();
    return { clientes: comercial.href.replace(/\/$/, ''), base: base.href.replace(/\/$/, '') };
  } catch {
    throw new ErrorApi('Revisá VITE_API_URL y VITE_API_BASE_URL: deben ser URLs HTTP del mismo servidor, sin credenciales ni parámetros.', { code: 'CONFIGURACION' });
  }
}
export function crearApiClient({ store = sesionStore, env = {}, transporte = (...args) => fetch(...args) } = {}) {
  return async function solicitar(path, { method = 'GET', body, publico = false, tokenSalida, signal } = {}) {
    const urls = resolverUrls(env);
    const sesion = store.comprobar(), version = store.getSnapshot().version;
    const token = tokenSalida || (!publico && sesion?.token);
    if (!publico && !token) throw new ErrorApi('Se requiere una sesión válida.', { status: 401, code: 'NO_AUTENTICADO' });
    const url = path === 'clientes' ? urls.clientes : path.startsWith('clientes/')
      ? urls.clientes + '/' + path.slice(9) : urls.base + '/' + path;
    const vigente = () => version === store.getSnapshot().version;
    let respuesta;
    try {
      respuesta = await transporte(url, {
        method, signal, cache: 'no-store', credentials: 'omit', redirect: 'error',
        headers: { Accept: 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}),
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
    } catch (error) {
      if (!vigente() || error.name === 'AbortError') throw new ErrorApi('Solicitud descartada.', { code: 'SOLICITUD_DESCARTADA' });
      throw new ErrorApi('No se pudo conectar con el servidor. Revisá la conexión e intentá nuevamente.');
    }
    let datos;
    try { datos = respuesta.status === 204 ? undefined : await respuesta.json(); } catch { datos = undefined; }
    if (!vigente()) throw new ErrorApi('Solicitud descartada.', { code: 'SOLICITUD_DESCARTADA' });
    if (!respuesta.ok) {
      const fallo = datos?.error;
      const error = new ErrorApi('La solicitud no pudo completarse.', {
        status: respuesta.status, code: fallo?.code || 'HTTP',
        campos: Array.isArray(fallo?.campos) ? fallo.campos.filter(c => typeof c === 'string') : [],
        retryAfter: respuesta.headers.get('Retry-After'),
      });
      const passwordIncorrecta = path === 'auth/password' && error.code === 'CREDENCIALES_INVALIDAS';
      if (!publico && !tokenSalida && error.status === 401 && !passwordIncorrecta) store.terminar('Tu sesión ya no es válida. Volvé a ingresar.');
      throw error;
    }
    if (respuesta.status !== 204 && datos === undefined) throw new ErrorApi('El servidor no devolvi? una respuesta válida.', { code: 'RESPUESTA_INVALIDA' });
    return datos;
  };
}
export const api = crearApiClient({ env: import.meta.env });
