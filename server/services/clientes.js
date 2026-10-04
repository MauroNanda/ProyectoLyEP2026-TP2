import * as modeloCliente from '../models/cliente.js';
import { ErrorServicio } from './errores.js';
import { prepararDatosCliente, validarId } from './validacion.js';
export function crearServicioClientes(modelo) {
  function ausente() { throw new ErrorServicio('CLIENTE_NO_ENCONTRADO', 'El cliente no existe.'); }
  return {
    listarClientes: async () => modelo.listarClientes(),
    obtenerClientePorId: async id => { validarId(id); const c = await modelo.buscarClientePorId(id); if (!c) ausente(); return c; },
    crearCliente: async datos => modelo.crearCliente(prepararDatosCliente(datos)),
    eliminarCliente: async id => { validarId(id); if (!(await modelo.eliminarCliente(id))) ausente(); },
  };
}
export const { listarClientes, obtenerClientePorId, crearCliente, eliminarCliente } = crearServicioClientes(modeloCliente);
