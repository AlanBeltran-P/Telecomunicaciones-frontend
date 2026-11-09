import { MedioDePago } from './factura.model';

export interface OpcionDeMedio {
  medio: MedioDePago;
  nombre: string;
  sigla: string;
  color: string | null;
}

export const MEDIOS_DE_PAGO: OpcionDeMedio[] = [
  { medio: 'TARJETA_DEBITO', nombre: 'Tarjeta de débito', sigla: 'DÉB', color: null },
  { medio: 'TARJETA_CREDITO', nombre: 'Tarjeta de crédito', sigla: 'CRÉ', color: null },
  { medio: 'MERCADO_PAGO', nombre: 'Mercado Pago', sigla: 'MP', color: 'var(--cian)' },
  { medio: 'PAYPAL', nombre: 'PayPal', sigla: 'PP', color: 'var(--violeta)' },
];

export function opcionDeMedio(medio: MedioDePago): OpcionDeMedio {
  return MEDIOS_DE_PAGO.find((opcion) => opcion.medio === medio) ?? MEDIOS_DE_PAGO[0];
}

export function nombreDelMedio(medio: MedioDePago | null): string {
  return medio ? opcionDeMedio(medio).nombre : '';
}

/**
 * Token de pago. Con las integraciones reales lo devuelve el SDK del proveedor
 * cuando la persona carga sus datos en el formulario seguro.
 * Hoy el backend usa una pasarela simulada que aprueba cualquier token salvo "rechazado".
 */
export function tokenDePagoSimulado(medio: MedioDePago): string {
  return `simulado-${medio.toLowerCase()}-${Date.now()}`;
}
