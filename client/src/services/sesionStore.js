export const ROLES = Object.freeze(['Administrador', 'Gerencia', 'Soporte']);
export const permisosDe = rol => ({
  comercial: ROLES.includes(rol), administrar: rol === 'Administrador',
  eliminar: ['Administrador', 'Gerencia'].includes(rol),
});
export function crearSesionStore({ ahora = () => Date.now() } = {}) {
  let estado = { sesion: null, aviso: '', saliendo: false, version: 0 };
  const oyentes = new Set();
  const publicar = cambios => { estado = { ...estado, ...cambios }; oyentes.forEach(fn => fn()); };
  const store = {
    getSnapshot: () => estado,
    subscribe: fn => { oyentes.add(fn); return () => oyentes.delete(fn); },
    iniciar(datos) {
      if (!datos?.token || !ROLES.includes(datos.usuario?.rol) || !datos.usuario.activo ||
          !Number.isFinite(Date.parse(datos.expiresAt)) || Date.parse(datos.expiresAt) <= ahora()) {
        throw new Error('La respuesta de acceso no contiene una sesión válida.');
      }
      publicar({ sesion: datos, aviso: '', saliendo: false, version: estado.version + 1 });
    },
    terminar(aviso = '') { publicar({ sesion: null, aviso, saliendo: false, version: estado.version + 1 }); },
    comenzarSalida() {
      const token = estado.sesion?.token;
      publicar({ sesion: null, aviso: 'Cerrando sesión…', saliendo: true, version: estado.version + 1 });
      return { token, version: estado.version };
    },
    finalizarSalida(version, aviso) { if (version === estado.version) publicar({ saliendo: false, aviso }); },
    actualizarUsuario(usuario, version = estado.version) {
      if (version === estado.version && estado.sesion) publicar({ sesion: { ...estado.sesion, usuario } });
    },
    comprobar() {
      if (estado.sesion && Date.parse(estado.sesion.expiresAt) <= ahora()) store.terminar('Tu sesión venció. Volvé a ingresar.');
      return estado.sesion;
    },
  };
  return store;
}
export function limpiarIdentidadHeredada(storage) {
  try { storage?.removeItem('admin'); storage?.removeItem('role'); } catch { /* almacenamiento bloqueado */ }
}
export const sesionStore = crearSesionStore();
