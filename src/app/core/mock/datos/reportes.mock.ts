import { MedioDePago } from '../../facturacion/factura.model';
import {
  Agrupacion,
  CantidadPorNombre,
  ReporteContrataciones,
  ReporteFacturacion,
  ReporteUsuarios,
} from '../../reportes/reporte.model';

// Reportes de ejemplo con la MISMA forma que los del backend (los de diseno/js/dashboard.js).
// Los números son "al azar" pero siempre iguales para la misma fecha, así no cambian al recargar.

type Calculo = (dia: Date) => number;

export function reporteDeFacturacion(desde: Date, hasta: Date, agrupacion: Agrupacion): ReporteFacturacion {
  const dias = diasEntre(desde, hasta);
  const facturado = sumar(dias, facturadoDelDia);
  const cobrado = sumar(dias, cobradoDelDia);
  const [pagadas, pendientes, vencidas] = repartir(Math.round(facturado / 26000), [0.8, 0.14, 0.06]);
  const medios: MedioDePago[] = ['TARJETA_DEBITO', 'TARJETA_CREDITO', 'MERCADO_PAGO', 'PAYPAL'];
  const montos = repartir(cobrado, [0.18, 0.33, 0.36, 0.13]);
  return {
    desde: aIso(desde),
    hasta: aIso(hasta),
    facturado,
    cobrado,
    deudaActual: 4820000,
    facturasEmitidas: { pendientes, pagadas, vencidas },
    cobradoPorMedio: medios.map((medio, i) => ({ medio, pagos: Math.round(montos[i] / 26000), monto: montos[i] })),
    debitosAutomaticosNuevos: sumar(dias, (dia) => valorDelDia(dia, 'debito', 0, 6)),
    debitosAutomaticosActivos: 812,
    serie: seriePorPeriodo(dias, agrupacion, { facturado: facturadoDelDia, cobrado: cobradoDelDia }).map(
      ({ periodo, valores }) => ({ periodo, facturado: valores['facturado'], cobrado: valores['cobrado'] }),
    ),
  };
}

export function reporteDeContrataciones(desde: Date, hasta: Date, agrupacion: Agrupacion): ReporteContrataciones {
  const dias = diasEntre(desde, hasta);
  const altas = sumar(dias, altasDelDia);
  const instalaciones = sumar(dias, instalacionesDelDia);
  const suspendidas = sumar(dias, (dia) => valorDelDia(dia, 'suspendidas', 0, 2));
  const tecnicos = ['Carlos Gómez', 'Sofía Díaz', 'Julieta Sosa', 'Martín Rivas', 'Paula Vega', 'Tomás Acosta', 'Laura Díaz'];
  return {
    desde: aIso(desde),
    hasta: aIso(hasta),
    contratacionesNuevas: altas,
    bajas: sumar(dias, bajasDelDia),
    suspendidas,
    reactivadas: Math.round(suspendidas * 0.6),
    instalacionesRealizadas: instalaciones,
    instalacionesPendientes: 23,
    contratacionesPorPlan: contarPorNombre(altas, ['Fibra 300', 'Fibra 1000', 'Fibra + TV', 'Móvil 20 GB'], [0.38, 0.3, 0.2, 0.12]),
    instalacionesPorTecnico: contarPorNombre(instalaciones, tecnicos, [0.2, 0.18, 0.16, 0.14, 0.12, 0.11, 0.09]),
    serie: seriePorPeriodo(dias, agrupacion, {
      altas: altasDelDia,
      bajas: bajasDelDia,
      instalaciones: instalacionesDelDia,
    }).map(({ periodo, valores }) => ({
      periodo,
      altas: valores['altas'],
      bajas: valores['bajas'],
      instalaciones: valores['instalaciones'],
    })),
  };
}

export function reporteDeUsuarios(desde: Date, hasta: Date, agrupacion: Agrupacion): ReporteUsuarios {
  const dias = diasEntre(desde, hasta);
  const clientesDelDia: Calculo = (dia) => valorDelDia(dia, 'clientes', 2, 15);
  return {
    desde: aIso(desde),
    hasta: aIso(hasta),
    clientesNuevos: sumar(dias, clientesDelDia),
    clientesActivos: 1284,
    personalActivo: { administradores: 2, empleados: 9, tecnicos: 7 },
    altasDeClientes: seriePorPeriodo(dias, agrupacion, { cantidad: clientesDelDia }).map(
      ({ periodo, valores }) => ({ periodo, cantidad: valores['cantidad'] }),
    ),
  };
}

// ---------- Valores de cada día ----------

const facturadoDelDia: Calculo = (dia) => valorDelDia(dia, 'facturado', 5500, 12500) * 100;
const cobradoDelDia: Calculo = (dia) =>
  Math.round(facturadoDelDia(dia) * (0.72 + 0.22 * azarDe(aIso(dia) + 'cobro')));
const altasDelDia: Calculo = (dia) => valorDelDia(dia, 'altas', 3, 18);
const bajasDelDia: Calculo = (dia) => valorDelDia(dia, 'bajas', 0, 4);
const instalacionesDelDia: Calculo = (dia) => valorDelDia(dia, 'instalaciones', 2, 14);

/** Los días futuros no tienen movimientos; los fines de semana, menos. */
function valorDelDia(fecha: Date, nombre: string, minimo: number, maximo: number): number {
  if (fecha > new Date()) {
    return 0;
  }
  const finDeSemana = fecha.getDay() === 0 || fecha.getDay() === 6;
  const valor = minimo + azarDe(aIso(fecha) + nombre) * (maximo - minimo);
  return Math.round(finDeSemana ? valor * 0.55 : valor);
}

/** Número entre 0 y 1 que depende solo del texto (siempre el mismo para el mismo texto). */
function azarDe(texto: string): number {
  let semilla = 0;
  for (const letra of texto) {
    semilla = (Math.imul(31, semilla) + letra.charCodeAt(0)) | 0;
  }
  semilla = (semilla + 0x6d2b79f5) | 0;
  let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// ---------- Ayudas ----------

function aIso(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function diasEntre(desde: Date, hasta: Date): Date[] {
  const dias: Date[] = [];
  for (let dia = new Date(desde); dia <= hasta; dia = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() + 1)) {
    dias.push(dia);
  }
  return dias;
}

function sumar(dias: Date[], calcular: Calculo): number {
  return dias.reduce((total, dia) => total + calcular(dia), 0);
}

/** Igual que Periodos.claveDe del backend: '2026-11-08' o '2026-11'. */
function claveDe(fecha: Date, agrupacion: Agrupacion): string {
  return agrupacion === 'MES' ? aIso(fecha).slice(0, 7) : aIso(fecha);
}

/** Una serie por período sumando los valores de cada día (como hace el backend al agrupar). */
function seriePorPeriodo(
  dias: Date[],
  agrupacion: Agrupacion,
  columnas: Record<string, Calculo>,
): { periodo: string; valores: Record<string, number> }[] {
  const puntos = new Map<string, Record<string, number>>();
  for (const dia of dias) {
    const clave = claveDe(dia, agrupacion);
    const punto = puntos.get(clave) ?? Object.fromEntries(Object.keys(columnas).map((nombre) => [nombre, 0]));
    for (const [nombre, calcular] of Object.entries(columnas)) {
      punto[nombre] += calcular(dia);
    }
    puntos.set(clave, punto);
  }
  return [...puntos].map(([periodo, valores]) => ({ periodo, valores }));
}

/** Reparte un total según proporciones (lo que sobra por redondeo va al primero). */
function repartir(total: number, proporciones: number[]): number[] {
  const partes = proporciones.map((proporcion) => Math.floor(total * proporcion));
  partes[0] += total - partes.reduce((suma, parte) => suma + parte, 0);
  return partes;
}

function contarPorNombre(total: number, nombres: string[], proporciones: number[]): CantidadPorNombre[] {
  return repartir(total, proporciones)
    .map((cantidad, i) => ({ nombre: nombres[i], cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);
}
