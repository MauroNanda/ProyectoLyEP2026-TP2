import * as modeloCliente from '../models/cliente.js';
import { ErrorServicio, CODIGOS } from './errores.js';

const PATRON_ID = /^[a-f\d]{24}$/i;
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esObjeto(valor) {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}

function validarId(id) {
  if (typeof id !== 'string' || !PATRON_ID.test(id)) {
    throw new ErrorServicio(CODIGOS.ID_INVALIDO, 'El identificador de cliente no es válido.');
  }
}

function clienteNoEncontrado() {
  return new ErrorServicio(CODIGOS.CLIENTE_NO_ENCONTRADO, 'El cliente no existe.');
}

// Cada lector devuelve el valor normalizado o registra el campo en `invalidos`.
function obligatorio(valor, campo, invalidos) {
  if (typeof valor === 'string' && valor.trim()) return valor.trim();
  invalidos.push(campo);
  return undefined;
}

function opcional(valor, campo, invalidos) {
  if (valor === undefined) return undefined;
  if (typeof valor === 'string') return valor.trim();
  invalidos.push(campo);
  return undefined;
}

function numeroDireccion(valor, invalidos) {
  if (typeof valor === 'number' && Number.isFinite(valor)) return valor;
  return opcional(valor, 'address.number', invalidos);
}

// Un grupo con tipo inválido se informa una sola vez, sin revisar sus campos internos.
function grupo(valor, campo, invalidos) {
  if (valor === undefined) return {};
  if (esObjeto(valor)) return valor;
  invalidos.push(campo);
  return null;
}

// Omite los opcionales ausentes para que persistencia aplique sus valores por defecto.
function sinAusentes(objeto) {
  return Object.fromEntries(Object.entries(objeto).filter(([, valor]) => valor !== undefined));
}

// Selecciona explícitamente los campos comerciales; id, _id, password y ajenos se ignoran.
function prepararDatosCliente(datos) {
  if (!esObjeto(datos)) {
    throw new ErrorServicio(CODIGOS.ENTRADA_INVALIDA, 'Los datos del cliente no son válidos.', ['cuerpo']);
  }
  const invalidos = [];
  const email = obligatorio(datos.email, 'email', invalidos);
  if (email !== undefined && !PATRON_EMAIL.test(email)) invalidos.push('email');
  const phone = obligatorio(datos.phone, 'phone', invalidos);
  const name = grupo(datos.name, 'name', invalidos);
  const address = grupo(datos.address, 'address', invalidos);
  const preparado = {
    email,
    phone,
    ...sinAusentes({ username: opcional(datos.username, 'username', invalidos) }),
    name: name && sinAusentes({
      firstname: obligatorio(name.firstname, 'name.firstname', invalidos),
      lastname: opcional(name.lastname, 'name.lastname', invalidos),
    }),
    address: address && sinAusentes({
      city: obligatorio(address.city, 'address.city', invalidos),
      street: opcional(address.street, 'address.street', invalidos),
      number: numeroDireccion(address.number, invalidos),
      zipcode: opcional(address.zipcode, 'address.zipcode', invalidos),
    }),
  };
  if (invalidos.length) {
    throw new ErrorServicio(CODIGOS.ENTRADA_INVALIDA, 'Los datos del cliente no son válidos.', invalidos);
  }
  return preparado;
}

// Recibe la interfaz de persistencia; los fallos de persistencia e inesperados se propagan sin envolverse.
export function crearServicioClientes(modelo) {
  return {
    listarClientes: async () => modelo.listarClientes(),
    obtenerClientePorId: async (id) => {
      validarId(id);
      const cliente = await modelo.buscarClientePorId(id);
      if (!cliente) throw clienteNoEncontrado();
      return cliente;
    },
    crearCliente: async (datos) => modelo.crearCliente(prepararDatosCliente(datos)),
    eliminarCliente: async (id) => {
      validarId(id);
      if (!(await modelo.eliminarCliente(id))) throw clienteNoEncontrado();
    },
  };
}

export const { listarClientes, obtenerClientePorId, crearCliente, eliminarCliente } = crearServicioClientes(modeloCliente);
