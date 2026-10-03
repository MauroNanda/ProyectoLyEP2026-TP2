import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import FormCliente from "../components/FormCliente";
import Icon from "../components/Icon";
import ApachetaLogo from "../components/ApachetaLogo";
import clientesService from "../services/clientesService";

const ListaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [requestKey, setRequestKey] = useState(0);
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const altaTrigger = useRef(null);
  const busqueda = params.get("q") || "";
  const altaAbierta = params.get("alta") === "1";
  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const retry = () => {
    setLoading(true);
    setError(false);
    setRequestKey((key) => key + 1);
  };
  useEffect(() => {
    if (altaAbierta) document.getElementById("cliente-nombre")?.focus();
  }, [altaAbierta]);

  const toggleAlta = () => {
    updateParam("alta", altaAbierta ? "" : "1");
    if (altaAbierta) altaTrigger.current?.focus();
  };
  useEffect(() => {
    let vigente = true;
    clientesService
      .obtenerClientes()
      .then((data) => {
        if (vigente) {
          setClientes(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (vigente) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      vigente = false;
    };
  }, [requestKey]);
  const query = busqueda.trim().toLowerCase();
  const filtrados = clientes.filter(
    (cliente) =>
      (cliente.name?.lastname || "").toLowerCase().includes(query) ||
      (cliente.address?.city || "").toLowerCase().includes(query),
  );
  return (
    <section aria-labelledby="clientes-titulo">
      <div className="page-heading">
        <div>
          <h1 id="clientes-titulo">Clientes</h1>
          <p className="muted">Una ficha para cada relación comercial.</p>
        </div>
        <button
          ref={altaTrigger}
          className={
            "button " + (altaAbierta ? "button-secondary" : "button-primary")
          }
          aria-expanded={altaAbierta}
          aria-controls="panel-alta"
          onClick={toggleAlta}
        >
          <Icon name={altaAbierta ? "close" : "plus"} size={18} />
          {altaAbierta ? "Cerrar formulario" : "Agregar cliente"}
        </button>
      </div>
      {location.state?.notice && (
        <p className="inline-message success-message" role="status">
          <Icon name="check" />
          {location.state.notice}
        </p>
      )}
      <div className="directory-toolbar">
        <div className="search-field">
          <label htmlFor="buscar-cliente">Buscar por apellido o ciudad</label>
          <div className="input-with-icon">
            <Icon name="search" size={18} />
            <input
              id="buscar-cliente"
              name="buscar-cliente"
              type="search"
              autoComplete="off"
              placeholder="Apellido o ciudad…"
              value={busqueda}
              onChange={(event) => updateParam("q", event.target.value)}
            />
          </div>
        </div>
        <p className="result-count" role="status">
          {loading
            ? "Consultando directorio…"
            : error
              ? "Consulta no disponible"
              : new Intl.NumberFormat("es-AR").format(filtrados.length) +
                (filtrados.length === 1
                  ? " cliente encontrado"
                  : " clientes encontrados")}
        </p>
      </div>
      {loading ? (
        <div
          className="directory-loading"
          role="status"
          aria-label="Cargando clientes"
        >
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <span className="visually-hidden">Cargando clientes…</span>
        </div>
      ) : error ? (
        <div className="state-box">
          <Icon name="alert" size={28} />
          <h2>No se pudieron cargar los clientes</h2>
          <p>La consulta falló. Intentá nuevamente sin salir de esta página.</p>
          <button className="button button-secondary" onClick={retry}>
            <Icon name="refresh" size={18} />
            Reintentar
          </button>
        </div>
      ) : clientes.length === 0 ? (
        <div className="state-box">
          <ApachetaLogo size={44} />
          <h2>Tu directorio empieza acá</h2>
          <p>
            Todavía no hay clientes. Agregá la primera ficha con sus datos de
            contacto.
          </p>
          <button
            className="button button-secondary"
            onClick={() => {
              if (!altaAbierta) toggleAlta();
              else document.getElementById("cliente-nombre")?.focus();
            }}
          >
            Agregar el primer cliente
          </button>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="state-box">
          <Icon name="search" size={28} />
          <h2>No encontramos coincidencias</h2>
          <p>Probá con otro apellido o ciudad, o limpiá la búsqueda.</p>
          <button
            className="button button-secondary"
            onClick={() => updateParam("q", "")}
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="client-table">
            <caption className="visually-hidden">
              Clientes y datos de contacto
            </caption>
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Contacto</th>
                <th scope="col">Ciudad</th>
                <th scope="col">
                  <span className="visually-hidden">Ficha</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((cliente) => {
                const nombre =
                  [cliente.name?.firstname, cliente.name?.lastname]
                    .filter(Boolean)
                    .join(" ") || "Nombre no informado";
                return (
                  <tr key={cliente.id}>
                    <td className="client-name">
                      <strong>{nombre}</strong>
                      <span className="table-secondary">ID: {cliente.id}</span>
                    </td>
                    <td className="client-contact">
                      <span>{cliente.email || "Email no informado"}</span>
                      <span className="table-secondary">
                        {cliente.phone || "Teléfono no informado"}
                      </span>
                    </td>
                    <td className="client-city">
                      {cliente.address?.city || "Ciudad no informada"}
                    </td>
                    <td className="client-action">
                      <Link
                        className="row-link"
                        to={"/clientes/" + cliente.id}
                        aria-label={"Ver ficha de " + nombre}
                      >
                        Ver ficha
                        <Icon name="arrow" size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div id="panel-alta" className="alta-panel" hidden={!altaAbierta}>
        <FormCliente onCreated={retry} />
      </div>
    </section>
  );
};
export default ListaClientes;
