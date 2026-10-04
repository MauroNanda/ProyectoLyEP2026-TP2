import { useEffect, useRef, useState } from 'react';
import auditoriaService, { TIPOS_EVENTO, filtrosIniciales, prepararFiltros } from '../services/auditoriaService';
import cuentasService from '../services/cuentasService';
import { erroresDeApi, mensajeError, enfocarError } from '../services/validacion';
import Campo from '../components/Campo';
const vacia = { items: [], nextCursor: null, pila: [null] };
const fechaVisible = fecha => new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(fecha));
export default function HistorialAdministrativo() {
  const [valores, setValores] = useState(filtrosIniciales), [errores, setErrores] = useState({});
  const [consulta, setConsulta] = useState({ query: { limit: '50' }, pila: [null] });
  const [pagina, setPagina] = useState(vacia), [cargando, setCargando] = useState(true), [fallo, setFallo] = useState('');
  const [cuentas, setCuentas] = useState([]), [falloCuentas, setFalloCuentas] = useState('');
  const form = useRef(null), secuencia = useRef(0);
  const zona = Intl.DateTimeFormat().resolvedOptions().timeZone;
  useEffect(() => { let vigente = true;
    cuentasService.listar().then(datos => { if (vigente) setCuentas(datos); }).catch(error => { if (vigente) setFalloCuentas(mensajeError(error)); });
    return () => { vigente = false; };
  }, []);
  useEffect(() => {
    if (!consulta) return;
    let vigente = true;
    const controller = new AbortController();
    const turno = ++secuencia.current;
    auditoriaService.consultar(consulta.query, consulta.pila.at(-1), { signal: controller.signal }).then(datos => {
      if (vigente && turno === secuencia.current) { setPagina({ ...datos, pila: consulta.pila }); setCargando(false); }
    }).catch(error => {
      if (vigente && turno === secuencia.current) {
        setFallo(mensajeError(error)); setCargando(false);
        const campos = erroresDeApi(error, { tipo: 'tipo', actorId: 'actorId', desde: 'desde', hasta: 'hasta', limit: 'limit' });
        setErrores(campos); enfocarError(form.current, campos);
      }
    });
    return () => { vigente = false; controller.abort(); };
  }, [consulta]);
  const cambiar = e => setValores(v => ({ ...v, [e.target.name]: e.target.value }));
  const filtrar = siguientes => {
    ++secuencia.current;
    const { errores: invalidos, query } = prepararFiltros(siguientes);
    setValores(siguientes); setErrores(invalidos); setFallo(''); setPagina(vacia);
    if (Object.keys(invalidos).length) { setConsulta(null); setCargando(false); return; }
    setCargando(true); setConsulta({ query, pila: [null] });
  };
  const mover = pila => {
    setFallo(''); setCargando(true); setConsulta({ query: consulta.query, pila });
  };
  return <section aria-labelledby="historial-titulo">
    <div className="page-heading"><div><h1 id="historial-titulo">Historial administrativo</h1><p className="muted">Accesos y cambios registrados por el servidor. Consulta de solo lectura.</p></div></div>
    <form ref={form} className="audit-filters" noValidate onSubmit={e => { e.preventDefault(); filtrar(valores); enfocarError(form.current, prepararFiltros(valores).errores); }}>
      <div className="filter-grid">
        <Campo nombre="tipo" label="Tipo de evento" valor={valores.tipo} error={errores.tipo} onChange={cambiar}>
          <option value="">Todos los tipos</option>{TIPOS_EVENTO.map(tipo => <option key={tipo} value={tipo}>{tipo.replaceAll('_', ' ')}</option>)}
        </Campo>
        <Campo nombre="actorId" label="Cuenta responsable" valor={valores.actorId} error={errores.actorId} onChange={cambiar}>
          <option value="">Todas las cuentas</option>{cuentas.map(c => <option key={c.id} value={c.id}>{c.nombre} · {c.email}{c.activo ? '' : ' · inactiva'}</option>)}
        </Campo>
        <Campo nombre="desde" label="Desde" tipo="datetime-local" valor={valores.desde} error={errores.desde} onChange={cambiar} />
        <Campo nombre="hasta" label="Hasta" tipo="datetime-local" valor={valores.hasta} error={errores.hasta} onChange={cambiar} />
        <Campo nombre="limit" label="Eventos por consulta" tipo="number" min="1" max="100" step="1" valor={valores.limit} error={errores.limit} onChange={cambiar} />
      </div>
      <p className="muted">Fechas y horas en {zona}. Aplicá los filtros con Actualizar historial; la consulta vuelve al inicio.</p>
      <div className="form-actions"><button className="button button-secondary" type="submit">Actualizar historial</button>
        <button className="button button-secondary" type="button" onClick={() => filtrar(filtrosIniciales)}>Limpiar filtros</button></div>
    </form>
    {falloCuentas && <p className="inline-message error-message" role="alert">No pudimos cargar las cuentas para el filtro. Podés consultar los demás filtros. {falloCuentas}</p>}
    {fallo && <p className="inline-message error-message" role="alert">{fallo} Podés reintentar con Actualizar historial.</p>}
    {cargando && <p role="status">Consultando eventos…</p>}
    {!cargando && !fallo && !Object.keys(errores).length && pagina.items.length === 0 && <p className="state-box">No hay eventos que coincidan con estos filtros.</p>}
    {pagina.items.length > 0 && <div className="audit-events" aria-busy={cargando}>
      <p className="result-count" role="status">{pagina.items.length} eventos en esta consulta · orden del más reciente al más antiguo</p>
      <ol className="audit-list">{pagina.items.map(evento => {
        const actor = cuentas.find(c => c.id === evento.actorId);
        return <li key={evento.id}>
          <div className="event-heading"><strong>{evento.tipo.replaceAll('_', ' ')}</strong><time dateTime={evento.fecha}>{fechaVisible(evento.fecha)} · {zona}</time></div>
          <dl className="event-data">
            <div><dt>Responsable</dt><dd>{evento.actorId ? <>{actor?.nombre && <span>{actor.nombre} (nombre actual)<br /></span>}{evento.actorId}<br />Rol registrado: {evento.rol || 'Sin rol'}</> : 'Sin actor identificado'}</dd></div>
            <div><dt>Recurso</dt><dd>{evento.recurso}{evento.recursoId && <><br />{evento.recursoId}</>}</dd></div>
            <div><dt>Resultado</dt><dd>{evento.resultado}</dd></div>
            <div><dt>Solicitud</dt><dd>{evento.requestId || 'Sin identificador'}</dd></div>
            {evento.camposModificados?.length > 0 && <div><dt>Campos modificados</dt><dd>{evento.camposModificados.join(', ')}</dd></div>}
          </dl>
        </li>;
      })}</ol>
    </div>}
    <nav className="cursor-navigation" aria-label="Paginación del historial">
      <button className="button button-secondary" disabled={cargando || !consulta || pagina.pila.length < 2} onClick={() => mover(pagina.pila.slice(0, -1))}>Anterior</button>
      <span className="muted">{!cargando && pagina.items.length > 0 && !pagina.nextCursor ? 'Fin de los resultados' : 'Paginación por cursor'}</span>
      <button className="button button-secondary" disabled={cargando || !consulta || !pagina.nextCursor} onClick={() => mover([...pagina.pila, pagina.nextCursor])}>Siguiente</button>
    </nav>
  </section>;
}
