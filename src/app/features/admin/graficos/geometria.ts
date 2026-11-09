// Cuentas del gráfico de líneas: dónde va cada punto, cada marca y cada etiqueta.
// Separadas del componente para poder probarlas sin dibujar nada.

export interface SerieDeGrafico {
  nombre: string;
  color: string;
  valores: number[];
  /** Con área sombreada debajo de la línea. */
  area?: boolean;
}

export interface Punto {
  x: number;
  y: number;
}

export interface LineaDibujada {
  nombre: string;
  color: string;
  trazo: string;
  area: string | null;
  ultimo: Punto;
}

export interface Geometria {
  ancho: number;
  alto: number;
  izquierda: number;
  derecha: number;
  arriba: number;
  abajo: number;
  /** Separación entre dos períodos seguidos. */
  paso: number;
  /** Posición x de cada período. */
  xs: number[];
  marcas: { valor: number; y: number }[];
  etiquetasX: { x: number; periodo: string }[];
  lineas: LineaDibujada[];
  etiquetasFinales: { x: number; y: number; valor: number }[];
  /** Para la cruz que sigue al puntero: y de cada serie en cada período. */
  ys: number[][];
}

export const MARGEN = { arriba: 12, derecha: 64, abajo: 26, izquierda: 52 };
/** Cuántas etiquetas entran, como mucho, en el eje horizontal. */
const MAXIMO_DE_ETIQUETAS_X = 7;
/** Si dos etiquetas finales quedan más cerca que esto, la segunda no se dibuja (la leyenda la nombra). */
const SEPARACION_MINIMA = 14;

/** Marcas redondas del eje Y: 0, 250, 500... o 0, 2 M, 4 M... */
export function marcasDelEje(maximo: number): number[] {
  if (maximo <= 0) {
    return [0, 1];
  }
  let paso = 10 ** Math.floor(Math.log10(maximo / 4));
  for (const multiplo of [1, 2, 2.5, 5, 10]) {
    if (paso * multiplo * 4 >= maximo) {
      paso *= multiplo;
      break;
    }
  }
  return [0, 1, 2, 3, 4].map((i) => i * paso);
}

/**
 * El eje horizontal muestra todos los períodos, pero las líneas se cortan en
 * `cantidadConDatos` (los días que todavía no pasaron no se dibujan).
 */
export function armarGeometria(
  ancho: number,
  alto: number,
  periodos: string[],
  series: SerieDeGrafico[],
  cantidadConDatos: number,
): Geometria {
  const visibles = series.map((serie) => ({ ...serie, valores: serie.valores.slice(0, cantidadConDatos) }));
  const util = { ancho: ancho - MARGEN.izquierda - MARGEN.derecha, alto: alto - MARGEN.arriba - MARGEN.abajo };
  const marcas = marcasDelEje(Math.max(0, ...visibles.flatMap((serie) => serie.valores)));
  const tope = marcas[marcas.length - 1];
  const paso = periodos.length > 1 ? util.ancho / (periodos.length - 1) : 0;
  const x = (i: number) => MARGEN.izquierda + (periodos.length > 1 ? i * paso : util.ancho / 2);
  const y = (valor: number) => MARGEN.arriba + util.alto - (valor / tope) * util.alto;
  const base = MARGEN.arriba + util.alto;

  const lineas = visibles.filter((serie) => serie.valores.length > 0).map((serie) => dibujarLinea(serie, x, y, base));
  return {
    ancho,
    alto,
    izquierda: MARGEN.izquierda,
    derecha: ancho - MARGEN.derecha,
    arriba: MARGEN.arriba,
    abajo: base,
    paso,
    xs: periodos.map((_, i) => x(i)),
    marcas: marcas.map((valor) => ({ valor, y: y(valor) })),
    etiquetasX: elegirEtiquetasX(periodos).map((i) => ({ x: x(i), periodo: periodos[i] })),
    lineas,
    etiquetasFinales: ubicarEtiquetasFinales(visibles, x, y),
    ys: visibles.map((serie) => serie.valores.map(y)),
  };
}

/** Índice del período más cercano a una posición x, dentro de los que tienen datos. */
export function periodoMasCercano(geometria: Geometria, xEnSvg: number, cantidadConDatos: number): number {
  const indice = geometria.paso ? Math.round((xEnSvg - geometria.izquierda) / geometria.paso) : 0;
  return Math.max(0, Math.min(cantidadConDatos - 1, indice));
}

function dibujarLinea(
  serie: SerieDeGrafico,
  x: (i: number) => number,
  y: (valor: number) => number,
  base: number,
): LineaDibujada {
  const puntos = serie.valores.map((valor, i) => `${x(i)},${y(valor)}`);
  const ultimo = serie.valores.length - 1;
  const area = serie.area ? `M${x(0)},${base} L${puntos.join(' L')} L${x(ultimo)},${base} Z` : null;
  return {
    nombre: serie.nombre,
    color: serie.color,
    trazo: `M${puntos.join(' L')}`,
    area,
    ultimo: { x: x(ultimo), y: y(serie.valores[ultimo]) },
  };
}

/** Una etiqueta cada tantos períodos, y siempre la última. */
function elegirEtiquetasX(periodos: string[]): number[] {
  const cada = Math.max(1, Math.ceil(periodos.length / MAXIMO_DE_ETIQUETAS_X));
  return periodos
    .map((_, i) => i)
    .filter((i) => i % cada === 0 || i === periodos.length - 1);
}

function ubicarEtiquetasFinales(
  series: SerieDeGrafico[],
  x: (i: number) => number,
  y: (valor: number) => number,
): { x: number; y: number; valor: number }[] {
  const ubicadas: { x: number; y: number; valor: number }[] = [];
  for (const serie of series) {
    const ultimo = serie.valores.length - 1;
    if (ultimo < 0) {
      continue;
    }
    const altura = y(serie.valores[ultimo]) + 4;
    const pegada = ubicadas.some((otra) => Math.abs(otra.y - altura) < SEPARACION_MINIMA);
    if (!pegada) {
      ubicadas.push({ x: x(ultimo) + 10, y: altura, valor: serie.valores[ultimo] });
    }
  }
  return ubicadas;
}
