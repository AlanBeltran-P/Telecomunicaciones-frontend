import { nombreDelMedio, opcionDeMedio, tokenDePagoSimulado } from './medio-de-pago';

describe('medio de pago', () => {
  it('da el nombre para mostrar de cada medio', () => {
    expect(nombreDelMedio('TARJETA_CREDITO')).toBe('Tarjeta de crédito');
    expect(nombreDelMedio('MERCADO_PAGO')).toBe('Mercado Pago');
  });

  it('sin medio devuelve un texto vacío', () => {
    expect(nombreDelMedio(null)).toBe('');
  });

  it('da la sigla del ícono', () => {
    expect(opcionDeMedio('PAYPAL').sigla).toBe('PP');
  });

  it('el token simulado nunca es el que rechaza la pasarela', () => {
    const token = tokenDePagoSimulado('TARJETA_DEBITO');
    expect(token).toContain('tarjeta_debito');
    expect(token).not.toBe('rechazado');
  });
});
