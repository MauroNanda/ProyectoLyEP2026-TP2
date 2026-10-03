import { NavLink, useNavigate } from "react-router-dom";
import useAutorizaciones from "../hooks/useAutorizaciones";
import Icon from "./Icon";
const Nav = () => {
  const { admin, cerrarSesion } = useAutorizaciones();
  const navigate = useNavigate();
  if (!admin) return null;
  const salir = () => {
    if (
      document.querySelector('[data-unsaved="true"]') &&
      !window.confirm(
        "Hay datos sin guardar. ¿Querés cerrar sesión y descartarlos?",
      )
    )
      return;
    cerrarSesion();
    navigate("/login");
  };
  return (
    <>
      <nav className="app-nav" aria-label="Navegación principal">
        <NavLink to="/" end>
          <Icon name="home" />
          Inicio
        </NavLink>
        <NavLink to="/clientes">
          <Icon name="clients" />
          Clientes
        </NavLink>
      </nav>
      <div className="sidebar-session">
        <div className="session-person">
          <span className="user-initial" aria-hidden="true">
            {admin.nombre?.slice(0, 1)}
          </span>
          <div>
            <strong>{admin.nombre}</strong>
            <span>{admin.sector}</span>
          </div>
        </div>
        <button className="session-exit" onClick={salir}>
          <Icon name="logout" size={18} />
          Cerrar sesión
        </button>
      </div>
    </>
  );
};
export default Nav;
