import { Insignia } from '../contrataciones/contratacion.model';

export type EstadoFactura = 'PENDIENTE' | 'PAGADA' | 'VENCIDA';
export type MedioDePago = 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'MERCADO_PAGO' | 'PAYPAL';

/** FacturaResponse del backend. Las fechas llegan como 'YYYY-MM-DD'. */
export interface Factura {
  id: number;
  contratacionId: number;
  planNombre: string;
  monto: number;
  periodoDesde: string;
  periodoHasta: string;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: EstadoFactura;
  fechaPago: string | null;
  medioDePago: MedioDePago | null;
}

/** Cuerpo de PagarFacturaRequest y de ActivarDebitoRequest (son iguales). */
export interface PagoRequest {
  medio: MedioDePago;
  tokenDePago: string;
}

export interface DebitoAutomatico {
  medio: MedioDePago;
  fechaAlta: string;
}

export const INSIGNIA_DE_FACTURA: Record<EstadoFactura, Insignia> = {
  PENDIENTE: { texto: 'Pendiente', clase: 'insignia--pendiente' },
  PAGADA: { texto: 'Pagada', clase: 'insignia--pagada' },
  VENCIDA: { texto: 'Vencida', clase: 'insignia--vencida' },
};
