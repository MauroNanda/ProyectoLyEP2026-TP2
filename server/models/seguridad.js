import { ObjectId } from 'mongodb';
import { obtenerBaseDeDatos, obtenerClienteMongo, ErrorPersistencia } from '../config/database.js';
import { crearModeloCliente } from './cliente.js';
import { ErrorServicio } from '../services/errores.js';

export const cuentaPublica = (u) => ({ id: u._id.toHexString(), nombre: u.nombre, email: u.email, rol: u.rol, activo: u.activo, createdAt: u.createdAt, updatedAt: u.updatedAt });
export function crearRepositorioSeguridad({ obtenerBase = obtenerBaseDeDatos, obtenerCliente = obtenerClienteMongo, session } = {}) {
  const col = (nombre) => obtenerBase().collection(nombre);
  const opts = () => session ? { session } : {};
  const id = (valor) => new ObjectId(valor);
  const repo = {
    clientes: crearModeloCliente(obtenerBase, opts()),
    async inicializar() {
      await col('usuarios').createIndex({ email: 1 }, { unique: true });
      await col('sesiones').createIndex({ tokenHash: 1 }, { unique: true });
      await col('sesiones').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      await col('auditoria').createIndex({ fecha: -1, _id: -1 });
      await col('auditoria').createIndex({ actorId: 1, fecha: -1, _id: -1 });
      await col('auditoria').createIndex({ tipo: 1, fecha: -1, _id: -1 });
      await col('control').updateOne({ _id: 'administradores' }, { $setOnInsert: { revision: 0 } }, { upsert: true });
    },
    async transaccion(fn) {
      const s = obtenerCliente().startSession();
      try { return await s.withTransaction(() => fn(crearRepositorioSeguridad({ obtenerBase, obtenerCliente, session: s }))); }
      catch (e) {
        if (e instanceof ErrorServicio || e instanceof ErrorPersistencia) throw e;
        if (e.code === 11000) throw new ErrorServicio('EMAIL_DUPLICADO', 'Ya existe una cuenta con ese correo.');
        throw new ErrorPersistencia('ALMACENAMIENTO_FALLIDO', 'No se pudo completar la operación.');
      } finally { await s.endSession(); }
    },
    bloquearUsuario: (valor) => col('usuarios').updateOne({ _id: id(valor) }, { $inc: { revisionSesion: 1 } }, opts()),
    bloquearAdministradores: () => col('control').updateOne({ _id: 'administradores' }, { $inc: { revision: 1 } }, opts()),
    usuarioPorEmail: (email) => col('usuarios').findOne({ email }, opts()),
    usuarioPorId: (valor) => col('usuarios').findOne({ _id: id(valor) }, opts()),
    listarUsuarios: () => col('usuarios').find({}, opts()).sort({ nombre: 1, _id: 1 }).toArray(),
    contarUsuarios: () => col('usuarios').countDocuments({}, opts()),
    contarAdministradores: () => col('usuarios').countDocuments({ rol: 'Administrador', activo: true }, opts()),
    crearUsuario: async (u) => { await col('usuarios').insertOne(u, opts()); return u; },
    actualizarUsuario: (valor, datos) => col('usuarios').updateOne({ _id: id(valor) }, { $set: datos }, opts()),
    sesionPorHash: (tokenHash) => col('sesiones').findOne({ tokenHash }, opts()),
    sesionPorId: (valor) => col('sesiones').findOne({ _id: id(valor) }, opts()),
    crearSesion: (s) => col('sesiones').insertOne(s, opts()),
    revocarSesion: (valor, fecha) => col('sesiones').updateOne({ _id: id(valor) }, { $set: { revokedAt: fecha } }, opts()),
    revocarSesionesUsuario: (valor, fecha) => col('sesiones').updateMany({ usuarioId: id(valor), revokedAt: null }, { $set: { revokedAt: fecha } }, opts()),
    registrarEvento: (e) => col('auditoria').insertOne({ _id: new ObjectId(), ...e }, opts()),
    consultarAuditoria: (filtro, limite) => col('auditoria').find(filtro, opts()).sort({ fecha: -1, _id: -1 }).limit(limite).toArray(),
  };
  for (const [nombre, fn] of Object.entries(repo)) {
    if (typeof fn !== 'function' || nombre === 'transaccion') continue;
    repo[nombre] = async (...args) => {
      try { return await fn(...args); } catch (e) {
        if (session && e.hasErrorLabel?.('TransientTransactionError')) throw e;
        if (e instanceof ErrorServicio || e instanceof ErrorPersistencia) throw e;
        if (e.code === 11000) throw new ErrorServicio('EMAIL_DUPLICADO', 'Ya existe una cuenta con ese correo.');
        throw new ErrorPersistencia('ALMACENAMIENTO_FALLIDO', 'No se pudo completar la operación.');
      }
    };
  }
  return repo;
}
export const repositorioSeguridad = crearRepositorioSeguridad();
