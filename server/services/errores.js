// Códigos estables que controladores y middleware reconocen sin leer el mensaje.
export const CODIGOS = Object.freeze({
  ENTRADA_INVALIDA: 'ENTRADA_INVALIDA',
  ID_INVALIDO: 'ID_INVALIDO',
  CLIENTE_NO_ENCONTRADO: 'CLIENTE_NO_ENCONTRADO',
});

export class ErrorServicio extends Error {
  constructor(code, message, campos) {
    super(message);
    this.name = 'ErrorServicio';
    this.code = code;
    if (campos) this.campos = [...campos];
  }
}
