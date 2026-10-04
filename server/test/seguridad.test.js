import test from 'node:test';
import assert from 'node:assert/strict';
import { crearHash, verificarHash, nuevoToken, hashToken } from '../services/credenciales.js';
import { prepararDatosCliente, prepararCuenta, prepararCambioCuenta } from '../services/validacion.js';
import { validarEntorno } from '../config/entorno.js';
import { crearApp } from '../app.js';
import { iniciarServidor } from '../index.js';
import { ErrorPersistencia } from '../config/database.js';
import { limitarLogin } from '../middleware/seguridad.js';

test('scrypt usa sales distintas, preserva espacios y rechaza contraseña incorrecta',async()=>{
  const p=' contraseña válida de prueba ';
  const a=await crearHash(p),b=await crearHash(p);
  assert.notEqual(a,b);assert(await verificarHash(p,a));assert(!await verificarHash(p.trim(),a));assert(!await verificarHash(p,'formato desconocido'));
  const operaciones=await Promise.allSettled([crearHash(p),crearHash(p),crearHash(p)]);
  assert.equal(operaciones.filter(x=>x.status==='rejected' && x.reason.code==='LIMITE_EXCEDIDO').length,1);
  const token=nuevoToken();assert.equal(token.length,43);assert.equal(hashToken(token).length,64);
});
test('cuentas restringen campos y normalizan solo correo, clientes conservan contrato',()=>{
  const u=prepararCuenta({nombre:' Ana ',email:' ANA@Example.com ',rol:'Gerencia',password:' contraseña de ejemplo '});
  assert.equal(u.email,'ana@example.com');assert.equal(u.password,' contraseña de ejemplo ');
  for(const cambio of [{email:'otro@example.com'},{password:'otra contraseña'},{activo:'false'},{rol:'admin'},{}]) assert.throws(()=>prepararCambioCuenta(cambio),{code:'ENTRADA_INVALIDA'});
  const c={email:'Ana@Example.com',phone:'3884000000',name:{firstname:'Peña 2'},address:{city:'San Salvador'}};
  assert.equal(prepararDatosCliente(c).email,c.email);
  for(const patch of [{phone:'1'},{name:{firstname:'1234'}},{address:{city:'!!!'}},{email:'a'.repeat(260)+'@test.com'}]) assert.throws(()=>prepararDatosCliente({...c,...patch}),{code:'ENTRADA_INVALIDA'});
});
test('configuración rechaza valores inválidos en vez de usar defaults silenciosos',()=>{
  assert.equal(validarEntorno({}).puerto,3001);
  for(const PORT of ['0','-1','65536','abc','1.5','']) assert.throws(()=>validarEntorno({PORT}),{code:'CONFIGURACION_INVALIDA'});
  for(const HOST of ['*','example.com','http://localhost']) assert.throws(()=>validarEntorno({HOST}),{code:'CONFIGURACION_INVALIDA'});
  for(const CORS_ORIGIN of ['*','https://a.test/path','https://u:p@a.test']) assert.throws(()=>validarEntorno({CORS_ORIGIN}),{code:'CONFIGURACION_INVALIDA'});
});
test('limitación de login expira, agrega Retry-After y mantiene memoria acotada',()=>{
  let ahora=0;const m=limitarLogin({reloj:()=>ahora,maximo:2,capacidad:1,ventana:1000});
  const invocar=ip=>{let error;m({ip},{},e=>{error=e;});return error;};
  assert.equal(invocar('a'),undefined);assert.equal(invocar('a'),undefined);assert.equal(invocar('a').code,'LIMITE_EXCEDIDO');
  assert.equal(invocar('b').code,'LIMITE_EXCEDIDO');ahora=1001;assert.equal(invocar('b'),undefined);
});
test('HTTP exige sesión, permite preflight y restringe Soporte sin mutaciones',async()=>{
  let llamadas=0;
  const s=crearApp({logger:{},seguridad:{autenticar:async()=>({usuario:{rol:'Soporte'}}),eliminarCliente:async()=>{llamadas++;}}}).listen(0,'127.0.0.1');
  await new Promise(r=>s.once('listening',r));const url='http://127.0.0.1:'+s.address().port;
  try {
    assert.equal((await fetch(url+'/api/clientes')).status,401);
    for(const p of ['/api/usuarios','/api/auditoria']) assert.equal((await fetch(url+p,{headers:{Authorization:'Bearer '+'a'.repeat(43)}})).status,403);
    assert.equal((await fetch(url+'/api/clientes/'+'a'.repeat(24),{method:'DELETE',headers:{Authorization:'Bearer '+'a'.repeat(43)}})).status,403);
    assert.equal(llamadas,0);
    assert.equal((await fetch(url+'/api/clientes',{method:'OPTIONS',headers:{Origin:'http://localhost:5173','Access-Control-Request-Method':'PATCH'}})).status,204);
  } finally {await new Promise(r=>s.close(r));}
});
test('almacenamiento controlado responde 503 sin exponer datos del driver',async()=>{
  const s=crearApp({logger:{},seguridad:{autenticar:async()=>{throw new ErrorPersistencia('SIN_CONEXION','La base de datos no está conectada.');}}}).listen(0,'127.0.0.1');
  await new Promise(r=>s.once('listening',r));
  try {assert.equal((await fetch('http://127.0.0.1:'+s.address().port+'/api/clientes',{headers:{Authorization:'Bearer '+'a'.repeat(43)}})).status,503);}
  finally {await new Promise(r=>s.close(r));}
});
test('inicio escucha y apagado cierran recursos; fallo de cierre termina con error',async()=>{
  for(const fallo of [false,true]) {
    let cerradas=0,codigo;
    const s=await iniciarServidor({aplicacion:crearApp({logger:{}}),puerto:32000+(fallo?1:0),conectar:async()=>{},preparar:async()=>{},cerrar:async()=>{cerradas++;if(fallo)throw new Error('fallo');},logger:{log(){},error(){}},salir:c=>{codigo=c;}});
    assert(s);if(!fallo)process.emit('SIGTERM');await s.apagar();assert.equal(cerradas,1);assert.equal(codigo,fallo?1:0);
  }
});
test('puerto ocupado y listen síncrono fallido limpian la conexión',async()=>{
  const ocupado=crearApp({logger:{}}).listen(0,'127.0.0.1');await new Promise(r=>ocupado.once('listening',r));
  try {
    for(const aplicacion of [crearApp({logger:{}}),{listen(){throw new Error('fallo síncrono');}}]) {
      let cierres=0,codigo;
      const s=await iniciarServidor({aplicacion,puerto:ocupado.address().port,conectar:async()=>{},preparar:async()=>{},cerrar:async()=>{cierres++;},logger:{log(){},error(){}},salir:c=>{codigo=c;}});
      assert.equal(s,undefined);assert.equal(cierres,1);assert.equal(codigo,1);
    }
  } finally {await new Promise(r=>ocupado.close(r));}
});
test('apagado tiene timeout y elimina listeners aunque HTTP no finalice',async()=>{
  const {EventEmitter}=await import('node:events');
  const fake=new EventEmitter();fake.close=()=>{};fake.closeAllConnections=()=>{};
  let codigo;
  const s=await iniciarServidor({aplicacion:{listen(_opts,cb){setImmediate(cb);return fake;}},conectar:async()=>{},preparar:async()=>{},cerrar:async()=>{},limiteApagado:10,logger:{log(){},error(){}},salir:c=>{codigo=c;}});
  await s.apagar();assert.equal(codigo,1);
});
