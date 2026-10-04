import { ObjectId } from 'mongodb';
import { repositorioSeguridad, cuentaPublica } from '../models/seguridad.js';
import { ErrorServicio } from './errores.js';
import { crearHash, verificarHash, HASH_FICTICIO, nuevoToken, hashToken } from './credenciales.js';
import { prepararCuenta, prepararCambioCuenta, validarId, passwordValida, entrada, PATRON_EMAIL } from './validacion.js';
import { crearServicioClientes } from './clientes.js';

export const TIPOS_EVENTO = ['LOGIN_CORRECTO','LOGIN_FALLIDO','LOGOUT','PASSWORD_CAMBIADA','CUENTA_CREADA','CUENTA_ACTUALIZADA','CLIENTE_CREADO','CLIENTE_ELIMINADO'];
const negar = (code, message) => { throw new ErrorServicio(code, message); };
export function crearServicioSeguridad({ repo = repositorioSeguridad, reloj = () => new Date(), hash = crearHash, verificar = verificarHash } = {}) {
  const evento = (tipo, actor, recurso, recursoId, requestId, camposModificados) => ({
    fecha: reloj(), tipo, actorId: actor ? new ObjectId(actor.id) : null, rol: actor?.rol ?? null,
    recurso, recursoId: recursoId ?? null, resultado: tipo === 'LOGIN_FALLIDO' ? 'fallido' : 'correcto',
    requestId: requestId ?? null, ...(camposModificados ? { camposModificados } : {}),
  });
  async function actorActual(r, contexto, roles) {
    const u = await r.usuarioPorId(contexto.usuario.id);
    const s = await r.sesionPorId(contexto.sesionId);
    if (!u?.activo || !s || s.revokedAt || s.expiresAt <= reloj()) negar('NO_AUTENTICADO','La sesión no es válida.');
    if (!roles.includes(u.rol)) negar('SIN_PERMISO','No tenés permiso para esta operación.');
    return cuentaPublica(u);
  }
  const servicio = {
    async bootstrap(datos) {
      const limpio = prepararCuenta({ ...datos, rol: 'Administrador' });
      const passwordHash = await hash(limpio.password);
      return repo.transaccion(async r => {
        await r.bloquearAdministradores();
        if (await r.contarUsuarios()) negar('BOOTSTRAP_NO_DISPONIBLE','Ya existen cuentas; usá la gestión de administradores.');
        const fecha = reloj();
        const u = { _id: new ObjectId(), nombre: limpio.nombre, email: limpio.email, rol: limpio.rol, activo: true, passwordHash, createdAt: fecha, updatedAt: fecha };
        await r.crearUsuario(u);
        const dto = cuentaPublica(u);
        await r.registrarEvento(evento('CUENTA_CREADA', dto, 'usuarios', dto.id, 'bootstrap'));
        return dto;
      });
    },
    async login(datos, requestId) {
      const email = typeof datos?.email === 'string' ? datos.email.trim().toLowerCase() : '';
      const password = datos?.password;
      if (!PATRON_EMAIL.test(email) || email.length > 254 || !passwordValida(password)) entrada(['email','password']);
      const u = await repo.usuarioPorEmail(email);
      const correcto = await verificar(password, u?.activo ? u.passwordHash : HASH_FICTICIO);
      if (!u?.activo || !correcto) {
        await repo.transaccion(r => r.registrarEvento(evento('LOGIN_FALLIDO', null, 'sesiones', null, requestId)));
        negar('CREDENCIALES_INVALIDAS','Correo o contraseña incorrectos.');
      }
      const token = nuevoToken();
      return repo.transaccion(async r => {
        await r.bloquearUsuario(u._id.toHexString());
        const actual = await r.usuarioPorId(u._id.toHexString());
        if (!actual?.activo || actual.passwordHash !== u.passwordHash) negar('CREDENCIALES_INVALIDAS','Correo o contraseña incorrectos.');
        const createdAt = reloj(), expiresAt = new Date(createdAt.getTime() + 8*60*60*1000);
        const s = { _id: new ObjectId(), usuarioId: actual._id, tokenHash: hashToken(token), createdAt, expiresAt, revokedAt: null };
        await r.crearSesion(s);
        const usuario = cuentaPublica(actual);
        await r.registrarEvento(evento('LOGIN_CORRECTO', usuario, 'sesiones', s._id.toHexString(), requestId));
        return { token, expiresAt, usuario };
      });
    },
    async autenticar(token) {
      if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) negar('NO_AUTENTICADO','Se requiere una sesión válida.');
      const s = await repo.sesionPorHash(hashToken(token));
      if (!s || s.revokedAt || s.expiresAt <= reloj()) negar('NO_AUTENTICADO','La sesión no es válida.');
      const u = await repo.usuarioPorId(s.usuarioId.toHexString());
      if (!u?.activo) negar('NO_AUTENTICADO','La sesión no es válida.');
      return { usuario: cuentaPublica(u), sesionId: s._id.toHexString() };
    },
    async logout(ctx, requestId) {
      return repo.transaccion(async r => {
        const actor = await actorActual(r,ctx,['Administrador','Gerencia','Soporte']);
        await r.revocarSesion(ctx.sesionId,reloj());
        await r.registrarEvento(evento('LOGOUT',actor,'sesiones',ctx.sesionId,requestId));
      });
    },
    async cambiarPassword(ctx, datos, requestId) {
      if (!passwordValida(datos?.actual) || !passwordValida(datos?.nueva) || Object.keys(datos).some(k=>!['actual','nueva'].includes(k))) entrada(['actual','nueva']);
      const u = await repo.usuarioPorId(ctx.usuario.id);
      if (!u?.activo || !await verificar(datos.actual,u.passwordHash)) negar('CREDENCIALES_INVALIDAS','La contraseña actual es incorrecta.');
      const passwordHash = await hash(datos.nueva);
      return repo.transaccion(async r => {
        const actor = await actorActual(r,ctx,['Administrador','Gerencia','Soporte']);
        const actual = await r.usuarioPorId(actor.id);
        if (actual.passwordHash !== u.passwordHash) negar('CREDENCIALES_INVALIDAS','La contraseña actual cambió. Volvé a iniciar sesión.');
        await r.actualizarUsuario(actor.id,{passwordHash,updatedAt:reloj()});
        await r.revocarSesionesUsuario(actor.id,reloj());
        await r.registrarEvento(evento('PASSWORD_CAMBIADA',actor,'usuarios',actor.id,requestId));
      });
    },
    async listarCuentas(ctx) {
      await actorActual(repo,ctx,['Administrador']);
      return (await repo.listarUsuarios()).map(cuentaPublica);
    },
    async crearCuenta(ctx, datos, requestId) {
      const limpio = prepararCuenta(datos), passwordHash = await hash(limpio.password);
      return repo.transaccion(async r => {
        await r.bloquearAdministradores();
        const actor = await actorActual(r,ctx,['Administrador']), fecha = reloj();
        const u = {_id:new ObjectId(),nombre:limpio.nombre,email:limpio.email,rol:limpio.rol,activo:true,passwordHash,createdAt:fecha,updatedAt:fecha};
        await r.crearUsuario(u);
        const dto = cuentaPublica(u);
        await r.registrarEvento(evento('CUENTA_CREADA',actor,'usuarios',dto.id,requestId));
        return dto;
      });
    },
    async actualizarCuenta(ctx, id, datos, requestId) {
      validarId(id); const limpio = prepararCambioCuenta(datos);
      return repo.transaccion(async r => {
        await r.bloquearAdministradores();
        const actor = await actorActual(r,ctx,['Administrador']);
        const u = await r.usuarioPorId(id);
        if (!u) negar('CUENTA_NO_ENCONTRADA','La cuenta no existe.');
        await r.actualizarUsuario(id,{...limpio,updatedAt:reloj()});
        if (!await r.contarAdministradores()) negar('ULTIMO_ADMINISTRADOR','Debe quedar al menos un administrador activo.');
        if (('rol' in limpio && limpio.rol !== u.rol) || ('activo' in limpio && limpio.activo !== u.activo)) await r.revocarSesionesUsuario(id,reloj());
        await r.registrarEvento(evento('CUENTA_ACTUALIZADA',actor,'usuarios',id,requestId,Object.keys(limpio)));
        return cuentaPublica({...u,...limpio,updatedAt:reloj()});
      });
    },
    async crearCliente(ctx, datos, requestId) {
      return repo.transaccion(async r => {
        const actor = await actorActual(r,ctx,['Administrador','Gerencia','Soporte']);
        const cliente = await crearServicioClientes(r.clientes).crearCliente(datos);
        await r.registrarEvento(evento('CLIENTE_CREADO',actor,'clientes',cliente.id,requestId));
        return cliente;
      });
    },
    async eliminarCliente(ctx, id, requestId) {
      return repo.transaccion(async r => {
        const actor = await actorActual(r,ctx,['Administrador','Gerencia']);
        await crearServicioClientes(r.clientes).eliminarCliente(id);
        await r.registrarEvento(evento('CLIENTE_ELIMINADO',actor,'clientes',id,requestId));
      });
    },
    async consultarAuditoria(ctx, consulta) {
      await actorActual(repo,ctx,['Administrador']);
      const permitidos = ['tipo','actorId','desde','hasta','limit','cursor'];
      if (Object.keys(consulta).some(k=>!permitidos.includes(k)) || Object.values(consulta).some(v=>typeof v!=='string')) entrada(['consulta']);
      const filtro = {};
      if (consulta.tipo) { if (!TIPOS_EVENTO.includes(consulta.tipo)) entrada(['tipo']); filtro.tipo=consulta.tipo; }
      if (consulta.actorId) { validarId(consulta.actorId); filtro.actorId=new ObjectId(consulta.actorId); }
      for (const [clave,operador] of [['desde','$gte'],['hasta','$lte']]) {
        if (consulta[clave]) {
          const fecha=new Date(consulta[clave]);
          if (!/^\d{4}-\d\d-\d\dT/.test(consulta[clave]) || !Number.isFinite(fecha.getTime())) entrada([clave]);
          filtro.fecha={...filtro.fecha,[operador]:fecha};
        }
      }
      if (filtro.fecha?.$gte > filtro.fecha?.$lte) entrada(['desde','hasta']);
      const limit=consulta.limit === undefined ? 50 : Number(consulta.limit);
      if (!Number.isInteger(limit) || limit<1 || limit>100) entrada(['limit']);
      if (consulta.cursor) {
        let cursor; try { cursor=JSON.parse(Buffer.from(consulta.cursor,'base64url').toString()); } catch { entrada(['cursor']); }
        if (!cursor || typeof cursor.fecha!=='string' || !Number.isFinite(new Date(cursor.fecha).getTime()) || !/^[a-f0-9]{24}$/.test(cursor.id)) entrada(['cursor']);
        filtro.$or=[{fecha:{$lt:new Date(cursor.fecha)}},{fecha:new Date(cursor.fecha),_id:{$lt:new ObjectId(cursor.id)}}];
      }
      const filas=await repo.consultarAuditoria(filtro,limit+1), pagina=filas.slice(0,limit);
      const ultimo=pagina.at(-1);
      return {items:pagina.map(({_id,...e})=>({id:_id.toHexString(),...e,actorId:e.actorId?.toHexString() ?? null})),nextCursor:filas.length>limit ? Buffer.from(JSON.stringify({fecha:ultimo.fecha.toISOString(),id:ultimo._id.toHexString()})).toString('base64url') : null};
    },
  };
  return servicio;
}
export const servicioSeguridad = crearServicioSeguridad();
