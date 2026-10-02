export function manejadorRutaNoEncontrada(req, res) {
  res.status(404).json({
    error: {
      code: 'RUTA_NO_ENCONTRADA',
      message: 'La ruta solicitada no existe.',
    },
  });
}
