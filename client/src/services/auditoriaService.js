import { api } from './apiClient.js';
export const TIPOS_EVENTO = Object.freeze(['LOGIN_CORRECTO', 'LOGIN_FALLIDO', 'LOGOUT', 'PASSWORD_CAMBIADA', 'CUENTA_CREADA', 'CUENTA_ACTUALIZADA', 'CLIENTE_CREADO', 'CLIENTE_ELIMINADO']);
export const filtrosIniciales = { tipo: '', actorId: '', desde: '', hasta: '', limit: '50' };
export function prepararFiltros(valores) {
  const errores = {}, query = {};
  if (valores.tipo && !TIPOS_EVENTO.includes(valores.tipo)) errores.tipo = 'Elegí un tipo válido.';
  if (valores.actorId && !/^[a-f\d]{24}$/i.test(valores.actorId)) errores.actorId = 'Elegí una cuenta válida.';
  for (const campo of ['desde', 'hasta']) {
    if (!valores[campo]) continue;
    const fecha = new Date(valores[campo]);
    if (!/^\d{4}-\d\d-\d\dT/.test(valores[campo]) || !Number.isFinite(fecha.getTime())) errores[campo] = 'Ingresá fecha y hora válidas.';
    else query[campo] = fecha.toISOString();
  }
  if (query.desde && query.hasta && query.desde > query.hasta) errores.desde = errores.hasta = 'Desde debe ser anterior o igual a Hasta.';
  const limit = Number(valores.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) errores.limit = 'Ingresá entre 1 y 100 eventos.';
  if (valores.tipo) query.tipo = valores.tipo;
  if (valores.actorId) query.actorId = valores.actorId;
  query.limit = String(limit);
  return { errores, query };
}
export const crearAuditoriaService = (http = api) => ({
  consultar: (filtros, cursor, { signal } = {}) => http('auditoria?' + new URLSearchParams({ ...filtros, ...(cursor ? { cursor } : {}) }), { signal }),
});
export default crearAuditoriaService();
