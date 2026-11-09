import {
  aIso,
  calcularRangos,
  contarPeriodosPasados,
  describirPeriodo,
  desdeIso,
  mismoRango,
} from './periodo';

const NUEVE_DE_NOVIEMBRE = new Date(2026, 10, 9);

describe('periodo del dashboard', () => {
  it('pasa fechas a texto y de vuelta', () => {
    expect(aIso(NUEVE_DE_NOVIEMBRE)).toBe('2026-11-09');
    expect(desdeIso('2026-11-09')).toEqual(NUEVE_DE_NOVIEMBRE);
    expect(desdeIso('2026-11')).toEqual(new Date(2026, 10, 1));
  });

  it('un mes: totales y gráficos de todo el mes, día por día', () => {
    const { totales, evolucion } = calcularRangos({ modo: 'mes', fecha: NUEVE_DE_NOVIEMBRE });
    expect(totales).toEqual({ desde: '2026-11-01', hasta: '2026-11-30', agrupacion: 'DIA' });
    expect(mismoRango(totales, evolucion)).toBe(true);
  });

  it('un día: los totales son del día y los gráficos de su mes', () => {
    const { totales, evolucion } = calcularRangos({ modo: 'dia', fecha: NUEVE_DE_NOVIEMBRE });
    expect(totales).toEqual({ desde: '2026-11-09', hasta: '2026-11-09', agrupacion: 'DIA' });
    expect(evolucion).toEqual({ desde: '2026-11-01', hasta: '2026-11-30', agrupacion: 'DIA' });
  });

  it('un año: todo el año, mes por mes', () => {
    const { totales } = calcularRangos({ modo: 'anio', fecha: NUEVE_DE_NOVIEMBRE });
    expect(totales).toEqual({ desde: '2026-01-01', hasta: '2026-12-31', agrupacion: 'MES' });
  });

  it('describe el período elegido', () => {
    expect(describirPeriodo({ modo: 'anio', fecha: NUEVE_DE_NOVIEMBRE })).toBe('Año 2026');
    expect(describirPeriodo({ modo: 'mes', fecha: NUEVE_DE_NOVIEMBRE })).toMatch(/^Noviembre/);
  });

  it('cuenta solo los períodos que ya empezaron', () => {
    const dias = ['2026-11-08', '2026-11-09', '2026-11-10'];
    expect(contarPeriodosPasados(dias, NUEVE_DE_NOVIEMBRE)).toBe(2);
    expect(contarPeriodosPasados(['2026-10', '2026-11', '2026-12'], NUEVE_DE_NOVIEMBRE)).toBe(2);
  });
});
