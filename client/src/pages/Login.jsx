import { useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAutorizaciones from '../hooks/useAutorizaciones';
import ApachetaLogo from '../components/ApachetaLogo';
import Icon from '../components/Icon';
import Campo from '../components/Campo';
import { validarAcceso, erroresDeApi, mensajeError, enfocarError } from '../services/validacion';
export default function Login() {
  const { usuario, iniciarSesion, aviso, saliendo } = useAutorizaciones();
  const [valores, setValores] = useState({ email: '', password: '' });
  const [errores, setErrores] = useState({});
  const [fallo, setFallo] = useState('');
  const [cargando, setCargando] = useState(false);
  const form = useRef(null), pendiente = useRef(false);
  if (usuario) return <Navigate to="/" replace />;
  const cambiar = e => setValores({ ...valores, [e.target.name]: e.target.value });
  const enviar = async e => {
    e.preventDefault();
    if (pendiente.current || saliendo) return;
    const invalidos = validarAcceso(valores);
    setErrores(invalidos); setFallo('');
    if (Object.keys(invalidos).length) { enfocarError(form.current, invalidos); return; }
    pendiente.current = true; setCargando(true);
    try { await iniciarSesion(valores.email.trim().toLowerCase(), valores.password); setValores({ email: '', password: '' }); }
    catch (error) {
      const campos = erroresDeApi(error, { email: 'email', password: 'password' });
      setErrores(campos); setFallo(mensajeError(error)); enfocarError(form.current, campos);
    } finally { pendiente.current = false; setCargando(false); }
  };
  return <section className="login-layout" aria-labelledby="login-titulo">
    <div className="login-story">
      <div className="login-brand" translate="no"><ApachetaLogo size={60} /><span>Apacheta</span></div>
      <div className="login-promise"><h1>Que ningún compromiso con el cliente quede en el camino.</h1><p>Seguimiento comercial para distribuidoras mayoristas del NOA.</p></div>
      <p className="login-positioning">Cerca de tus clientes.<br />En cada paso.</p>
    </div>
    <div className="login-form-side"><div className="login-form-panel">
      <h2 id="login-titulo">Volvé a tu equipo</h2><p className="muted">Ingresá con tu cuenta para consultar clientes.</p>
      {aviso && <p className="inline-message" role="status">{aviso}</p>}
      <form ref={form} onSubmit={enviar} noValidate aria-busy={cargando}>
        <fieldset disabled={cargando || saliendo}>
          <Campo nombre="email" label="Email" tipo="email" autoComplete="username" spellCheck={false}
            valor={valores.email} onChange={cambiar} error={errores.email} />
          <Campo nombre="password" label="Contraseña" tipo="password" autoComplete="current-password"
            valor={valores.password} onChange={cambiar} error={errores.password} ayuda="Entre 12 y 128 caracteres." />
          {(fallo || Object.keys(errores).length > 0) && <p className="inline-message error-message" role="alert">{fallo || 'Revisá los campos indicados.'}</p>}
          <button className="button button-primary login-submit" type="submit">{cargando ? 'Ingresando…' : 'Ingresar'}<Icon name="arrow" size={18} /></button>
        </fieldset>
      </form>
      <p className="login-help">Usá el email y la contraseña de tu cuenta. Al recargar, tendrás que ingresar nuevamente.</p>
    </div></div>
  </section>;
}
