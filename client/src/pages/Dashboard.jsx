import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useAutorizaciones from "../hooks/useAutorizaciones";
import AutorizacionesService from "../services/autorizacionesServices";
import Icon from "../components/Icon";
import Login from "./Login";

import clientesService from "../services/clientesService";

const Dashboard = () => {
  const { admin } = useAutorizaciones();
  const usuariosPorSector = AutorizacionesService.contarUsuariosPorSector();
  const [totalClientes, setTotalClientes] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vigente = true;

    clientesService
      .obtenerClientes()
      .then((data) => {
        if (!vigente) return;
        setTotalClientes(Array.isArray(data) ? data.length : 0);
        setCargando(false);
      })
      .catch(() => {
        if (!vigente) return;
        setError(true);
        setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  if (!admin) return <Login />;
  return (
    <section className="dashboard" aria-labelledby="inicio-titulo">
      <div className="page-heading">
        <div>
          <h1 id="inicio-titulo">Inicio</h1>
          <p className="muted">
            Hola, {admin.nombre}. Este es tu espacio de trabajo.
          </p>
        </div>
      </div>
      <section className="directory-entry" aria-labelledby="directorio-titulo">
        <div className="entry-heading">
          <h2 id="directorio-titulo">Tu directorio de clientes</h2>
          <p className="client-total" role="status" aria-busy={cargando}>
            {cargando
              ? "Consultando clientes…"
              : error
                ? "Total no disponible"
                : new Intl.NumberFormat("es-AR").format(totalClientes) +
                  " clientes registrados"}
          </p>
        </div>
        <p>
          Encontrá los datos de contacto, consultá una ficha
          <br className="desktop-break" /> o sumá un cliente a tu directorio.
        </p>
        <Link className="button button-primary" to="/clientes">
          Ir a clientes
          <Icon name="arrow" size={18} />
        </Link>
      </section>
      <div className="home-secondary">
        <section className="session-section" aria-labelledby="sesion-titulo">
          <h2 id="sesion-titulo">Tu sesión</h2>
          <dl className="data-grid">
            <div>
              <dt>Usuario</dt>
              <dd>{admin.nombre}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{admin.email}</dd>
            </div>
            <div>
              <dt>Sector</dt>
              <dd>{admin.sector}</dd>
            </div>
          </dl>
        </section>
        <section className="team-summary">
          <h2>Usuarios de acceso</h2>
          <p className="muted">Distribución por sector</p>
          <dl className="sector-counts">
            {Object.entries(usuariosPorSector).map(([nombre, cantidad]) => (
              <div key={nombre}>
                <dt>{nombre}</dt>
                <dd>{new Intl.NumberFormat("es-AR").format(cantidad)}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </section>
  );
};
export default Dashboard;
