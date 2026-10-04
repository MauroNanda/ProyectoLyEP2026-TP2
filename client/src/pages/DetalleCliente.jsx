import { Link } from "react-router-dom";
import { Modal, Button, Spinner } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import clientesService from "../services/clientesService";
import Icon from "../components/Icon";
import useAutorizaciones from "../hooks/useAutorizaciones";
import { mensajeError } from "../services/validacion";

const DetalleCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rol, permisos } = useAutorizaciones();

  const [cliente, setCliente] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [errorCarga, setErrorCarga] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorBaja, setErrorBaja] = useState("");
  const deletePending = useRef(false);

  // Declaración necesaria para los permisos de borrado
  const puedeEliminar = permisos.eliminar;

  useEffect(() => {
    let vigente = true;
    clientesService
      .obtenerClientePorId(id)
      .then((data) => {
        if (vigente) setCliente(data);
      })
      .catch(() => {
        if (vigente) setErrorCarga(id);
      });
    return () => {
      vigente = false;
    };
  }, [id]);

  const solicitarConfirmacion = () => {
    if (!puedeEliminar) {
      setMensaje("No tiene permisos para eliminar clientes");
      return;
    }
    setErrorBaja("");
    setMostrarModal(true);
  };

  const confirmarEliminacion = async () => {
    if (!puedeEliminar || deletePending.current) return;
    deletePending.current = true;
    setEliminando(true);
    setErrorBaja("");
    try {
      await clientesService.eliminarCliente(id);
      setMostrarModal(false);
      navigate("/clientes", {
        state: { notice: "Cliente eliminado correctamente." },
      });
    } catch (error) {
      setErrorBaja(
        mensajeError(error),
      );
    } finally {
      deletePending.current = false;
      setEliminando(false);
    }
  };

  if (errorCarga === id)
    return (
      <div className="state-box state-error" role="alert">
        <h1>No se pudo cargar la ficha</h1>
        <p>Volvé al listado para consultar el cliente nuevamente.</p>
        <Link to="/clientes" className="button button-secondary">
          Volver a clientes
        </Link>
      </div>
    );
  if (!cliente || String(cliente.id) !== id)
    return (
      <div className="state-box" role="status">
        Cargando ficha…
      </div>
    );
  const nombre =
    [cliente.name?.firstname, cliente.name?.lastname]
      .filter(Boolean)
      .join(" ") || "Sin nombre";
  const dato = (valor) =>
    valor === undefined || valor === null || valor === ""
      ? "No informado"
      : valor;
  return (
    <section className="detalle-cliente" aria-labelledby="ficha-titulo">
      <Link className="back-link" to="/clientes">
        <Icon name="back" size={18} /> Volver a clientes
      </Link>
      <div className="page-heading">
        <div>
          <h1 id="ficha-titulo">{nombre}</h1>
          <p className="muted">
            {cliente.address?.city || "Ciudad no informada"} · ID: {cliente.id}
          </p>
        </div>
      </div>
      {mensaje && (
        <p className="state-box" role="status">
          {mensaje}
        </p>
      )}
      <div className="detail-section">
        <h2>Contacto</h2>
        <dl className="data-grid">
          <div>
            <dt>Email</dt>
            <dd>{dato(cliente.email)}</dd>
          </div>
          <div>
            <dt>Teléfono</dt>
            <dd>{dato(cliente.phone)}</dd>
          </div>
          {cliente.username && (
            <div>
              <dt>Usuario</dt>
              <dd>{cliente.username}</dd>
            </div>
          )}
        </dl>
      </div>
      <div className="detail-section">
        <h2>Dirección</h2>
        <dl className="data-grid">
          <div>
            <dt>Calle</dt>
            <dd>{dato(cliente.address?.street)}</dd>
          </div>
          <div>
            <dt>Número</dt>
            <dd>{dato(cliente.address?.number)}</dd>
          </div>
          <div>
            <dt>Código postal</dt>
            <dd>{dato(cliente.address?.zipcode)}</dd>
          </div>
          <div>
            <dt>Ciudad</dt>
            <dd>{dato(cliente.address?.city)}</dd>
          </div>
        </dl>
      </div>

      {puedeEliminar && (
        <div className="danger-zone">
          <div>
            <h2>Eliminar cliente</h2>
            <p className="muted">
              Esta acción requiere confirmación. Rol actual: {rol}.
            </p>
          </div>
          <button
            className="button button-danger"
            onClick={solicitarConfirmacion}
          >
            Eliminar cliente
          </button>
        </div>
      )}
      <Modal
        show={mostrarModal}
        onHide={() => {
          if (!eliminando) setMostrarModal(false);
        }}
        keyboard={!eliminando}
        backdrop={eliminando ? "static" : true}
        centered
        aria-labelledby="modal-titulo"
      >
        <Modal.Header
          closeButton={!eliminando}
          closeLabel="Cerrar confirmación"
        >
          <Modal.Title id="modal-titulo">Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Eliminar a <strong>{nombre}</strong>? Esta acción no se puede
          deshacer.
          {errorBaja && (
            <p className="inline-message error-message" role="alert">
              {errorBaja}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="button-secondary"
            onClick={() => setMostrarModal(false)}
            disabled={eliminando}
            autoFocus
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            disabled={eliminando}
            onClick={confirmarEliminacion}
          >
            {eliminando && <Spinner size="sm" aria-hidden="true" />}
            Confirmar eliminación
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};
export default DetalleCliente;
