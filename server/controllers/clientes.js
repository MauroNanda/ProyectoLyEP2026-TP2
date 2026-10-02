import * as servicioClientes from '../services/clientes.js';

// Adapta HTTP a servicios; rutas y respuestas de error pertenecen al servidor.
export function crearControladoresClientes(servicio) {
  return {
    listarClientes: async (req, res, next) => {
      try {
        const clientes = await servicio.listarClientes();
        return res.status(200).json(clientes);
      } catch (error) {
        return next(error);
      }
    },
    obtenerClientePorId: async (req, res, next) => {
      try {
        const cliente = await servicio.obtenerClientePorId(req.params.id);
        return res.status(200).json(cliente);
      } catch (error) {
        return next(error);
      }
    },
    crearCliente: async (req, res, next) => {
      try {
        const cliente = await servicio.crearCliente(req.body);
        return res.status(201).json(cliente);
      } catch (error) {
        return next(error);
      }
    },
    eliminarCliente: async (req, res, next) => {
      try {
        await servicio.eliminarCliente(req.params.id);
        return res.status(204).end();
      } catch (error) {
        return next(error);
      }
    },
  };
}

export const { listarClientes, obtenerClientePorId, crearCliente, eliminarCliente } = crearControladoresClientes(servicioClientes);
