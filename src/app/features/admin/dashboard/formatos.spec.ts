import { etiquetaCorta, numero, pesos, pesosCorto } from './formatos';

/** Intl usa espacios que no cortan línea: para comparar, los paso a espacios comunes. */
function sinEspaciosRaros(texto: string): string {
  return texto.replace(/\s/g, ' ');
}

describe('formatos del dashboard', () => {
  it('pesos con separador de miles argentino', () => {
    expect(sinEspaciosRaros(pesos(4820000))).toBe('$ 4.820.000');
  });

  it('pesos abreviados para que entren en un indicador', () => {
    expect(sinEspaciosRaros(pesosCorto(4820000))).toBe('$ 4,8 M');
  });

  it('números enteros con separador de miles', () => {
    expect(numero(1284)).toBe('1.284');
  });

  it('etiquetas cortas de día y de mes', () => {
    expect(etiquetaCorta('2026-11-08')).toBe('8 nov');
    expect(etiquetaCorta('2026-03')).toBe('mar 26');
  });
});
