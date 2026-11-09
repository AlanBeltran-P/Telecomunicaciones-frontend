export type EstadoContratacion =
  | 'PENDIENTE_INSTALACION'
  | 'ACTIVA'
  | 'BAJA'
  | 'SUSPENDIDA_POR_FALTA_DE_PAGO';

/** ContratacionResponse del backend. Las fechas llegan como 'YYYY-MM-DD'. */
export interface Contratacion {
  id: number;
  clienteId: number;
  planId: number;
  planNombre: string;
  precioMensual: number;
  direccion: string;
  estado: EstadoContratacion;
  fechaContratacion: string;
  fechaBaja: string | null;
  fechaSuspension: string | null;
}

export interface ContratarPlanRequest {
  planId: number;
  direccion: string;
}

export interface Insignia {
  texto: string;
  clase: string;
}

export const INSIGNIA_DE_CONTRATACION: Record<EstadoContratacion, Insignia> = {
  PENDIENTE_INSTALACION: { texto: 'Pendiente de instalación', clase: 'insignia--instalacion' },
  ACTIVA: { texto: 'Activa', clase: 'insignia--activa' },
  BAJA: { texto: 'Dada de baja', clase: 'insignia--baja' },
  SUSPENDIDA_POR_FALTA_DE_PAGO: { texto: 'Suspendida', clase: 'insignia--suspendida' },
};
