import {
  reporteDeContrataciones,
  reporteDeFacturacion,
  reporteDeUsuarios,
} from '../../../core/mock/datos/reportes.mock';
import { Reportes } from '../../../core/reportes/reporte.model';
import { armarTablero } from './tablero';

const DESDE = new Date(2026, 9, 1);
const HASTA = new Date(2026, 9, 31);
const OCTUBRE: Reportes = {
  usuarios: reporteDeUsuarios(DESDE, HASTA, 'DIA'),
  contrataciones: reporteDeContrataciones(DESDE, HASTA, 'DIA'),
  facturacion: reporteDeFacturacion(DESDE, HASTA, 'DIA'),
};

describe('armarTablero', () => {
  const tablero = armarTablero({ totales: OCTUBRE, evolucion: OCTUBRE }, new Date(2026, 9, 15));

  it('calcula qué parte de lo facturado se cobró', () => {
    const esperado = Math.round((OCTUBRE.facturacion.cobrado / OCTUBRE.facturacion.facturado) * 100);
    expect(tablero.porcentajeCobrado).toBe(esperado);
  });

  it('arma una serie por período y cuenta los que ya pasaron', () => {
    expect(tablero.facturacion.periodos.length).toBe(31);
    expect(tablero.facturacion.series.map((s) => s.nombre)).toEqual(['Facturado', 'Cobrado']);
    expect(tablero.movimientos.series.map((s) => s.nombre)).toEqual(['Altas', 'Bajas', 'Instalaciones']);
    expect(tablero.periodosConDatos).toBe(15);
  });

  it('suma las facturas emitidas y nombra los medios de pago', () => {
    const { pagadas, pendientes, vencidas } = OCTUBRE.facturacion.facturasEmitidas;
    expect(tablero.totalEmitidas).toBe(pagadas + pendientes + vencidas);
    expect(tablero.medios.map((m) => m.nombre)).toContain('Mercado Pago');
  });

  it('muestra el personal activo como admins · empleados · técnicos', () => {
    expect(tablero.datosSueltos.at(-1)?.valor).toBe('2 · 9 · 7');
  });

  it('sin nada facturado el porcentaje cobrado es cero', () => {
    const vacio = { ...OCTUBRE, facturacion: { ...OCTUBRE.facturacion, facturado: 0, cobrado: 0 } };
    expect(armarTablero({ totales: vacio, evolucion: vacio }, new Date()).porcentajeCobrado).toBe(0);
  });
});
