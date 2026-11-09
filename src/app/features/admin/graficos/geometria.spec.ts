import { MARGEN, armarGeometria, marcasDelEje, periodoMasCercano } from './geometria';

const PERIODOS = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05'];

describe('geometría del gráfico de líneas', () => {
  it('elige marcas redondas para el eje', () => {
    expect(marcasDelEje(17)).toEqual([0, 5, 10, 15, 20]);
    expect(marcasDelEje(1800000)).toEqual([0, 500000, 1000000, 1500000, 2000000]);
    expect(marcasDelEje(0)).toEqual([0, 1]);
  });

  it('reparte los períodos a lo ancho, entre los márgenes', () => {
    const geometria = armarGeometria(516, 240, PERIODOS, [], 5);
    expect(geometria.xs[0]).toBe(MARGEN.izquierda);
    expect(geometria.xs[4]).toBe(516 - MARGEN.derecha);
    expect(geometria.paso).toBe(100);
  });

  it('corta la línea en el último período con datos', () => {
    const serie = { nombre: 'Altas', color: 'red', valores: [1, 2, 3, 4, 5] };
    const geometria = armarGeometria(516, 240, PERIODOS, [serie], 3);
    expect(geometria.lineas[0].trazo.split('L').length).toBe(3);
    expect(geometria.lineas[0].ultimo.x).toBe(geometria.xs[2]);
  });

  it('no dibuja dos etiquetas finales encimadas', () => {
    const series = [
      { nombre: 'A', color: 'red', valores: [10, 10] },
      { nombre: 'B', color: 'blue', valores: [10, 10] },
    ];
    const geometria = armarGeometria(516, 240, PERIODOS.slice(0, 2), series, 2);
    expect(geometria.etiquetasFinales.length).toBe(1);
  });

  it('encuentra el período más cercano al puntero, sin pasarse de los que tienen datos', () => {
    const geometria = armarGeometria(516, 240, PERIODOS, [], 5);
    expect(periodoMasCercano(geometria, MARGEN.izquierda + 140, 5)).toBe(1);
    expect(periodoMasCercano(geometria, 500, 3)).toBe(2);
    expect(periodoMasCercano(geometria, 0, 5)).toBe(0);
  });
});
