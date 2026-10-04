import { useEffect, useRef, useState } from 'react';
import cuentasService from '../services/cuentasService';
import useAutorizaciones from '../hooks/useAutorizaciones';
import useUnsavedChanges from '../hooks/useUnsavedChanges';
import { ROLES } from '../services/sesionStore';
import { validarCuenta, cambioCuenta, erroresDeApi, mensajeError, enfocarError } from '../services/validacion';
import Campo from '../components/Campo';
import Icon from '../components/Icon';

function FormCuenta({ cuenta, onSaved, onClose }) {
  const edicion = !!cuenta.id;
  const { usuario, actualizarUsuario, terminarSesion } = useAutorizaciones();
  const [valores, setValores] = useState({ nombre: cuenta.nombre || '', email: cuenta.email || '', rol: cuenta.rol || 'Soporte', activo: cuenta.activo ?? true, password: '' });
  const [errores, setErrores] = useState({}), [fallo, setFallo] = useState(''), [cargando, setCargando] = useState(false);
  const form = useRef(null), pendiente = useRef(false);
  const dirty = edicion ? Object.keys(cambioCuenta(cuenta, valores)).length > 0 : !!(valores.nombre || valores.email || valores.password || valores.rol !== 'Soporte');
  useUnsavedChanges(dirty);
  useEffect(() => { form.current.querySelector('[name="nombre"]')?.focus(); }, []);
  const cambiar = e => setValores({ ...valores, [e.target.name]: e.target.name === 'activo' ? e.target.value === 'true' : e.target.value });
  const cerrar = () => {
    if (dirty && !window.confirm('Hay datos sin guardar. ¿Querés descartarlos?')) return;
    onClose();
  };
  const enviar = async e => {
    e.preventDefault();
    if (pendiente.current) return;
    const invalidos = validarCuenta(valores, edicion); setErrores(invalidos); setFallo('');
    if (Object.keys(invalidos).length) { enfocarError(form.current, invalidos); return; }
    const cambios = edicion ? cambioCuenta(cuenta, valores) : null;
    if (edicion && !Object.keys(cambios).length) { setFallo('No hay cambios para guardar.'); return; }
    if (edicion && ('rol' in cambios || 'activo' in cambios) &&
      !window.confirm('Cambiar el rol o el estado cerrará las sesiones de esta cuenta. ¿Querés confirmar?')) return;
    pendiente.current = true; setCargando(true);
    try {
      const guardada = edicion ? await cuentasService.actualizar(cuenta.id, cambios) :
        await cuentasService.crear({ nombre: valores.nombre.trim(), email: valores.email.trim().toLowerCase(), rol: valores.rol, password: valores.password });
      setValores(v => ({ ...v, password: '' }));
      if (edicion && cuenta.id === usuario.id) {
        if ('rol' in cambios || 'activo' in cambios) {
          terminarSesion('Tu cuenta fue actualizada y tus sesiones se cerraron. Volvé a ingresar.'); return;
        }
        actualizarUsuario(guardada);
      }
      onSaved(edicion ? 'Cuenta actualizada.' : 'Cuenta creada. Entregá la contraseña inicial por un canal privado.');
    } catch (error) {
      const campos = erroresDeApi(error, { nombre: 'nombre', email: 'email', rol: 'rol', activo: 'activo', password: 'password' });
      setErrores(campos); setFallo(mensajeError(error)); enfocarError(form.current, campos);
    } finally { pendiente.current = false; setCargando(false); }
  };
  return <section className="alta-panel account-editor" aria-labelledby="editor-titulo" data-unsaved={dirty ? 'true' : 'false'}>
    <div className="form-intro"><h2 id="editor-titulo">{edicion ? 'Editar cuenta' : 'Crear cuenta'}</h2>
      <p className="muted">{edicion ? 'El correo no se modifica. Los cambios de rol o estado revocan las sesiones.' : 'La cuenta se crea activa. La contraseña inicial se entrega por un canal privado.'}</p></div>
    <form ref={form} onSubmit={enviar} noValidate aria-busy={cargando}><fieldset disabled={cargando}>
      <div className="form-grid">
        <Campo nombre="nombre" label="Nombre" valor={valores.nombre} onChange={cambiar} error={errores.nombre} autoComplete="name" />
        <Campo nombre="email" label="Email" tipo="email" valor={valores.email} onChange={cambiar} error={errores.email} readOnly={edicion} autoComplete="off" spellCheck={false} />
        <Campo nombre="rol" label="Rol" valor={valores.rol} onChange={cambiar} error={errores.rol}>{ROLES.map(rol => <option key={rol}>{rol}</option>)}</Campo>
        {edicion ? <Campo nombre="activo" label="Estado" valor={String(valores.activo)} onChange={cambiar} error={errores.activo}>
          <option value="true">Activa</option><option value="false">Inactiva</option>
        </Campo> : <Campo nombre="password" label="Contraseña inicial" tipo="password" valor={valores.password} onChange={cambiar}
          error={errores.password} autoComplete="new-password" ayuda="Entre 12 y 128 caracteres; los espacios cuentan." />}
      </div>
      {(fallo || Object.keys(errores).length > 0) && <p className="inline-message error-message" role="alert">{fallo || 'Revisá los campos indicados.'}</p>}
      <div className="form-actions"><button className="button button-primary" type="submit">{cargando ? 'Guardando…' : edicion ? 'Guardar cambios' : 'Crear cuenta'}</button>
        <button className="button button-secondary" type="button" onClick={cerrar}>Cancelar</button></div>
    </fieldset></form>
  </section>;
}
export default function Cuentas() {
  const [cuentas, setCuentas] = useState([]), [editor, setEditor] = useState(null);
  const [cargando, setCargando] = useState(true), [fallo, setFallo] = useState(''), [aviso, setAviso] = useState('');
  const [intento, setIntento] = useState(0);
  const trigger = useRef(null);
  const [busqueda, setBusqueda] = useState(''), [rolFiltro, setRolFiltro] = useState(''), [estadoFiltro, setEstadoFiltro] = useState('');
  const visibles = cuentas.filter(c => (!rolFiltro || c.rol === rolFiltro) &&
    (!estadoFiltro || String(c.activo) === estadoFiltro) &&
    (!busqueda.trim() || [c.nombre, c.email].some(texto => texto.toLocaleLowerCase('es').includes(busqueda.trim().toLocaleLowerCase('es')))));
  useEffect(() => {
    let vigente = true;
    cuentasService.listar().then(datos => { if (vigente) { setCuentas(datos); setCargando(false); } })
      .catch(error => { if (vigente) { setFallo(mensajeError(error)); setCargando(false); } });
    return () => { vigente = false; };
  }, [intento]);
  const actualizar = () => { setFallo(''); setCargando(true); setIntento(n => n + 1); };
  const cerrar = () => { setEditor(null); requestAnimationFrame(() => trigger.current?.focus()); };
  const abrir = cuenta => {
    if (document.querySelector('[data-unsaved="true"]') && !window.confirm('Hay datos sin guardar. ¿Querés descartarlos?')) return;
    setEditor(cuenta); setAviso('');
  };
  return <section aria-labelledby="cuentas-titulo">
    <div className="page-heading"><div><h1 id="cuentas-titulo">Cuentas</h1><p className="muted">Administrá el acceso de tu equipo a Apacheta.</p></div>
      <button ref={trigger} className="button button-primary" disabled={!!editor} onClick={() => abrir({})}><Icon name="plus" size={18} />Crear cuenta</button></div>
    {aviso && <p className="inline-message success-message" role="status">{aviso}</p>}
    {editor && <FormCuenta key={editor.id || 'alta'} cuenta={editor} onClose={cerrar} onSaved={mensaje => { cerrar(); setAviso(mensaje); actualizar(); }} />}
    {fallo && <div className="inline-message error-message" role="alert">{fallo}<button className="button button-secondary" onClick={actualizar}>Reintentar</button></div>}
    <div className="audit-filters" role="search" aria-label="Filtrar cuentas">
      <div className="filter-grid">
        <Campo nombre="buscarCuenta" label="Buscar por nombre o email" tipo="search" valor={busqueda} onChange={e => setBusqueda(e.target.value)} />
        <Campo nombre="rolFiltro" label="Filtrar por rol" valor={rolFiltro} onChange={e => setRolFiltro(e.target.value)}>
          <option value="">Todos los roles</option>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </Campo>
        <Campo nombre="estadoFiltro" label="Filtrar por estado" valor={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}>
          <option value="">Todos los estados</option><option value="true">Activas</option><option value="false">Inactivas</option>
        </Campo>
      </div>
      <button className="button button-secondary" type="button" onClick={() => { setBusqueda(''); setRolFiltro(''); setEstadoFiltro(''); }}>Limpiar filtros</button>
    </div>
    {!cargando && !fallo && <p className="result-count" role="status">{visibles.length} de {cuentas.length} cuentas</p>}
    {cargando ? <p className="state-box" role="status">Consultando cuentas…</p> : !fallo && cuentas.length === 0 ? <p className="state-box">No hay cuentas para mostrar.</p> :
      !fallo && visibles.length === 0 ? <p className="state-box">No hay cuentas que coincidan con estos filtros.</p> :
      <div className="admin-table-wrap" role="region" aria-label="Listado de cuentas, desplazable en pantallas pequeñas" tabIndex={0}><table className="admin-table"><caption className="visually-hidden">Cuentas internas y permisos de acceso</caption>
        <thead><tr><th scope="col">Nombre</th><th scope="col">Email</th><th scope="col">Rol</th><th scope="col">Estado</th><th scope="col">Acción</th></tr></thead>
        <tbody>{visibles.map(c => <tr key={c.id}><td data-label="Nombre"><strong>{c.nombre}</strong></td><td data-label="Email">{c.email}</td><td data-label="Rol">{c.rol}</td><td data-label="Estado"><span className={'account-status ' + (c.activo ? 'active' : '')}>{c.activo ? 'Activa' : 'Inactiva'}</span></td>
          <td><button className="button button-secondary" disabled={!!editor} onClick={() => abrir(c)} aria-label={'Editar cuenta de ' + c.nombre}>Editar</button></td></tr>)}</tbody>
      </table></div>}
  </section>;
}
