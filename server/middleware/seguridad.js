import { ErrorServicio } from '../services/errores.js';
export const autenticar = servicio => async (req,res,next) => {
  res.set('Cache-Control','no-store');
  try {
    const match=/^Bearer ([A-Za-z0-9_-]{43})$/.exec(req.get('Authorization') ?? '');
    if (!match) throw new ErrorServicio('NO_AUTENTICADO','Se requiere una sesión válida.');
    req.auth=await servicio.autenticar(match[1]); next();
  } catch(e) { next(e); }
};
export const permitir = roles => (req,res,next) => {
  if (!roles.includes(req.auth.usuario.rol)) return next(new ErrorServicio('SIN_PERMISO','No tenés permiso para esta operación.'));
  next();
};
export function limitarLogin({reloj=Date.now,maximo=10,ventana=900000,capacidad=10000}={}) {
  const intentos=new Map();
  return (req,res,next) => {
    const ahora=reloj();
    for (const [ip,v] of intentos) if (v.hasta<=ahora) intentos.delete(ip);
    let registro=intentos.get(req.ip);
    if (!registro && intentos.size<capacidad) { registro={cantidad:0,hasta:ahora+ventana}; intentos.set(req.ip,registro); }
    if (!registro || registro.cantidad>=maximo) {
      const e=new ErrorServicio('LIMITE_EXCEDIDO','Demasiados intentos. Intentá más tarde.');
      e.retryAfter=registro ? Math.max(1,Math.ceil((registro.hasta-ahora)/1000)) : 60;
      return next(e);
    }
    registro.cantidad++; next();
  };
}
