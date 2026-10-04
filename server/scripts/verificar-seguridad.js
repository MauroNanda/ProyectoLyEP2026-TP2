import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { MongoClient, MongoServerError } from 'mongodb';
import { crearRepositorioSeguridad } from '../models/seguridad.js';
import { crearServicioSeguridad } from '../services/seguridad.js';
import { crearControladoresClientes } from '../controllers/clientes.js';
import { crearServicioClientes } from '../services/clientes.js';
import { crearApp } from '../app.js';
import { crearHash, verificarHash } from '../services/credenciales.js';
import { ErrorPersistencia } from '../config/database.js';

if (!process.env.MONGODB_URI) throw new Error('Configurá MONGODB_URI en server/.env.');
const nombre='apacheta_verificacion_'+randomUUID().replaceAll('-','');
const client=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
let servidor,db;
const resultados={};
try {
  await client.connect();
  const base=client.db(process.env.MONGODB_DB_NAME);
  db={collection:clave=>base.collection(nombre+'_'+clave)};
  const repo=crearRepositorioSeguridad({obtenerBase:()=>db,obtenerCliente:()=>client});
  await repo.inicializar();
  const seguridad=crearServicioSeguridad({repo});
  const password='Prueba temporal '+randomUUID();
  const inicio=performance.now(),rss=process.memoryUsage().rss;
  const h=await crearHash(password);
  assert(await verificarHash(password,h));
  assert(!await verificarHash(password+'x',h));
  resultados.scrypt={tresDerivacionesMs:Math.round(performance.now()-inicio),rssAntesMiB:Math.round(rss/1048576),rssDespuesMiB:Math.round(process.memoryUsage().rss/1048576),maxRSSMiB:Math.round(process.resourceUsage().maxRSS/1024)};
  const intentos=await Promise.allSettled([seguridad.bootstrap({nombre:'Admin A',email:'a@example.test',password}),seguridad.bootstrap({nombre:'Admin B',email:'b@example.test',password})]);
  assert.equal(intentos.filter(x=>x.status==='fulfilled').length,1);
  assert.equal(await db.collection('usuarios').countDocuments(),1);
  const primero=intentos.find(x=>x.status==='fulfilled').value;
  resultados.bootstrapConcurrente=true;
  const controles=crearControladoresClientes(crearServicioClientes(repo.clientes));
  const aplicacion=crearApp({seguridad,logger:{},controladores:{
    ...controles,
    crearCliente:async(req,res,next)=>{try{res.status(201).json(await seguridad.crearCliente(req.auth,req.body,req.requestId));}catch(e){next(e);}},
    eliminarCliente:async(req,res,next)=>{try{await seguridad.eliminarCliente(req.auth,req.params.id,req.requestId);res.status(204).end();}catch(e){next(e);}},
  }});
  servidor=await new Promise(resolve=>{const s=aplicacion.listen(0,'127.0.0.1',()=>resolve(s));});
  const url='http://127.0.0.1:'+servidor.address().port;
  const http=async(path,{token,body,method='GET'}={})=>fetch(url+path,{method,headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body!==undefined?{'Content-Type':'application/json'}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
  assert.equal((await http('/api/clientes')).status,401);
  const login=await http('/api/auth/login',{method:'POST',body:{email:primero.email,password}});
  assert.equal(login.status,200);assert.equal(login.headers.get('cache-control'),'no-store');
  const sesion=await login.json(),token=sesion.token;
  assert(!('passwordHash' in sesion.usuario));
  assert.equal((await db.collection('sesiones').findOne()).tokenHash.length,64);
  assert(!JSON.stringify(await db.collection('sesiones').find().toArray()).includes(token));
  await assert.rejects(seguridad.login({email:'ausente@example.test',password},'fallido-ausente'),{code:'CREDENCIALES_INVALIDAS'});
  await assert.rejects(seguridad.login({email:primero.email,password:password+' incorrecta'},'fallido-password'),{code:'CREDENCIALES_INVALIDAS'});
  const ctx=await seguridad.autenticar(token);
  const segundo=await seguridad.crearCuenta(ctx,{nombre:'Segundo',email:'segundo@example.test',rol:'Administrador',password},'prueba');
  const s2=await seguridad.login({email:segundo.email,password},'prueba');
  const c2=await seguridad.autenticar(s2.token);
  const soporte=await seguridad.crearCuenta(ctx,{nombre:'Soporte',email:'soporte@example.test',rol:'Soporte',password},'prueba');
  const ss=await seguridad.login({email:soporte.email,password},'prueba');
  assert.equal((await http('/api/usuarios',{token:ss.token})).status,403);
  assert.equal((await http('/api/clientes/'+primero.id,{token:ss.token,method:'DELETE'})).status,403);
  const datos={email:'cliente@example.test',phone:'+54 388 4000000',name:{firstname:'Cliente prueba'},address:{city:'Jujuy'}};
  const alta=await http('/api/clientes',{token:ss.token,method:'POST',body:datos});assert.equal(alta.status,201);
  const cliente=await alta.json();
  const lector=new MongoClient(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
  try {await lector.connect();assert(await lector.db(process.env.MONGODB_DB_NAME).collection(nombre+'_clientes').findOne({_id:new (await import('mongodb')).ObjectId(cliente.id)}));resultados.persistenciaOtraConexion=true;}finally{await lector.close();}
  assert.equal((await http('/api/clientes/'+cliente.id,{token})).status,200);
  assert.equal((await http('/api/clientes',{token,method:'POST',body:{...datos,phone:'cualquier cosa'}})).status,400);
  assert.equal((await http('/api/clientes',{token,method:'POST',body:{...datos,username:'x'.repeat(110000)}})).status,413);
  resultados.httpPermisosValidacion=true;
  await seguridad.actualizarCuenta(ctx,soporte.id,{rol:'Gerencia'},'prueba');
  assert.equal((await http('/api/auth/me',{token:ss.token})).status,401);
  resultados.revocacionRol=true;
  const antes=await db.collection('clientes').countDocuments();
  const repoFallido=crearRepositorioSeguridad({obtenerBase:()=>db,obtenerCliente:()=>client});
  const transaccionOriginal=repoFallido.transaccion;
  repoFallido.transaccion=fn=>transaccionOriginal(async r=>{r.registrarEvento=async()=>{throw new Error('fallo de evento controlado');};return fn(r);});
  const falla=crearServicioSeguridad({repo:repoFallido});
  await assert.rejects(falla.crearCliente(ctx,datos,'prueba'),{code:'ALMACENAMIENTO_FALLIDO'});
  assert.equal(await db.collection('clientes').countDocuments(),antes);
  resultados.rollbackAuditoria=true;
  let reintentos=0;
  const repoRetry=crearRepositorioSeguridad({obtenerBase:()=>db,obtenerCliente:()=>client}),tx=repoRetry.transaccion;
  repoRetry.transaccion=fn=>tx(async r=>{const registrar=r.registrarEvento;r.registrarEvento=async e=>{if(reintentos++===0){const fallo=new MongoServerError({message:'Conflicto transitorio simulado',code:112});fallo.addErrorLabel('TransientTransactionError');throw fallo;}return registrar(e);};return fn(r);});
  const retryCliente=await crearServicioSeguridad({repo:repoRetry}).crearCliente(ctx,datos,'retry-controlado');
  assert(reintentos>=2);assert.equal(await db.collection('auditoria').countDocuments({requestId:'retry-controlado'}),1);
  assert.equal(await db.collection('clientes').countDocuments({_id:new (await import('mongodb')).ObjectId(retryCliente.id)}),1);
  resultados.retrySinDuplicacion=true;
  const cambios=await Promise.allSettled([seguridad.actualizarCuenta(ctx,primero.id,{activo:false},'prueba'),seguridad.actualizarCuenta(c2,segundo.id,{activo:false},'prueba')]);
  assert.equal(cambios.filter(x=>x.status==='fulfilled').length,1);
  assert.equal(await repo.contarAdministradores(),1);
  assert.equal(cambios.find(x=>x.status==='rejected').reason.code,'ULTIMO_ADMINISTRADOR');
  resultados.ultimoAdminConcurrente=true;
  const inactivo=(await repo.listarUsuarios()).find(u=>!u.activo);
  await assert.rejects(seguridad.login({email:inactivo.email,password},'fallido-inactivo'),{code:'CREDENCIALES_INVALIDAS'});
  assert.equal(await db.collection('auditoria').countDocuments({tipo:'LOGIN_FALLIDO',actorId:null}),3);
  const vivo=(await repo.listarUsuarios()).find(u=>u.rol==='Administrador' && u.activo);
  const nuevo=await seguridad.login({email:vivo.email,password},'prueba'),cv=await seguridad.autenticar(nuevo.token);
  assert.equal((await http('/api/auditoria',{token:nuevo.token,method:'DELETE'})).status,404);
  const audit=await seguridad.consultarAuditoria(cv,{limit:'2'});
  assert.equal(audit.items.length,2);assert(audit.nextCursor);
  const audit2=await seguridad.consultarAuditoria(cv,{limit:'2',cursor:audit.nextCursor});
  assert(audit2.items.every(e=>!audit.items.some(a=>a.id===e.id)));
  const serial=JSON.stringify(await db.collection('auditoria').find().toArray());
  assert(!serial.includes(password) && !serial.includes('passwordHash') && !serial.includes('tokenHash'));
  await assert.rejects(seguridad.consultarAuditoria(cv,{cursor:'basura'}),{code:'ENTRADA_INVALIDA'});
  await assert.rejects(seguridad.crearCuenta(cv,{nombre:'Duplicado',email:vivo.email.toUpperCase(),rol:'Soporte',password},'prueba'),{code:'EMAIL_DUPLICADO'});
  resultados.auditoriaCursorUnicidad=true;
  await seguridad.cambiarPassword(cv,{actual:password,nueva:password+' nueva'},'prueba');
  await assert.rejects(seguridad.autenticar(nuevo.token),{code:'NO_AUTENTICADO'});
  const ultimo=await seguridad.login({email:vivo.email,password:password+' nueva'},'prueba');
  await seguridad.logout(await seguridad.autenticar(ultimo.token),'prueba');
  await assert.rejects(seguridad.autenticar(ultimo.token),{code:'NO_AUTENTICADO'});
  resultados.passwordLogout=true;
  // TTL no participa de la decisión de autorización.
  const expirado=await seguridad.login({email:vivo.email,password:password+' nueva'},'prueba');
  await db.collection('sesiones').updateOne({tokenHash:(await import('../services/credenciales.js')).hashToken(expirado.token)},{$set:{expiresAt:new Date(0)}});
  await assert.rejects(seguridad.autenticar(expirado.token),{code:'NO_AUTENTICADO'});
  resultados.expiracion=true;
  console.log(JSON.stringify({verificacion:'correcta',...resultados}));
} catch(e) {
  console.error(JSON.stringify({verificacion:'fallida',code:e.code ?? e.name,message:e instanceof ErrorPersistencia ? e.message : 'Revisar las comprobaciones del script.'}));
  process.exitCode=1;
} finally {
  if(servidor) await new Promise(resolve=>servidor.close(resolve));
  if(db && /^apacheta_verificacion_[a-f0-9]{32}$/.test(nombre)) {
    for(const clave of ['usuarios','sesiones','auditoria','control','clientes']) {
      await db.collection(clave).drop().catch(e=>{if(e.code!==26){console.error('No se pudo limpiar una colección de verificación.');process.exitCode=1;}});
    }
  }
  await client.close();
}
