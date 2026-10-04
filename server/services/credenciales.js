import { randomBytes, scrypt as derivar, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { ErrorServicio } from './errores.js';
import { passwordValida, entrada } from './validacion.js';
const scrypt = promisify(derivar);
export const PERFIL = Object.freeze({ N: 131072, r: 8, p: 1, maxmem: 192 * 1024 * 1024 });
let activas = 0;
async function limitado(fn) {
  if (activas >= 2) { const e = new ErrorServicio('LIMITE_EXCEDIDO', 'Intentá nuevamente en unos segundos.'); e.retryAfter = 5; throw e; }
  activas++;
  try { return await fn(); } finally { activas--; }
}
export const HASH_FICTICIO = 'scrypt$1$131072$8$1$' + '00'.repeat(16) + '$' + '00'.repeat(64);
export async function crearHash(password) {
  if (!passwordValida(password)) entrada(['password']);
  return limitado(async () => {
    const salt = randomBytes(16);
    const hash = await scrypt(password, salt, 64, PERFIL);
    return ['scrypt', '1', '131072', '8', '1', salt.toString('hex'), hash.toString('hex')].join('$');
  });
}
export async function verificarHash(password, valor) {
  if (!passwordValida(password)) return false;
  const valido = typeof valor === 'string' && /^scrypt\$1\$131072\$8\$1\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(valor);
  const parts = (valido ? valor : HASH_FICTICIO).split('$');
  return limitado(async () => {
    const obtenido = await scrypt(password, Buffer.from(parts[5], 'hex'), 64, PERFIL);
    return timingSafeEqual(obtenido, Buffer.from(parts[6], 'hex')) && valido;
  });
}
export const nuevoToken = () => randomBytes(32).toString('base64url');
export const hashToken = token => createHash('sha256').update(token).digest('hex');
