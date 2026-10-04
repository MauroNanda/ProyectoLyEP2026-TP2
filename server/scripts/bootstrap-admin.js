import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { conectarBaseDeDatos,cerrarBaseDeDatos } from '../config/database.js';
import { repositorioSeguridad } from '../models/seguridad.js';
import { servicioSeguridad } from '../services/seguridad.js';
async function preguntar(texto,{secreto=false}={}) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Se requiere una terminal interactiva.');
  let ocultar=false;
  const salida=new Writable({write(chunk,encoding,callback){if(!ocultar) process.stdout.write(chunk);callback();}});
  const rl=createInterface({input:process.stdin,output:salida,terminal:true});
  try {
    const pendiente=rl.question(texto); ocultar=secreto;
    const valor=await pendiente;
    if (secreto) process.stdout.write('\n');
    return valor;
  } finally {rl.close();}
}
try {
  const nombre=await preguntar('Nombre del administrador: ');
  const email=await preguntar('Correo: ');
  const password=await preguntar('Contraseña (12–128 caracteres): ',{secreto:true});
  const confirmar=await preguntar('Repetí la contraseña: ',{secreto:true});
  if(password!==confirmar) throw new Error('Las contraseñas no coinciden.');
  await conectarBaseDeDatos();await repositorioSeguridad.inicializar();
  const cuenta=await servicioSeguridad.bootstrap({nombre,email,password});
  console.log(JSON.stringify({bootstrap:'correcto',cuenta}));
} catch(e) {
  console.error(e.code ? {code:e.code,message:e.message} : 'No se pudo completar el bootstrap. Revisá la terminal y los datos.');
  process.exitCode=1;
} finally {await cerrarBaseDeDatos().catch(()=>{process.exitCode=1;});}
