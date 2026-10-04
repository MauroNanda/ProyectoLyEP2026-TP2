import { NavLink } from 'react-router-dom';
import useAutorizaciones from '../hooks/useAutorizaciones';
import Icon from './Icon';
export default function Nav() {
  const { usuario, permisos, cerrarSesion } = useAutorizaciones();
  if (!usuario) return null;
  const salir = () => {
    if (document.querySelector('[data-unsaved="true"]') &&
      !window.confirm('Hay datos sin guardar. ¿Querés cerrar sesión y descartarlos?')) return;
    cerrarSesion();
  };
  return <>
    <nav className="app-nav" aria-label="Navegación principal">
      <NavLink to="/" end><Icon name="home" />Inicio</NavLink>
      <NavLink to="/clientes"><Icon name="clients" />Clientes</NavLink>
      {permisos.administrar && <>
        <NavLink to="/cuentas"><Icon name="accounts" />Cuentas</NavLink>
        <NavLink to="/historial-administrativo"><Icon name="history" />Historial administrativo</NavLink>
      </>}
      <NavLink to="/mi-cuenta"><Icon name="lock" />Mi cuenta</NavLink>
    </nav>
    <div className="sidebar-session"><div className="session-person">
      <span className="user-initial" aria-hidden="true">{usuario.nombre?.slice(0, 1)}</span>
      <div><strong>{usuario.nombre}</strong><span>{usuario.rol}</span></div>
    </div><button className="session-exit" onClick={salir}><Icon name="logout" size={18} />Cerrar sesión</button></div>
  </>;
}
