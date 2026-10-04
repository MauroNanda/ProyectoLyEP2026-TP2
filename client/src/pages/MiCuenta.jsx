import { useEffect, useRef, useState } from 'react';
import useAutorizaciones from '../hooks/useAutorizaciones';
import useUnsavedChanges from '../hooks/useUnsavedChanges';
import auth from '../services/autorizacionesServices';
import { validarPassword, erroresDeApi, mensajeError, enfocarError } from '../services/validacion';
import Campo from '../components/Campo';
const inicial = { actual: '', nueva: '', confirmacion: '' };
export default function MiCuenta() {
  const { usuario, cambiarPassword } = useAutorizaciones();
  const [valores, setValores] = useState(inicial), [errores, setErrores] = useState({});
  const [fallo, setFallo] = useState(''), [cargando, setCargando] = useState(false);
  const form = useRef(null), pendiente = useRef(false);
  const dirty = Object.values(valores).some(Boolean);
  useUnsavedChanges(dirty);
  useEffect(() => { let vigente = true;
    auth.me().catch(error => { if (vigente) setFallo(mensajeError(error)); });
    return () => { vigente = false; };
  }, []);
  const enviar = async e => {
    e.preventDefault();
    if (pendiente.current) return;
    const invalidos = validarPassword(valores); setErrores(invalidos); setFallo('');
    if (Object.keys(invalidos).length) { enfocarError(form.current, invalidos); return; }
    pendiente.current = true; setCargando(true);
    try { await cambiarPassword(valores.actual, valores.nueva); setValores(inicial); }
    catch (error) {
      const campos = erroresDeApi(error, { actual: 'actual', nueva: 'nueva' });
      setErrores(campos); setFallo(error.code === 'CREDENCIALES_INVALIDAS' ? 'Revisá tu contraseña actual.' : mensajeError(error));
      enfocarError(form.current, campos);
      if (error.code === 'CREDENCIALES_INVALIDAS') auth.me().catch(() => {});
    } finally { pendiente.current = false; setCargando(false); }
  };
  return <section aria-labelledby="cuenta-titulo" data-unsaved={dirty ? 'true' : 'false'}>
    <div className="page-heading"><div><h1 id="cuenta-titulo">Mi cuenta</h1><p className="muted">Tus datos de acceso y tu contraseña.</p></div></div>
    <dl className="data-grid"><div><dt>Nombre</dt><dd>{usuario.nombre}</dd></div><div><dt>Email</dt><dd>{usuario.email}</dd></div><div><dt>Rol</dt><dd>{usuario.rol}</dd></div></dl>
    <section className="personal-password" aria-labelledby="password-titulo">
      <h2 id="password-titulo">Cambiar contraseña</h2><p className="muted">Al confirmar se cerrarán todas tus sesiones. Usá entre 12 y 128 caracteres; los espacios cuentan.</p>
      <form ref={form} onSubmit={enviar} noValidate aria-busy={cargando}><fieldset disabled={cargando}>
        {Object.entries({ actual: 'Contraseña actual', nueva: 'Nueva contraseña', confirmacion: 'Confirmar nueva contraseña' }).map(([nombre, label]) =>
          <Campo key={nombre} nombre={nombre} label={label} tipo="password" autoComplete={nombre === 'actual' ? 'current-password' : 'new-password'}
            valor={valores[nombre]} error={errores[nombre]} onChange={e => setValores({ ...valores, [nombre]: e.target.value })} />)}
        {(fallo || Object.keys(errores).length > 0) && <p className="inline-message error-message" role="alert">{fallo || 'Revisá los campos indicados.'}</p>}
        <button className="button button-primary" type="submit">{cargando ? 'Cambiando…' : 'Cambiar contraseña'}</button>
      </fieldset></form>
    </section>
  </section>;
}
