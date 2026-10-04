import { api } from './apiClient.js';
import { sesionStore } from './sesionStore.js';
export function crearAutorizacionesService(http = api, store = sesionStore) {
  return {
    async login(email, password) {
      const datos = await http('auth/login', { method: 'POST', body: { email, password }, publico: true });
      store.iniciar(datos);
    },
    async me() {
      const version = store.getSnapshot().version;
      const usuario = await http('auth/me'); store.actualizarUsuario(usuario, version); return usuario;
    },
    async logout() {
      const { token, version } = store.comenzarSalida();
      let aviso = 'Sesión cerrada.';
      try { if (token) await http('auth/logout', { method: 'POST', tokenSalida: token }); }
      catch (error) { if (error.status !== 401) aviso = 'Saliste de Apacheta. No pudimos confirmar la revocación remota de la sesión.'; }
      finally { store.finalizarSalida(version, aviso); }
    },
    async cambiarPassword(actual, nueva) {
      await http('auth/password', { method: 'PATCH', body: { actual, nueva } });
      store.terminar('Contraseña cambiada. Todas tus sesiones se cerraron; volvé a ingresar.');
    },
  };
}
export default crearAutorizacionesService();
