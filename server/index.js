import { fileURLToPath } from 'node:url';
import { app } from './app.js';
import { conectarBaseDeDatos, cerrarBaseDeDatos } from './config/database.js';

export async function iniciarServidor({
  aplicacion = app,
  conectar = conectarBaseDeDatos,
  cerrar = cerrarBaseDeDatos,
  puerto = Number(process.env.PORT) || 3001,
  logger = console,
  salir = (codigo) => process.exit(codigo),
} = {}) {
  try {
    await conectar();
  } catch (error) {
    logger.error('Fallo al conectar con la base de datos:', error.message || error.code || 'Error de conexión');
    return salir(1);
  }

  const servidorHttp = aplicacion.listen(puerto, () => {
    logger.log(`Servidor Express escuchando en http://localhost:${puerto}`);
  });

  let cerrando = false;
  async function apagadoOrdenado(senal) {
    if (cerrando) return;
    cerrando = true;
    logger.log(`\nSeñal ${senal} recibida. Cerrando servidor de forma ordenada...`);
    servidorHttp.close(async () => {
      try {
        await cerrar();
        logger.log('Conexión con la base de datos cerrada.');
      } catch (error) {
        logger.error('Error al cerrar la base de datos:', error.message || error.code);
      } finally {
        salir(0);
      }
    });
  }

  const manejarSigint = () => apagadoOrdenado('SIGINT');
  const manejarSigterm = () => apagadoOrdenado('SIGTERM');

  process.once('SIGINT', manejarSigint);
  process.once('SIGTERM', manejarSigterm);

  servidorHttp.on('close', () => {
    process.removeListener('SIGINT', manejarSigint);
    process.removeListener('SIGTERM', manejarSigterm);
  });

  return servidorHttp;
}

const esModuloPrincipal = Boolean(process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]);
if (esModuloPrincipal) {
  iniciarServidor();
}
