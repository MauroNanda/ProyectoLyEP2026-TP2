import { api } from './apiClient.js';
export const crearClientesService = (http = api) => ({
  obtenerClientes: () => http('clientes'),
  obtenerClientePorId: id => http('clientes/' + encodeURIComponent(id)),
  crearCliente: body => http('clientes', { method: 'POST', body }),
  eliminarCliente: id => http('clientes/' + encodeURIComponent(id), { method: 'DELETE' }),
});
export default crearClientesService();
