import express from 'express';
import cors from 'cors';
import { crearRouterClientes } from './routes/clientes.js';
import { manejadorRutaNoEncontrada } from './middleware/no-encontrado.js';
import { manejadorErrores } from './middleware/errores.js';

export function crearApp({
  controladores,
  corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173',
} = {}) {
  const app = express();

  // Configuración de CORS para el frontend
  app.use(cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Parseo de solicitudes con cuerpo JSON
  app.use(express.json());

  // Rutas de clientes
  const routerClientes = crearRouterClientes(controladores);
  app.use('/api/clientes', routerClientes);

  // Middleware para rutas inexistentes (404)
  app.use(manejadorRutaNoEncontrada);

  // Middleware centralizado para manejo de errores
  app.use(manejadorErrores);

  return app;
}

export const app = crearApp();
