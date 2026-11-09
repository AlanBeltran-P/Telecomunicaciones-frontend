import { CONTRATACIONES_MOCK } from '../../../core/mock/datos/contrataciones.mock';
import { FACTURAS_MOCK } from '../../../core/mock/datos/facturas.mock';
import { armarResumen } from './resumen';

const DE_ANA = {
  contrataciones: CONTRATACIONES_MOCK.filter((c) => c.clienteId === 10),
  facturas: FACTURAS_MOCK.filter((f) => f.clienteId === 10),
};

describe('armarResumen', () => {
  it('resume la situación de Ana', () => {
    const resumen = armarResumen({ ...DE_ANA, debito: null });

    expect(resumen.planesActivos).toBe(1);
    expect(resumen.totalAPagar).toBe(46400);
    expect(resumen.proximoVencimiento).toBe('2026-11-18');
    expect(resumen.vencidas.map((f) => f.planNombre)).toEqual(['Fibra 1000']);
    expect(resumen.suspendidas.map((c) => c.planNombre)).toEqual(['Fibra 1000']);
    expect(resumen.sinDebito).toBe(true);
    expect(resumen.instalacion?.planNombre).toBe('Fibra + TV');
  });

  it('con débito activo no lo pide', () => {
    const resumen = armarResumen({ ...DE_ANA, debito: { medio: 'PAYPAL', fechaAlta: '2026-11-01' } });
    expect(resumen.sinDebito).toBe(false);
  });

  it('sin facturas no hay nada que pagar ni vencimiento', () => {
    const resumen = armarResumen({ contrataciones: [], facturas: [], debito: null });

    expect(resumen.totalAPagar).toBe(0);
    expect(resumen.proximoVencimiento).toBeNull();
    expect(resumen.instalacion).toBeUndefined();
  });
});
