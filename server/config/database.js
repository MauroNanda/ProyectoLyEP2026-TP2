import { MongoClient } from 'mongodb';

export class ErrorPersistencia extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ErrorPersistencia';
    this.code = code;
  }
}

// Una instancia por proceso; la fábrica permite probar el ciclo sin Atlas.
export function crearConexion({ crearCliente = (uri) => new MongoClient(uri, {
  serverSelectionTimeoutMS: 10000,
}), entorno = () => process.env } = {}) {
  let cliente;
  let base;
  let apertura;
  let cierre;

  async function conectarBaseDeDatos() {
    if (cierre) await cierre;
    if (base) return base;
    if (!apertura) {
      apertura = (async () => {
        const { MONGODB_URI: uri, MONGODB_DB_NAME: nombre } = entorno();
        for (const [clave, valor] of Object.entries({ MONGODB_URI: uri, MONGODB_DB_NAME: nombre })) {
          if (typeof valor !== 'string' || !valor.trim()) {
            throw new ErrorPersistencia('CONFIGURACION_INVALIDA', `Falta configurar ${clave}.`);
          }
        }
        let candidato;
        try {
          candidato = crearCliente(uri);
          await candidato.connect();
          const db = candidato.db(nombre);
          await db.command({ ping: 1 });
          cliente = candidato;
          base = db;
          return base;
        } catch {
          if (candidato) await candidato.close().catch(() => {});
          throw new ErrorPersistencia('CONEXION_FALLIDA', 'No se pudo conectar a la base de datos. Revisar configuración y acceso a Atlas.');
        }
      })();
    }
    const pendiente = apertura;
    try {
      return await pendiente;
    } finally {
      if (apertura === pendiente) apertura = undefined;
    }
  }

  function obtenerBaseDeDatos() {
    if (!base || cierre) {
      throw new ErrorPersistencia('SIN_CONEXION', 'La base de datos no está conectada.');
    }
    return base;
  }

  async function cerrarBaseDeDatos() {
    if (!cierre) {
      cierre = (async () => {
        if (apertura) await apertura.catch(() => {});
        const anterior = cliente;
        cliente = undefined;
        base = undefined;
        if (anterior) {
          try { await anterior.close(); }
          catch { throw new ErrorPersistencia('CIERRE_FALLIDO', 'No se pudo cerrar la conexión.'); }
        }
      })();
    }
    const pendiente = cierre;
    try { await pendiente; }
    finally { if (cierre === pendiente) cierre = undefined; }
  }

  function obtenerClienteMongo() { obtenerBaseDeDatos(); return cliente; }
  return { conectarBaseDeDatos, obtenerBaseDeDatos, obtenerClienteMongo, cerrarBaseDeDatos };
}

export const { conectarBaseDeDatos, obtenerBaseDeDatos, obtenerClienteMongo, cerrarBaseDeDatos } = crearConexion();
