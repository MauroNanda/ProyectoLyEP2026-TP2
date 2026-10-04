import { ErrorServicio } from './errores.js';
export const ROLES = Object.freeze(['Administrador', 'Gerencia', 'Soporte']);
export const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const esObjeto = v => v !== null && typeof v === 'object' && !Array.isArray(v);
export function entrada(campos) { throw new ErrorServicio('ENTRADA_INVALIDA', 'Revisá los campos indicados.', [...new Set(campos)]); }
export function validarId(id) { if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) throw new ErrorServicio('ID_INVALIDO', 'El identificador no es válido.'); }
const largo = v => [...v].length;
export function texto(v, campo, max, errores, { obligatorio = false, letras = false } = {}) {
  if (v === undefined && !obligatorio) return undefined;
  if (typeof v !== 'string') { errores.push(campo); return undefined; }
  const s = v.trim();
  if ((obligatorio && !s) || largo(s) > max || (letras && s && !/\p{L}/u.test(s))) errores.push(campo);
  return s;
}
export function passwordValida(v) { return typeof v === 'string' && largo(v) >= 12 && largo(v) <= 128; }
export function prepararDatosCliente(datos) {
  if (!esObjeto(datos)) entrada(['cuerpo']);
  const errores = [];
  const email = texto(datos.email, 'email', 254, errores, { obligatorio: true });
  if (email && !PATRON_EMAIL.test(email)) errores.push('email');
  const phone = texto(datos.phone, 'phone', 40, errores, { obligatorio: true });
  if (phone) {
    const n = phone.replace(/\D/g, '').length;
    if (!/^\+?[\d ()-]+$/.test(phone) || n < 7 || n > 15) errores.push('phone');
  }
  function grupo(v, campo) {
    if (v === undefined) return {};
    if (!esObjeto(v)) { errores.push(campo); return null; }
    return v;
  }
  const name = grupo(datos.name, 'name'), address = grupo(datos.address, 'address');
  let number;
  if (address) {
    const v = address.number;
    if (typeof v === 'number' && Number.isFinite(v)) number = String(v);
    else number = texto(v, 'address.number', 30, errores);
    if (number && largo(number) > 30) errores.push('address.number');
  }
  const clean = o => Object.fromEntries(Object.entries(o).filter(([,v]) => v !== undefined));
  const result = {
    email, phone, ...clean({ username: texto(datos.username, 'username', 100, errores) }),
    name: name && clean({
      firstname: texto(name.firstname, 'name.firstname', 100, errores, { obligatorio: true, letras: true }),
      lastname: texto(name.lastname, 'name.lastname', 100, errores),
    }),
    address: address && clean({
      city: texto(address.city, 'address.city', 100, errores, { obligatorio: true, letras: true }),
      street: texto(address.street, 'address.street', 200, errores),
      number, zipcode: texto(address.zipcode, 'address.zipcode', 20, errores),
    }),
  };
  if (errores.length) entrada(errores);
  return result;
}
export function prepararCuenta(datos) {
  if (!esObjeto(datos)) entrada(['cuerpo']);
  const errores = Object.keys(datos).filter(k => !['nombre','email','rol','password'].includes(k));
  const nombre = texto(datos.nombre, 'nombre', 100, errores, { obligatorio: true, letras: true });
  const email = texto(datos.email, 'email', 254, errores, { obligatorio: true });
  if (email && !PATRON_EMAIL.test(email)) errores.push('email');
  if (!ROLES.includes(datos.rol)) errores.push('rol');
  if (!passwordValida(datos.password)) errores.push('password');
  if (errores.length) entrada(errores);
  return { nombre, email: email.toLowerCase(), rol: datos.rol, password: datos.password };
}
export function prepararCambioCuenta(datos) {
  if (!esObjeto(datos) || !Object.keys(datos).length) entrada(['cuerpo']);
  const errores = Object.keys(datos).filter(k => !['nombre','rol','activo'].includes(k));
  const result = {};
  if ('nombre' in datos) result.nombre = texto(datos.nombre, 'nombre', 100, errores, { obligatorio: true, letras: true });
  if ('rol' in datos) { if (!ROLES.includes(datos.rol)) errores.push('rol'); result.rol = datos.rol; }
  if ('activo' in datos) { if (typeof datos.activo !== 'boolean') errores.push('activo'); result.activo = datos.activo; }
  if (errores.length) entrada(errores);
  return result;
}
