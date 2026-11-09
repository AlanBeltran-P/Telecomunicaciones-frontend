import { Factura, MedioDePago } from '../../facturacion/factura.model';

export type FacturaMock = Factura & { clienteId: number };

export interface DebitoMock {
  clienteId: number;
  medio: MedioDePago;
  fechaAlta: string;
}

/** Ana debe $ 46.400: noviembre de Fibra 300 (pendiente) y octubre de Fibra 1000 (vencida). */
export const FACTURAS_MOCK: FacturaMock[] = [
  { id: 1, clienteId: 10, contratacionId: 1, planNombre: 'Fibra 300', monto: 18500, periodoDesde: '2026-11-01', periodoHasta: '2026-11-30', fechaEmision: '2026-11-08', fechaVencimiento: '2026-11-18', estado: 'PENDIENTE', fechaPago: null, medioDePago: null },
  { id: 2, clienteId: 10, contratacionId: 3, planNombre: 'Fibra 1000', monto: 27900, periodoDesde: '2026-10-01', periodoHasta: '2026-10-31', fechaEmision: '2026-10-10', fechaVencimiento: '2026-10-20', estado: 'VENCIDA', fechaPago: null, medioDePago: null },
  { id: 3, clienteId: 10, contratacionId: 1, planNombre: 'Fibra 300', monto: 18500, periodoDesde: '2026-10-01', periodoHasta: '2026-10-31', fechaEmision: '2026-10-08', fechaVencimiento: '2026-10-18', estado: 'PAGADA', fechaPago: '2026-10-15', medioDePago: 'MERCADO_PAGO' },
  { id: 4, clienteId: 10, contratacionId: 1, planNombre: 'Fibra 300', monto: 18500, periodoDesde: '2026-09-01', periodoHasta: '2026-09-30', fechaEmision: '2026-09-08', fechaVencimiento: '2026-09-18', estado: 'PAGADA', fechaPago: '2026-09-16', medioDePago: 'TARJETA_CREDITO' },
  { id: 5, clienteId: 11, contratacionId: 4, planNombre: 'Fibra 1000', monto: 27900, periodoDesde: '2026-11-01', periodoHasta: '2026-11-30', fechaEmision: '2026-11-08', fechaVencimiento: '2026-11-18', estado: 'PENDIENTE', fechaPago: null, medioDePago: null },
];
