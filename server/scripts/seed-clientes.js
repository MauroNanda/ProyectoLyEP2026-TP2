import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { ObjectId } from 'mongodb';
import { conectarBaseDeDatos, cerrarBaseDeDatos, ErrorPersistencia } from '../config/database.js';
import { seleccionarDatosCliente } from '../models/cliente.js';

export function prepararEjemplos(ejemplos) {
  if (!Array.isArray(ejemplos)) throw new ErrorPersistencia('FIXTURE_INVALIDO', 'Se requiere un arreglo de ejemplos.');
  const ids = new Set();
  return ejemplos.map((ejemplo) => {
    const id = ejemplo?._id;
    if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id) || ids.has(id.toLowerCase())) {
      throw new ErrorPersistencia('FIXTURE_INVALIDO', 'Los ejemplos requieren identificadores válidos y distintos.');
    }
    ids.add(id.toLowerCase());
    return { _id: new ObjectId(id), ...seleccionarDatosCliente(ejemplo) };
  });
}

export async function cargarEjemplos(coleccion, ejemplos) {
  const documentos = prepararEjemplos(ejemplos); // Validar todos antes de escribir.
  let insertados = 0;
  for (const { _id, ...datos } of documentos) {
    const resultado = await coleccion.updateOne({ _id }, { $setOnInsert: datos }, { upsert: true });
    insertados += resultado.upsertedCount;
  }
  return { insertados, existentes: documentos.length - insertados };
}

async function main() {
  try {
    const ejemplos = JSON.parse(await readFile(new URL('../fixtures/clientes.json', import.meta.url), 'utf8'));
    prepararEjemplos(ejemplos);
    const db = await conectarBaseDeDatos();
    const resultado = await cargarEjemplos(db.collection('clientes'), ejemplos);
    console.log(JSON.stringify({ carga: 'correcta', ...resultado }));
  } catch {
    console.error('Falló la carga. Revisar el fixture y la configuración/acceso a Atlas.');
    process.exitCode = 1;
  } finally {
    await cerrarBaseDeDatos().catch(() => {
      console.error('No se pudo cerrar la conexión.');
      process.exitCode = 1;
    });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
