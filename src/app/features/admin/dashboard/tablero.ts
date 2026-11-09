import { nombreDelMedio } from '../../../core/facturacion/medio-de-pago';
import { CantidadPorNombre, Reportes } from '../../../core/reportes/reporte.model';
import { ParteDeBarra } from '../graficos/barra-segmentada';
import { ItemDeBarra } from '../graficos/barras';
import { SerieDeGrafico } from '../graficos/geometria';
import { numero, pesos, pesosCorto } from './formatos';
import { contarPeriodosPasados } from './periodo';

/** Reportes del período elegido (totales) y de su mes o año (evolución). */
export interface DatosDelDashboard {
  totales: Reportes;
  evolucion: Reportes;
}

export interface Evolucion {
  periodos: string[];
  series: SerieDeGrafico[];
}

/** Todo lo que muestra el dashboard, ya calculado. */
export interface Tablero {
  cobrado: number;
  facturado: number;
  deudaActual: number;
  porcentajeCobrado: number;
  clientesNuevos: number;
  contratacionesNuevas: number;
  instalacionesRealizadas: number;
  bajas: number;
  facturacion: Evolucion;
  movimientos: Evolucion;
  /** Períodos de la evolución que ya empezaron. */
  periodosConDatos: number;
  estados: ParteDeBarra[];
  totalEmitidas: number;
  medios: ItemDeBarra[];
  planes: ItemDeBarra[];
  tecnicos: ItemDeBarra[];
  datosSueltos: { valor: string; etiqueta: string }[];
}

export function armarTablero({ totales, evolucion }: DatosDelDashboard, hoy: Date): Tablero {
  const { usuarios, contrataciones, facturacion } = totales;
  const { pagadas, pendientes, vencidas } = facturacion.facturasEmitidas;
  const periodos = evolucion.facturacion.serie.map((punto) => punto.periodo);
  return {
    cobrado: facturacion.cobrado,
    facturado: facturacion.facturado,
    deudaActual: facturacion.deudaActual,
    porcentajeCobrado: facturacion.facturado
      ? Math.round((facturacion.cobrado / facturacion.facturado) * 100)
      : 0,
    clientesNuevos: usuarios.clientesNuevos,
    contratacionesNuevas: contrataciones.contratacionesNuevas,
    instalacionesRealizadas: contrataciones.instalacionesRealizadas,
    bajas: contrataciones.bajas,
    facturacion: evolucionDeFacturacion(evolucion),
    movimientos: evolucionDeMovimientos(evolucion),
    periodosConDatos: contarPeriodosPasados(periodos, hoy),
    estados: [
      { nombre: 'Pagadas', valor: pagadas, color: 'var(--exito)' },
      { nombre: 'Pendientes', valor: pendientes, color: 'var(--alerta)' },
      { nombre: 'Vencidas', valor: vencidas, color: 'var(--peligro)' },
    ],
    totalEmitidas: pagadas + pendientes + vencidas,
    medios: facturacion.cobradoPorMedio.map((medio) => ({
      nombre: nombreDelMedio(medio.medio),
      valor: medio.monto,
      texto: pesos(medio.monto),
      textoCorto: pesosCorto(medio.monto),
      detalle: `${numero(medio.pagos)} pagos`,
    })),
    planes: aBarras(contrataciones.contratacionesPorPlan, 'contrataciones'),
    tecnicos: aBarras(contrataciones.instalacionesPorTecnico, 'instalaciones'),
    datosSueltos: [
      { valor: numero(contrataciones.suspendidas), etiqueta: 'Suspendidas por falta de pago' },
      { valor: numero(contrataciones.reactivadas), etiqueta: 'Reactivadas' },
      { valor: numero(contrataciones.instalacionesPendientes), etiqueta: 'Instalaciones pendientes (hoy)' },
      { valor: numero(facturacion.debitosAutomaticosNuevos), etiqueta: 'Débitos automáticos nuevos' },
      { valor: numero(facturacion.debitosAutomaticosActivos), etiqueta: 'Débitos automáticos activos' },
      { valor: numero(usuarios.clientesActivos), etiqueta: 'Clientes activos' },
      {
        valor: `${usuarios.personalActivo.administradores} · ${usuarios.personalActivo.empleados} · ${usuarios.personalActivo.tecnicos}`,
        etiqueta: 'Personal: admins · empleados · técnicos',
      },
    ],
  };
}

function evolucionDeFacturacion({ facturacion }: Reportes): Evolucion {
  return {
    periodos: facturacion.serie.map((punto) => punto.periodo),
    series: [
      { nombre: 'Facturado', color: 'var(--serie-1)', valores: facturacion.serie.map((p) => p.facturado), area: true },
      { nombre: 'Cobrado', color: 'var(--serie-2)', valores: facturacion.serie.map((p) => p.cobrado) },
    ],
  };
}

function evolucionDeMovimientos({ contrataciones }: Reportes): Evolucion {
  return {
    periodos: contrataciones.serie.map((punto) => punto.periodo),
    series: [
      { nombre: 'Altas', color: 'var(--serie-1)', valores: contrataciones.serie.map((p) => p.altas) },
      { nombre: 'Bajas', color: 'var(--serie-2)', valores: contrataciones.serie.map((p) => p.bajas) },
      { nombre: 'Instalaciones', color: 'var(--serie-3)', valores: contrataciones.serie.map((p) => p.instalaciones) },
    ],
  };
}

function aBarras(cantidades: CantidadPorNombre[], detalle: string): ItemDeBarra[] {
  return cantidades.map(({ nombre, cantidad }) => ({
    nombre,
    valor: cantidad,
    texto: numero(cantidad),
    detalle,
  }));
}
