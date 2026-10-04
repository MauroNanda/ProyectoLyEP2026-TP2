import { useEffect, useSyncExternalStore } from 'react';
import { AutorizacionesContext } from './autorizaciones';
import { limpiarIdentidadHeredada, permisosDe, sesionStore } from '../services/sesionStore';
import auth from '../services/autorizacionesServices';
export default function AutorizacionesProvider({ children }) {
  const estado = useSyncExternalStore(sesionStore.subscribe, sesionStore.getSnapshot);
  const token = estado.sesion?.token, expiresAt = estado.sesion?.expiresAt;
  useEffect(() => {
    try { limpiarIdentidadHeredada(window.localStorage); } catch { /* almacenamiento bloqueado */ }
  }, []);
  useEffect(() => {
    if (!token) return;
    const timer = window.setTimeout(() => sesionStore.comprobar(), Math.max(0, Date.parse(expiresAt) - Date.now()));
    const verificar = () => {
      if (document.visibilityState === 'hidden' || !sesionStore.comprobar()) return;
      auth.me().catch(() => { /* HTTP trata 401; red o 403 no cierran sesi?n */ });
    };
    window.addEventListener('focus', verificar);
    document.addEventListener('visibilitychange', verificar);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', verificar);
      document.removeEventListener('visibilitychange', verificar);
    };
  }, [token, expiresAt]);
  const usuario = estado.sesion?.usuario || null;
  return <AutorizacionesContext.Provider value={{ usuario, rol: usuario?.rol, permisos: permisosDe(usuario?.rol),
    aviso: estado.aviso, saliendo: estado.saliendo, version: estado.version,
    iniciarSesion: auth.login, cerrarSesion: auth.logout, cambiarPassword: auth.cambiarPassword,
    terminarSesion: sesionStore.terminar, actualizarUsuario: sesionStore.actualizarUsuario }}>
    {children}
  </AutorizacionesContext.Provider>;
}
