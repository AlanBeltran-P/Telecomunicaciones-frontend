import { MedioDePago } from '../facturacion/factura.model';

/** Cómo se agrupa la serie: un punto por día ('2026-11-08') o por mes ('2026-11'). */
export type Agrupacion = 'DIA' | 'MES';

/** Parámetros de los tres reportes: ?desde=&hasta=&agrupacion= (fechas 'YYYY-MM-DD'). */
export interface RangoDeReporte {
  desde: string;
  hasta: string;
  agrupacion: Agrupacion;
}

/** GET /api/usuarios/reporte */
export interface ReporteUsuarios {
  desde: string;
  hasta: string;
  clientesNuevos: number;
  clientesActivos: number;
  personalActivo: { administradores: number; empleados: number; tecnicos: number };
  altasDeClientes: { periodo: string; cantidad: number }[];
}

export interface CantidadPorNombre {
  nombre: string;
  cantidad: number;
}

/** GET /api/contrataciones/reporte */
export interface ReporteContrataciones {
  desde: string;
  hasta: string;
  contratacionesNuevas: number;
  bajas: number;
  suspendidas: number;
  reactivadas: number;
  instalacionesRealizadas: number;
  instalacionesPendientes: number;
  contratacionesPorPlan: CantidadPorNombre[];
  instalacionesPorTecnico: CantidadPorNombre[];
  serie: { periodo: string; altas: number; bajas: number; instalaciones: number }[];
}

/** GET /api/facturas/reporte */
export interface ReporteFacturacion {
  desde: string;
  hasta: string;
  facturado: number;
  cobrado: number;
  deudaActual: number;
  facturasEmitidas: { pendientes: number; pagadas: number; vencidas: number };
  cobradoPorMedio: { medio: MedioDePago; pagos: number; monto: number }[];
  debitosAutomaticosNuevos: number;
  debitosAutomaticosActivos: number;
  serie: { periodo: string; facturado: number; cobrado: number }[];
}

/** Los tres reportes del mismo rango, juntos. */
export interface Reportes {
  usuarios: ReporteUsuarios;
  contrataciones: ReporteContrataciones;
  facturacion: ReporteFacturacion;
}
