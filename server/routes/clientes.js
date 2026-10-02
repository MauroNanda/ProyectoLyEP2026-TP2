import { Router } from 'express';
import * as controladoresPorDefecto from '../controllers/clientes.js';

export function crearRouterClientes(controladores = controladoresPorDefecto) {
  const router = Router();

  router.get('/', controladores.listarClientes);
  router.get('/:id', controladores.obtenerClientePorId);
  router.post('/', controladores.crearCliente);
  router.delete('/:id', controladores.eliminarCliente);

  return router;
}

export const routerClientes = crearRouterClientes();
