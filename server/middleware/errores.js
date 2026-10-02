export function manejadorErrores(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Si la respuesta ya fue enviada o está en curso, delegar al manejador por defecto
  if (res.headersSent) {
    return next(err);
  }

  // Error de sintaxis en el cuerpo JSON enviado (body-parser de express)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: {
        code: 'JSON_INVALIDO',
        message: 'El cuerpo de la solicitud contiene JSON malformado.',
      },
    });
  }

  // Errores conocidos de validación y formato de los servicios
  if (err.code === 'ENTRADA_INVALIDA' || err.code === 'ID_INVALIDO') {
    return res.status(400).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Cliente no encontrado en consulta o eliminación
  if (err.code === 'CLIENTE_NO_ENCONTRADO') {
    return res.status(404).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Errores inesperados, base de datos o sin código específico
  return res.status(500).json({
    error: {
      code: 'ERROR_INTERNO',
      message: 'Ocurrió un error interno en el servidor.',
    },
  });
}
