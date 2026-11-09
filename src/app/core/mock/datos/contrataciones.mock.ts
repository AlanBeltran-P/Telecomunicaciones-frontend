import { Contratacion } from '../../contrataciones/contratacion.model';

/** Ana (10) tiene un plan activo, uno por instalar y uno suspendido; Juan y María, uno activo cada uno. */
export const CONTRATACIONES_MOCK: Contratacion[] = [
  { id: 1, clienteId: 10, planId: 1, planNombre: 'Fibra 300', precioMensual: 18500, direccion: 'Av. Corrientes 1234, CABA', estado: 'ACTIVA', fechaContratacion: '2026-03-12', fechaBaja: null, fechaSuspension: null },
  { id: 2, clienteId: 10, planId: 3, planNombre: 'Fibra + TV', precioMensual: 34200, direccion: 'Calle Falsa 742, Springfield', estado: 'PENDIENTE_INSTALACION', fechaContratacion: '2026-11-02', fechaBaja: null, fechaSuspension: null },
  { id: 3, clienteId: 10, planId: 2, planNombre: 'Fibra 1000', precioMensual: 27900, direccion: 'Belgrano 55, Córdoba', estado: 'SUSPENDIDA_POR_FALTA_DE_PAGO', fechaContratacion: '2026-06-01', fechaBaja: null, fechaSuspension: '2026-11-03' },
  { id: 4, clienteId: 11, planId: 2, planNombre: 'Fibra 1000', precioMensual: 27900, direccion: 'Mitre 890, Rosario', estado: 'ACTIVA', fechaContratacion: '2026-01-20', fechaBaja: null, fechaSuspension: null },
  { id: 5, clienteId: 12, planId: 4, planNombre: 'Móvil 20 GB', precioMensual: 9900, direccion: 'San Martín 300, Mendoza', estado: 'ACTIVA', fechaContratacion: '2026-05-05', fechaBaja: null, fechaSuspension: null },
];
