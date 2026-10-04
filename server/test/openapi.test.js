import test from 'node:test';
import assert from 'node:assert/strict';
import SwaggerParser from '@apidevtools/swagger-parser';
import { openapi } from '../documents/openapi.js';
import { crearApp } from '../app.js';

test('OpenAPI es válido y describe las 12 operaciones con permisos y errores',async()=>{
  await SwaggerParser.validate(structuredClone(openapi));
  const operaciones=Object.entries(openapi.paths).flatMap(([ruta,metodos])=>Object.entries(metodos).map(([metodo,op])=>[ruta,metodo,op]));
  assert.equal(operaciones.length,12);
  assert.equal(new Set(operaciones.map(([, ,op])=>op.operationId)).size,12);
  assert.deepEqual(openapi.security,[{bearerAuth:[]}]);
  assert.deepEqual(openapi.paths['/api/auth/login'].post.security,[]);
  for(const [ruta,metodo,op] of operaciones) {
    assert(op.responses[500] && op.responses[503],ruta);
    if(ruta!=='/api/auth/login') assert(op.responses[401],ruta);
    if(metodo==='delete' || ruta==='/api/auth/logout' || ruta==='/api/auth/password') assert(!op.responses[204].content);
  }
  assert.equal(openapi.components.securitySchemes.bearerAuth.scheme,'bearer');
  assert(!JSON.stringify(openapi).includes('Admin123'));
  assert(!('passwordHash' in openapi.components.schemas.Cuenta.properties));
});
async function conApp(entorno,callback) {
  const servidor=crearApp({logger:{},entorno}).listen(0,'127.0.0.1');
  await new Promise(r=>servidor.once('listening',r));
  try {await callback('http://127.0.0.1:'+servidor.address().port);}
  finally {await new Promise(r=>servidor.close(r));}
}
test('desarrollo publica Swagger local y contrato JSON sin credenciales persistidas',async()=>{
  for(const entorno of [{},{NODE_ENV:'development'}]) await conApp(entorno,async url=>{
    const contrato=await fetch(url+'/api/openapi.json');
    assert.equal(contrato.status,200);assert.deepEqual(await contrato.json(),openapi);
    const html=await fetch(url+'/api/docs/');assert.equal(html.status,200);
    assert.match(await html.text(),/swagger-ui-bundle.js/);
    for(const archivo of ['swagger-ui.css','swagger-ui-bundle.js','swagger-ui-init.js']) {
      const res=await fetch(url+'/api/docs/'+archivo);assert.equal(res.status,200);
      const texto=await res.text();
      if(archivo==='swagger-ui-init.js') {
        assert.match(texto,/"persistAuthorization":\s*false/);
        assert.match(texto,/"validatorUrl":\s*null/);
        assert(!texto.includes('"preauthorizeApiKey":'));
      }
    }
    assert.equal((await fetch(url+'/api/clientes')).status,401);
  });
});
test('producción y otros entornos no registran interfaz, JSON ni recursos documentales',async()=>{
  for(const NODE_ENV of ['production','test','staging']) await conApp({NODE_ENV},async url=>{
    for(const ruta of ['/api/docs','/api/docs/','/api/docs/swagger-ui-init.js','/api/docs/swagger-ui-bundle.js','/api/openapi.json']) {
      assert.equal((await fetch(url+ruta)).status,404,ruta);
    }
  });
});
