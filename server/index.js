import { fileURLToPath } from 'node:url';
import { app } from './app.js';
import { conectarBaseDeDatos,cerrarBaseDeDatos } from './config/database.js';
import { validarEntorno } from './config/entorno.js';
import { repositorioSeguridad } from './models/seguridad.js';
export async function iniciarServidor({aplicacion=app,conectar=conectarBaseDeDatos,cerrar=cerrarBaseDeDatos,preparar=()=>repositorioSeguridad.inicializar(),entorno=process.env,puerto,host,logger=console,salir=c=>process.exit(c),limiteApagado=10000}={}) {
  let servidor;
  try {
    const config=validarEntorno({...entorno,...(puerto===undefined ? {} : {PORT:String(puerto)}),...(host===undefined ? {} : {HOST:host})});
    await conectar(); await preparar();
    servidor=await new Promise((resolve,reject)=>{
      let s;
      try {
        s=aplicacion.listen({port:config.puerto,host:config.host},(error)=>error ? reject(error) : resolve(s));
        s.once('error',reject);
      } catch(e) {reject(e);}
    });
    logger.log('Servidor HTTP disponible.',{puerto:config.puerto,host:config.host});
    if (aplicacion.locals?.swaggerHabilitado) {
      const direccion = config.host === '0.0.0.0' ? '127.0.0.1' : config.host === '::' ? '::1' : config.host;
      const hostUrl = direccion.includes(':') ? '[' + direccion + ']' : direccion;
      logger.log('Swagger: http://' + hostUrl + ':' + config.puerto + '/api/docs');
    }
  } catch(e) {
    await cerrar().catch(()=>{});
    logger.error('No se pudo iniciar el servidor.',{code:e.code ?? 'INICIO_FALLIDO'});
    salir(1); return;
  }
  let apagando;
  const apagar=()=>{
    if (apagando) return apagando;
    apagando=(async()=>{
      let timer, cierreIntentado=false;
      try {
        await Promise.race([
          new Promise((resolve,reject)=>servidor.close(e=>e ? reject(e) : resolve())).then(()=>{cierreIntentado=true;return cerrar();}),
          new Promise((_,reject)=>{timer=setTimeout(()=>{servidor.closeAllConnections?.();reject(new Error('TIEMPO_APAGADO'));},limiteApagado);}),
        ]);
        salir(0);
      } catch {if(!cierreIntentado) void cerrar().catch(()=>{});logger.error('No se pudo completar el apagado.');salir(1);}
      finally {clearTimeout(timer);process.removeListener('SIGINT',apagar);process.removeListener('SIGTERM',apagar);}
    })();
    return apagando;
  };
  process.once('SIGINT',apagar);process.once('SIGTERM',apagar);
  servidor.on('close',()=>{if(apagando)return;process.removeListener('SIGINT',apagar);process.removeListener('SIGTERM',apagar);});
  servidor.apagar=apagar;
  return servidor;
}
if (process.argv[1] && fileURLToPath(import.meta.url)===process.argv[1]) await iniciarServidor();
