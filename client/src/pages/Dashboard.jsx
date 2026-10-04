import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAutorizaciones from '../hooks/useAutorizaciones';
import clientesService from '../services/clientesService';
import cuentasService from '../services/cuentasService';
import { ROLES } from '../services/sesionStore';
import { mensajeError } from '../services/validacion';
import Icon from '../components/Icon';
export default function Dashboard() {
  const { usuario, permisos } = useAutorizaciones();
  const [clientes, setClientes] = useState(null), [cuentas, setCuentas] = useState(null);
  const [errorClientes, setErrorClientes] = useState(''), [errorCuentas, setErrorCuentas] = useState('');
  const [intento, setIntento] = useState(0);
  const administrar = permisos.administrar;
  useEffect(() => {
    let vigente = true;
    clientesService.obtenerClientes().then(datos => { if (vigente) setClientes(datos); })
      .catch(error => { if (vigente) setErrorClientes(mensajeError(error)); });
    if (administrar) cuentasService.listar().then(datos => { if (vigente) setCuentas(datos); })
      .catch(error => { if (vigente) setErrorCuentas(mensajeError(error)); });
    return () => { vigente = false; };
  }, [administrar, intento]);
  const reintentar = () => { setClientes(null); setCuentas(null); setErrorClientes(''); setErrorCuentas(''); setIntento(n => n + 1); };
  return <section className="dashboard" aria-labelledby="inicio-titulo">
    <div className="page-heading"><div><h1 id="inicio-titulo">Inicio</h1><p className="muted">Hola, {usuario.nombre}. Este es tu espacio de trabajo.</p></div></div>
    <section className="directory-entry" aria-labelledby="directorio-titulo">
      <div className="entry-heading"><h2 id="directorio-titulo">Tu directorio de clientes</h2>
        <p className="client-total" role="status" aria-busy={clientes === null && !errorClientes}>
          {errorClientes ? 'Total no disponible' : clientes === null ? 'Consultando clientes…' : new Intl.NumberFormat('es-AR').format(clientes.length) + ' clientes registrados'}
        </p>
      </div><p>Encontrá los datos de contacto, consultá una ficha<br className="desktop-break" /> o sumá un cliente a tu directorio.</p>
      <Link className="button button-primary" to="/clientes">Ir a clientes<Icon name="arrow" size={18} /></Link>
    </section>
    {errorClientes && <p className="inline-message error-message" role="alert">{errorClientes}</p>}
    <div className="home-secondary">
      <section className="session-section" aria-labelledby="sesion-titulo"><h2 id="sesion-titulo">Tu sesión</h2>
        <dl className="data-grid"><div><dt>Usuario</dt><dd>{usuario.nombre}</dd></div><div><dt>Email</dt><dd>{usuario.email}</dd></div><div><dt>Rol</dt><dd>{usuario.rol}</dd></div></dl>
        <Link to="/mi-cuenta">Ver mi cuenta</Link>
      </section>
      {administrar && <section className="team-summary" aria-labelledby="equipo-titulo"><h2 id="equipo-titulo">Cuentas del equipo</h2>
        <p className="muted">Distribución por rol y estado</p>
        {errorCuentas ? <p className="inline-message error-message" role="alert">{errorCuentas}</p> :
          cuentas === null ? <p role="status">Consultando cuentas…</p> :
          <dl className="sector-counts">{ROLES.map(rol => <div key={rol}><dt>{rol}</dt><dd>
            {cuentas.filter(c => c.rol === rol && c.activo).length} activas · {cuentas.filter(c => c.rol === rol && !c.activo).length} inactivas
          </dd></div>)}</dl>}
        <Link to="/cuentas">Gestionar cuentas</Link>
      </section>}
    </div>
    {(errorClientes || errorCuentas) && <button className="button button-secondary" onClick={reintentar}>Reintentar consultas</button>}
  </section>;
}
