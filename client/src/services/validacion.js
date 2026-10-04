import { ROLES } from './sesionStore.js';
export const largo = v => [...v].length;
const emailValido = v => !!v.trim() && largo(v.trim()) <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
export const passwordValida = v => typeof v === 'string' && largo(v) >= 12 && largo(v) <= 128;
const nombreValido = v => !!v.trim() && largo(v.trim()) <= 100 && /\p{L}/u.test(v.trim());
export function validarAcceso({ email, password }) {
  const errores = {};
  if (!emailValido(email) || email.trim().length > 254) errores.email = 'Ingresá un email válido, de hasta 254 caracteres.';
  if (!passwordValida(password)) errores.password = 'Usá entre 12 y 128 caracteres.';
  return errores;
}
export function validarCuenta(v, edicion = false) {
  const errores = {};
  if (!nombreValido(v.nombre)) errores.nombre = 'Ingresá un nombre con letras, de hasta 100 caracteres.';
  if (!ROLES.includes(v.rol)) errores.rol = 'Elegí un rol válido.';
  if (edicion) {
    if (typeof v.activo !== 'boolean') errores.activo = 'Elegí un estado válido.';
  } else {
    if (!emailValido(v.email)) errores.email = 'Ingresá un email válido, de hasta 254 caracteres.';
    if (!passwordValida(v.password)) errores.password = 'Usá entre 12 y 128 caracteres.';
  }
  return errores;
}
export function cambioCuenta(original, valores) {
  return Object.fromEntries(['nombre', 'rol', 'activo'].flatMap(k => {
    const valor = k === 'nombre' ? valores[k].trim() : valores[k];
    return valor === original[k] ? [] : [[k, valor]];
  }));
}
export function validarPassword(v) {
  const errores = {};
  for (const k of ['actual', 'nueva']) if (!passwordValida(v[k])) errores[k] = 'Usá entre 12 y 128 caracteres.';
  if (v.confirmacion !== v.nueva) errores.confirmacion = 'La confirmación no coincide.';
  return errores;
}
export const datosCliente = v => ({
  email: v.email.trim(), phone: v.telefono.trim(),
  username: v.nombre.trim().toLowerCase().replace(/\s/g, ''),
  name: { firstname: v.nombre.trim(), lastname: '-' }, address: { city: v.ciudad.trim() },
});
export function validarCliente(v) {
  const errores = {}, telefono = v.telefono.trim();
  if (!nombreValido(v.nombre)) errores.nombre = 'Ingresá un nombre con letras, de hasta 100 caracteres.';
  if (!nombreValido(v.ciudad)) errores.ciudad = 'Ingresá una ciudad con letras, de hasta 100 caracteres.';
  if (!emailValido(v.email)) errores.email = 'Ingresá un email válido, de hasta 254 caracteres.';
  if (largo(datosCliente(v).username) > 100) errores.nombre = 'El nombre genera un identificador de más de 100 caracteres.';
  const digitos = telefono.replace(/\D/g, '').length;
  if (largo(telefono) > 40 || !/^\+?[\d ()-]+$/.test(telefono) || digitos < 7 || digitos > 15)
    errores.telefono = 'Usá entre 7 y 15 dígitos; se permiten + inicial, espacios, paréntesis y guiones.';
  return errores;
}
export function mensajeError(error) {
  if (error.code === 'SOLICITUD_DESCARTADA') return '';
  if (error.code === 'CONFIGURACION' || error.code === 'RESPUESTA_INVALIDA') return error.message;
  if (error.code === 'ULTIMO_ADMINISTRADOR') return 'Debe quedar al menos un administrador activo. Revisá rol y estado.';
  if (error.status === 400) return 'Revisá los campos indicados e intentá nuevamente.';
  if (error.status === 401) return 'Correo o contraseña incorrectos, o sesión no válida.';
  if (error.status === 403) return 'No tenés permiso para esta operación.';
  if (error.status === 404) return 'El recurso ya no está disponible. Actualizá la lista.';
  if (error.status === 409) return 'La operación entra en conflicto con los datos actuales. Revisá los campos o actualizá.';
  if (error.status === 413) return 'Los datos enviados exceden el tamaño permitido. Reducilos e intentá nuevamente.';
  if (error.status === 429) {
    const segundos = /^\d+$/.test(error.retryAfter || '') ? Number(error.retryAfter) :
      Math.max(0, Math.ceil((Date.parse(error.retryAfter) - Date.now()) / 1000));
    return Number.isFinite(segundos) ? 'Demasiados intentos. Volvé a intentar en ' + segundos + ' segundos.' : 'Demasiados intentos. Esperá antes de volver a intentar.';
  }
  if (error.status === 503) return 'El almacenamiento no está disponible. Intentá nuevamente más tarde.';
  if (error.status >= 500) return 'El servidor no pudo completar la operación. Intentá nuevamente.';
  return 'No se pudo conectar con el servidor. Revisá la conexión e intentá nuevamente.';
}
export function erroresDeApi(error, mapa) {
  const errores = {};
  for (const campo of error.campos || []) if (mapa[campo]) errores[mapa[campo]] = 'Revisá este campo según las indicaciones.';
  if (error.status === 409 && /EMAIL|CORREO/.test(error.code) && mapa.email) errores[mapa.email] = 'Ya existe una cuenta con este email.';
  if (error.code === 'ULTIMO_ADMINISTRADOR') {
    for (const k of ['rol', 'activo']) if (mapa[k]) errores[mapa[k]] = 'Debe quedar un administrador activo.';
  }
  if (error.code === 'CREDENCIALES_INVALIDAS' && mapa.actual) errores[mapa.actual] = 'La contraseña actual es incorrecta o cambió. Verificá tu sesión.';
  return errores;
}
export function enfocarError(form, errores) {
  const campo = Object.keys(errores)[0];
  if (campo) requestAnimationFrame(() => form?.querySelector('[name="' + campo + '"]')?.focus());
}
