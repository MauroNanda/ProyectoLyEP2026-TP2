// Contrato público: mantener sincronizado con app.js y los servicios.
const ref = nombre => ({ $ref: '#/components/schemas/' + nombre });
const texto = (maxLength, extra={}) => ({type:'string',...(maxLength ? {maxLength} : {}),...extra});
const objeto = (properties, required=[], extra={}) => ({type:'object',properties,...(required.length ? {required} : {}),...extra});
const id = texto(null,{pattern:'^[a-fA-F0-9]{24}$'});
const fecha = texto(null,{format:'date-time'});
const password = texto(128,{minLength:12,format:'password',writeOnly:true});
const roles = ['Administrador','Gerencia','Soporte'];
const nombre = objeto({firstname:texto(100,{minLength:1,description:'Debe contener una letra Unicode.'}),lastname:texto(100,{default:'-'})},['firstname']);
const address = objeto({city:texto(100,{minLength:1,description:'Debe contener una letra Unicode.'}),street:texto(200),number:{oneOf:[texto(30),{type:'number'}],description:'Se almacena como cadena.'},zipcode:texto(20)},['city']);
const datosCliente = {email:texto(254,{format:'email'}),phone:texto(40,{description:'7–15 dígitos; espacios, guiones, paréntesis y + inicial.'}),username:texto(100),name:nombre,address};
const json = schema => ({'application/json':{schema}});
const respuesta = (description,schema) => ({description,...(schema ? {content:json(schema)} : {})});
const estados = {400:'Entrada, identificador o JSON inválido.',401:'Credenciales o sesión inválida.',403:'Rol sin permiso.',404:'Recurso inexistente.',409:'Conflicto de correo o último administrador.',413:'Cuerpo mayor de 100 KB.',429:'Límite de intentos o derivaciones.',500:'Fallo interno no categorizado.',503:'Almacenamiento indisponible.'};
const errores = codigos => Object.fromEntries(codigos.map(c=>[c,{...respuesta(estados[c],ref('Error')),...(c===429 ? {headers:{'Retry-After':{schema:{type:'integer'},description:'Segundos antes de reintentar.'}}} : {})}]));
const operacion = (operationId,tag,summary,status,schema,{body,parameters,publica=false,fallos=[401,403,500,503],description}={}) => ({
  operationId,tags:[tag],summary,...(description ? {description} : {}),
  ...(publica ? {security:[]} : {}),
  ...(body ? {requestBody:{required:true,content:json(body)}} : {}),
  ...(parameters ? {parameters} : {}),
  responses:{[status]:respuesta(status===204 ? 'Operación completada sin cuerpo.' : 'Operación completada.',schema),...errores(fallos)},
});
const parametroId={name:'id',in:'path',required:true,schema:id};
export const openapi={
  openapi:'3.0.3',
  info:{title:'Apacheta — API',version:'0.2.0',description:'Cuentas del equipo separadas de clientes comerciales. Iniciá sesión en /api/auth/login y pegá el token en Authorize. Los permisos se comprueban en el servidor. Sin cuentas ni credenciales de ejemplo.'},
  servers:[{url:'/',description:'Mismo origen del servidor actual'}],
  security:[{bearerAuth:[]}],
  tags:[{name:'Autenticación'},{name:'Cuentas'},{name:'Clientes'},{name:'Auditoría'}],
  components:{
    securitySchemes:{bearerAuth:{type:'http',scheme:'bearer',description:'Token opaco de sesión; pegar solo el token, sin el prefijo Bearer. Dura ocho horas.'}},
    schemas:{
      Cuenta:objeto({id,nombre:texto(100),email:texto(254,{format:'email'}),rol:texto(null,{enum:roles}),activo:{type:'boolean'},createdAt:fecha,updatedAt:fecha},['id','nombre','email','rol','activo','createdAt','updatedAt']),
      NuevaCuenta:objeto({nombre:texto(100,{minLength:1}),email:texto(254,{format:'email'}),rol:texto(null,{enum:roles}),password},['nombre','email','rol','password'],{additionalProperties:false}),
      CambioCuenta:objeto({nombre:texto(100,{minLength:1}),rol:texto(null,{enum:roles}),activo:{type:'boolean'}},[],{additionalProperties:false,minProperties:1}),
      Login:objeto({email:texto(254,{format:'email'}),password},['email','password']),
      Sesion:objeto({token:texto(null,{description:'Solo entregado al confirmar login; nunca persistirlo en localStorage.'}),expiresAt:fecha,usuario:ref('Cuenta')},['token','expiresAt','usuario']),
      CambioPassword:objeto({actual:password,nueva:password},['actual','nueva'],{additionalProperties:false}),
      NuevoCliente:objeto(datosCliente,['email','phone','name','address']),
      Cliente:objeto({id,...datosCliente},['id','email','phone','username','name','address']),
      Error:objeto({error:objeto({code:texto(),message:texto(),campos:{type:'array',items:texto()}},['code','message'])},['error']),
      Evento:objeto({id,fecha,tipo:texto(null,{enum:['LOGIN_CORRECTO','LOGIN_FALLIDO','LOGOUT','PASSWORD_CAMBIADA','CUENTA_CREADA','CUENTA_ACTUALIZADA','CLIENTE_CREADO','CLIENTE_ELIMINADO']}),actorId:{...id,nullable:true},rol:texto(null,{enum:roles,nullable:true}),recurso:texto(),recursoId:texto(null,{nullable:true}),resultado:texto(null,{enum:['correcto','fallido']}),requestId:texto(null,{nullable:true}),camposModificados:{type:'array',items:texto()}},['id','fecha','tipo','actorId','rol','recurso','recursoId','resultado','requestId']),
      Historial:objeto({items:{type:'array',items:ref('Evento')},nextCursor:texto(null,{nullable:true})},['items','nextCursor']),
    },
  },
  paths:{
    '/api/auth/login':{post:operacion('login','Autenticación','Iniciar sesión',200,ref('Sesion'),{publica:true,body:ref('Login'),fallos:[400,401,413,429,500,503],description:'Diez intentos por IP cada quince minutos. Respuesta no-store.'})},
    '/api/auth/me':{get:operacion('me','Autenticación','Consultar cuenta actual',200,ref('Cuenta'),{fallos:[401,500,503]})},
    '/api/auth/logout':{post:operacion('logout','Autenticación','Revocar sesión actual',204,null,{fallos:[401,500,503]})},
    '/api/auth/password':{patch:operacion('cambiarPassword','Autenticación','Cambiar contraseña y revocar todas las sesiones propias',204,null,{body:ref('CambioPassword'),fallos:[400,401,413,429,500,503]})},
    '/api/usuarios':{
      get:operacion('listarCuentas','Cuentas','Listar cuentas — Administrador',200,{type:'array',items:ref('Cuenta')}),
      post:operacion('crearCuenta','Cuentas','Crear cuenta activa — Administrador',201,ref('Cuenta'),{body:ref('NuevaCuenta'),fallos:[400,401,403,409,413,429,500,503]}),
    },
    '/api/usuarios/{id}':{patch:operacion('editarCuenta','Cuentas','Modificar nombre, rol o estado — Administrador',200,ref('Cuenta'),{body:ref('CambioCuenta'),parameters:[parametroId],fallos:[400,401,403,404,409,413,500,503],description:'Email inmutable. Cambiar rol/estado revoca sesiones. Debe quedar un administrador activo.'})},
    '/api/clientes':{
      get:operacion('listarClientes','Clientes','Listar clientes — los tres roles',200,{type:'array',items:ref('Cliente')}),
      post:operacion('crearCliente','Clientes','Crear cliente — los tres roles',201,ref('Cliente'),{body:ref('NuevoCliente'),fallos:[400,401,403,413,500,503]}),
    },
    '/api/clientes/{id}':{
      get:operacion('obtenerCliente','Clientes','Consultar cliente — los tres roles',200,ref('Cliente'),{parameters:[parametroId],fallos:[400,401,403,404,500,503]}),
      delete:operacion('eliminarCliente','Clientes','Eliminar cliente — Administrador/Gerencia',204,null,{parameters:[parametroId],fallos:[400,401,403,404,500,503]}),
    },
    '/api/auditoria':{get:operacion('consultarAuditoria','Auditoría','Consultar historial — Administrador',200,ref('Historial'),{
      parameters:[
        {name:'tipo',in:'query',schema:{type:'string',enum:['LOGIN_CORRECTO','LOGIN_FALLIDO','LOGOUT','PASSWORD_CAMBIADA','CUENTA_CREADA','CUENTA_ACTUALIZADA','CLIENTE_CREADO','CLIENTE_ELIMINADO']}},
        {name:'actorId',in:'query',schema:id},
        ...['desde','hasta'].map(name=>({name,in:'query',schema:fecha})),
        {name:'limit',in:'query',schema:{type:'integer',minimum:1,maximum:100,default:50}},
        {name:'cursor',in:'query',schema:texto(),description:'Usar nextCursor de la página anterior, con los mismos filtros.'},
      ],fallos:[400,401,403,500,503],description:'Solo lectura. Orden descendente por fecha/id, sin secretos ni cuerpos completos.',
    })},
  },
};
