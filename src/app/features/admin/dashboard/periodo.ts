import { Agrupacion, RangoDeReporte } from '../../../core/reportes/reporte.model';

export type ModoDePeriodo = 'dia' | 'mes' | 'anio';

/** Lo que elige el administrador en los filtros. */
export interface Periodo {
  modo: ModoDePeriodo;
  fecha: Date;
}

/** Rango de los totales y rango de los gráficos de evolución (pueden no coincidir). */
export interface RangosDelDashboard {
  totales: RangoDeReporte;
  evolucion: RangoDeReporte;
}

export function hoySinHora(): Date {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

/** Fecha local como 'YYYY-MM-DD' (igual que LocalDate en el backend). */
export function aIso(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** 'YYYY-MM-DD' o 'YYYY-MM' a fecha local (un mes cuenta desde su día 1). */
export function desdeIso(texto: string): Date {
  const [anio, mes, dia = 1] = texto.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

/**
 * Día: los totales son de ese día y los gráficos muestran su mes (con el día resaltado).
 * Mes: todo el mes, día por día. Año: todo el año, mes por mes.
 */
export function calcularRangos({ modo, fecha }: Periodo): RangosDelDashboard {
  const anio = fecha.getFullYear();
  const mes = fecha.getMonth();
  const delMes = rango(new Date(anio, mes, 1), new Date(anio, mes + 1, 0), 'DIA');
  if (modo === 'dia') {
    return { totales: rango(fecha, fecha, 'DIA'), evolucion: delMes };
  }
  if (modo === 'anio') {
    const delAnio = rango(new Date(anio, 0, 1), new Date(anio, 11, 31), 'MES');
    return { totales: delAnio, evolucion: delAnio };
  }
  return { totales: delMes, evolucion: delMes };
}

export function mismoRango(a: RangoDeReporte, b: RangoDeReporte): boolean {
  return a.desde === b.desde && a.hasta === b.hasta && a.agrupacion === b.agrupacion;
}

/** "Noviembre de 2026", "Año 2026" o "Lunes, 9 de noviembre de 2026". */
export function describirPeriodo({ modo, fecha }: Periodo): string {
  if (modo === 'anio') {
    return `Año ${fecha.getFullYear()}`;
  }
  const opciones: Intl.DateTimeFormatOptions =
    modo === 'dia'
      ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
      : { month: 'long', year: 'numeric' };
  const texto = fecha.toLocaleDateString('es-AR', opciones);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Cuántos períodos ya empezaron: los futuros no tienen datos todavía (no son "cero"). */
export function contarPeriodosPasados(periodos: string[], hoy: Date): number {
  return periodos.filter((periodo) => desdeIso(periodo) <= hoy).length;
}

function rango(desde: Date, hasta: Date, agrupacion: Agrupacion): RangoDeReporte {
  return { desde: aIso(desde), hasta: aIso(hasta), agrupacion };
}
