import { Link, Navigate } from 'react-router-dom';
import useAutorizaciones from '../hooks/useAutorizaciones';
export default function RutaProtegida({ children, administrativa = false }) {
  const { usuario, permisos } = useAutorizaciones();
  if (!usuario) return <Navigate to="/login" replace />;
  if (!permisos.comercial || (administrativa && !permisos.administrar)) return <section className="state-box" role="alert">
    <h1>Acceso no permitido</h1><p>Tu rol no permite consultar esta sección.</p><Link className="button button-secondary" to="/">Volver a Inicio</Link>
  </section>;
  return children;
}
