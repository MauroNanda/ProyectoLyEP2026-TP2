import { api } from './apiClient.js';
export const crearCuentasService = (http = api) => ({
  listar: () => http('usuarios'),
  crear: body => http('usuarios', { method: 'POST', body }),
  actualizar: (id, body) => http('usuarios/' + encodeURIComponent(id), { method: 'PATCH', body }),
});
export default crearCuentasService();
