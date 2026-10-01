import '../css/detallecliente.css';
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import clientesService from "../services/clientesService";
import useAutorizaciones from "../hooks/useAutorizaciones";

const DetalleCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sector } = useAutorizaciones();

  const [cliente, setCliente] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [errorCarga, setErrorCarga] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Declaración necesaria para los permisos de borrado
  const puedeEliminar = sector?.trim() === "Gerencia";

  useEffect(() => {
    clientesService
      .obtenerClientePorId(id)
      .then((data) => setCliente(data))
      .catch(() => setErrorCarga(true));
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mostrarModal) {
        setMostrarModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mostrarModal]);

  const solicitarConfirmacion = () => {
    if (!puedeEliminar) {
      setMensaje("No tiene permisos para eliminar clientes");
      return;
    }
    setMostrarModal(true);
  };

  const confirmarEliminacion = async () => {
    setMostrarModal(false);
    try {
      await clientesService.eliminarCliente(id);
      setMensaje("Cliente eliminado correctamente");

      setTimeout(() => {
        navigate("/clientes");
      }, 2000);
    } catch {
      setMensaje("Error al eliminar cliente");
    }
  };

  if (errorCarga) {
    return <h2>Error al cargar el detalle del cliente.</h2>;
  }

  if (!cliente) {
    return <h2>Cargando cliente...</h2>;
  }

  return (
    <div className="detalle-cliente">
      <h1>Ficha del Cliente</h1>
      <p>Rol actual: {sector}</p>

      {mensaje && <p className="mensaje-eliminado">{mensaje}</p>}

      <p>
        <strong>ID:</strong> {cliente.id}
      </p>

      <p>
        <strong>Nombre:</strong>{" "}
        {cliente.name.firstname} {cliente.name.lastname}
      </p>

      <p>
        <strong>Email:</strong> {cliente.email}
      </p>

      <p>
        <strong>Teléfono:</strong> {cliente.phone}
      </p>

      <h2>Dirección</h2>

      <p>
        <strong>Calle:</strong> {cliente.address.street}
      </p>

      <p>
        <strong>Número:</strong> {cliente.address.number}
      </p>

      <p>
        <strong>Código Postal:</strong> {cliente.address.zipcode}
      </p>

      <p>
        <strong>Ciudad:</strong> {cliente.address.city}
      </p>

      <h2>Credenciales</h2>

      <p>
        <strong>Usuario:</strong> {cliente.username}
      </p>

      <p>
        <strong>Contraseña:</strong> {cliente.password}
      </p>

      {puedeEliminar && (
        <button className="btn-eliminar" onClick={solicitarConfirmacion}>
          Eliminar Cliente
        </button>
      )}

      {mostrarModal && (
        <div 
          className="modal-overlay" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-titulo"
        >
          <div className="modal-contenido">
            <h3 id="modal-titulo">Confirmar eliminación</h3>
            <p>
              ¿Está seguro de que desea eliminar al cliente{" "}
              <strong>{cliente.name.firstname} {cliente.name.lastname}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="modal-acciones">
              <button 
                className="btn-cancelar" 
                onClick={() => setMostrarModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirmar-eliminar" 
                onClick={confirmarEliminacion}
                autoFocus
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleCliente;