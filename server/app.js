import swaggerUi from 'swagger-ui-express';
import { openapi } from './documents/openapi.js';
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { crearRouterClientes } from './routes/clientes.js';
import * as controladoresClientes from './controllers/clientes.js';
import { servicioSeguridad } from './services/seguridad.js';
import { autenticar, permitir, limitarLogin } from './middleware/seguridad.js';
import { manejadorRutaNoEncontrada } from './middleware/no-encontrado.js';
import { manejadorErrores } from './middleware/errores.js';

export function crearApp({controladores,seguridad=servicioSeguridad,corsOrigin=process.env.CORS_ORIGIN || 'http://localhost:5173',logger=console,limiteLogin=limitarLogin(),entorno=process.env}={}) {
  const app=express();
  app.disable('x-powered-by');
  app.use((req,res,next)=>{
    req.requestId=randomUUID(); res.set('X-Request-Id',req.requestId);
    const inicio=performance.now();
    res.on('finish',()=>logger.info?.({requestId:req.requestId,metodo:req.method,status:res.statusCode,duracionMs:Math.round(performance.now()-inicio)}));
    next();
  });
  app.use(cors({origin:corsOrigin,methods:['GET','POST','PATCH','DELETE','OPTIONS'],allowedHeaders:['Content-Type','Authorization']}));
  app.use(express.json({limit:'100kb'}));
  app.locals.swaggerHabilitado = entorno.NODE_ENV === undefined || entorno.NODE_ENV === 'development';
  if (app.locals.swaggerHabilitado) {
    app.get('/api/openapi.json', (_req,res)=>res.set('Cache-Control','no-store').json(openapi));
    const opcionesSwagger = {
      customSiteTitle: 'Apacheta — API',
      swaggerOptions: { persistAuthorization: false, validatorUrl: null },
    };
    app.use('/api/docs', swaggerUi.serveFiles(openapi, opcionesSwagger), swaggerUi.setup(openapi, opcionesSwagger));
  }
  const ejecutar=fn=>async(req,res,next)=>{try {await fn(req,res);}catch(e){next(e);}};
  const auth=autenticar(seguridad), admin=permitir(['Administrador']);
  app.use('/api/auth',(req,res,next)=>{res.set('Cache-Control','no-store');next();});
  app.post('/api/auth/login',limiteLogin,ejecutar(async(req,res)=>res.json(await seguridad.login(req.body,req.requestId))));
  app.get('/api/auth/me',auth,(req,res)=>res.json(req.auth.usuario));
  app.post('/api/auth/logout',auth,ejecutar(async(req,res)=>{await seguridad.logout(req.auth,req.requestId);res.status(204).end();}));
  app.patch('/api/auth/password',auth,ejecutar(async(req,res)=>{await seguridad.cambiarPassword(req.auth,req.body,req.requestId);res.status(204).end();}));
  app.get('/api/usuarios',auth,admin,ejecutar(async(req,res)=>res.json(await seguridad.listarCuentas(req.auth))));
  app.post('/api/usuarios',auth,admin,ejecutar(async(req,res)=>res.status(201).json(await seguridad.crearCuenta(req.auth,req.body,req.requestId))));
  app.patch('/api/usuarios/:id',auth,admin,ejecutar(async(req,res)=>res.json(await seguridad.actualizarCuenta(req.auth,req.params.id,req.body,req.requestId))));
  app.get('/api/auditoria',auth,admin,ejecutar(async(req,res)=>res.json(await seguridad.consultarAuditoria(req.auth,req.query))));
  const base=controladores ?? {
    listarClientes:controladoresClientes.listarClientes,obtenerClientePorId:controladoresClientes.obtenerClientePorId,
    crearCliente:ejecutar(async(req,res)=>res.status(201).json(await seguridad.crearCliente(req.auth,req.body,req.requestId))),
    eliminarCliente:ejecutar(async(req,res)=>{await seguridad.eliminarCliente(req.auth,req.params.id,req.requestId);res.status(204).end();}),
  };
  app.use('/api/clientes',auth,(req,res,next)=>permitir(req.method==='DELETE' ? ['Administrador','Gerencia'] : ['Administrador','Gerencia','Soporte'])(req,res,next),crearRouterClientes(base));
  app.use(manejadorRutaNoEncontrada);
  app.use(manejadorErrores);
  return app;
}
export const app=crearApp();
