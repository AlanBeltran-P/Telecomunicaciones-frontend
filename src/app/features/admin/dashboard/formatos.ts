// Formatos del dashboard, en pesos y con separadores argentinos.

const FORMATO_PESOS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});
const FORMATO_COMPACTO = new Intl.NumberFormat('es-AR', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const FORMATO_NUMERO = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** $ 4.820.000 */
export function pesos(valor: number): string {
  return FORMATO_PESOS.format(valor);
}

/** $ 4,8 M: entra siempre en un indicador o en el eje de un gráfico. */
export function pesosCorto(valor: number): string {
  return `$ ${FORMATO_COMPACTO.format(valor)}`;
}

/** 1.284 */
export function numero(valor: number): string {
  return FORMATO_NUMERO.format(valor);
}

/** '2026-11-08' → '8 nov' y '2026-11' → 'nov 26' */
export function etiquetaCorta(periodo: string): string {
  const [anio, mes, dia] = periodo.split('-').map(Number);
  return dia ? `${dia} ${MESES[mes - 1]}` : `${MESES[mes - 1]} ${String(anio).slice(2)}`;
}
