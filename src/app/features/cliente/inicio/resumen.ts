import { Contratacion } from '../../../core/contrataciones/contratacion.model';
import { DebitoAutomatico, Factura } from '../../../core/facturacion/factura.model';

export interface DatosDelCliente {
  contrataciones: Contratacion[];
  facturas: Factura[];
  debito: DebitoAutomatico | null;
}

export interface ResumenDelCliente {
  planesActivos: number;
  totalAPagar: number;
  proximoVencimiento: string | null;
  vencidas: Factura[];
  suspendidas: Contratacion[];
  sinDebito: boolean;
  instalacion: Contratacion | undefined;
}

export function armarResumen({
  contrataciones,
  facturas,
  debito,
}: DatosDelCliente): ResumenDelCliente {
  const adeudadas = facturas.filter((factura) => factura.estado !== 'PAGADA');
  const pendientes = facturas.filter((factura) => factura.estado === 'PENDIENTE');
  return {
    planesActivos: contrataciones.filter((c) => c.estado === 'ACTIVA').length,
    totalAPagar: adeudadas.reduce((total, factura) => total + factura.monto, 0),
    proximoVencimiento: primeraFecha(pendientes.map((factura) => factura.fechaVencimiento)),
    vencidas: facturas.filter((factura) => factura.estado === 'VENCIDA'),
    suspendidas: contrataciones.filter((c) => c.estado === 'SUSPENDIDA_POR_FALTA_DE_PAGO'),
    sinDebito: debito === null,
    instalacion: contrataciones.find((c) => c.estado === 'PENDIENTE_INSTALACION'),
  };
}

/** Las fechas 'YYYY-MM-DD' se ordenan bien como texto. */
function primeraFecha(fechas: string[]): string | null {
  return [...fechas].sort()[0] ?? null;
}
