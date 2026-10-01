import { ObjectId } from 'mongodb';
import { obtenerBaseDeDatos, ErrorPersistencia } from '../config/database.js';

function invalido(campo) {
  throw new ErrorPersistencia('ENTRADA_INVALIDA', `Estructura inválida del cliente: ${campo}.`);
}

function cadena(valor, campo, defecto) {
  if (valor === undefined && defecto !== undefined) return defecto;
  if (typeof valor !== 'string') invalido(campo);
  return valor;
}

export function seleccionarDatosCliente(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) invalido('datos');
  if (!datos.name || typeof datos.name !== 'object' || Array.isArray(datos.name)) invalido('name');
  if (!datos.address || typeof datos.address !== 'object' || Array.isArray(datos.address)) invalido('address');
  const numero = datos.address.number;
  if (numero !== undefined && typeof numero !== 'string' && !(typeof numero === 'number' && Number.isFinite(numero))) invalido('address.number');
  return {
    email: cadena(datos.email, 'email'),
    phone: cadena(datos.phone, 'phone'),
    username: cadena(datos.username, 'username', ''),
    name: {
      firstname: cadena(datos.name.firstname, 'name.firstname'),
      lastname: cadena(datos.name.lastname, 'name.lastname', '-'),
    },
    address: {
      city: cadena(datos.address.city, 'address.city'),
      street: cadena(datos.address.street, 'address.street', ''),
      number: numero === undefined ? '' : String(numero),
      zipcode: cadena(datos.address.zipcode, 'address.zipcode', ''),
    },
  };
}

export function convertirCliente(documento) {
  return { id: documento._id.toHexString(), ...seleccionarDatosCliente(documento) };
}

function convertirId(id) {
  if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) {
    throw new ErrorPersistencia('ID_INVALIDO', 'El identificador de cliente no es válido.');
  }
  return new ObjectId(id);
}

// El modelo comparte la conexión. No contiene reglas HTTP ni validación comercial.
export function crearModeloCliente(obtenerBase = obtenerBaseDeDatos) {
  function coleccion() { return obtenerBase().collection('clientes'); }
  async function almacenar(operacion) {
    try { return await operacion(); }
    catch (error) {
      if (error instanceof ErrorPersistencia) throw error;
      throw new ErrorPersistencia('ALMACENAMIENTO_FALLIDO', 'No se pudo completar la operación de clientes.');
    }
  }
  return {
    listarClientes: () => almacenar(async () => (await coleccion().find({}).toArray()).map(convertirCliente)),
    buscarClientePorId: (id) => almacenar(async () => {
      const _id = convertirId(id);
      const encontrado = await coleccion().findOne({ _id });
      return encontrado ? convertirCliente(encontrado) : null;
    }),
    crearCliente: (datos) => almacenar(async () => {
      const documento = { _id: new ObjectId(), ...seleccionarDatosCliente(datos) };
      await coleccion().insertOne(documento);
      return convertirCliente(documento);
    }),
    eliminarCliente: (id) => almacenar(async () => {
      const _id = convertirId(id);
      return (await coleccion().deleteOne({ _id })).deletedCount === 1;
    }),
  };
}

export const { listarClientes, buscarClientePorId, crearCliente, eliminarCliente } = crearModeloCliente();
