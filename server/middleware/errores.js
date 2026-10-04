import { ErrorServicio } from '../services/errores.js';
import { ErrorPersistencia } from '../config/database.js';
const estados={ENTRADA_INVALIDA:400,ID_INVALIDO:400,NO_AUTENTICADO:401,CREDENCIALES_INVALIDAS:401,SIN_PERMISO:403,CLIENTE_NO_ENCONTRADO:404,CUENTA_NO_ENCONTRADA:404,EMAIL_DUPLICADO:409,ULTIMO_ADMINISTRADOR:409,BOOTSTRAP_NO_DISPONIBLE:409,LIMITE_EXCEDIDO:429,ALMACENAMIENTO_FALLIDO:503,CONEXION_FALLIDA:503,SIN_CONEXION:503};
export function manejadorErrores(err,req,res,next) {
  if (res.headersSent) return next(err);
  if (err.type==='entity.too.large') return res.status(413).json({error:{code:'CUERPO_EXCESIVO',message:'El cuerpo supera el límite de 100 KB.'}});
  if (err instanceof SyntaxError && err.status===400 && 'body' in err) return res.status(400).json({error:{code:'JSON_INVALIDO',message:'El cuerpo de la solicitud contiene JSON malformado.'}});
  if (err instanceof ErrorServicio || err instanceof ErrorPersistencia) {
    const status=estados[err.code];
    if (status) {
      if (status===429) res.set('Retry-After',String(err.retryAfter ?? 5));
      return res.status(status).json({error:{code:err.code,message:err.message,...(err.campos ? {campos:err.campos} : {})}});
    }
  }
  return res.status(500).json({error:{code:'ERROR_INTERNO',message:'Ocurrió un error interno en el servidor.'}});
}
