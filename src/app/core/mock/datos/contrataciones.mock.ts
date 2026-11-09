import { Contratacion } from '../../contrataciones/contratacion.model';

/** En la base además se guarda quién instala y cuándo (lo devuelven las rutas de instalaciones). */
export type ContratacionMock = Contratacion & {
  tecnicoId: number | null;
  tecnicoNombre: string | null;
  fechaInstalacion: string | null;
};

/**
 * Ana (10) tiene un plan activo, uno por instalar y uno suspendido.
 * Hay dos instalaciones sin técnico (Juan y Diego) y Carlos (3) tiene historial.
 */
export const CONTRATACIONES_MOCK: ContratacionMock[] = [
  { id: 1, clienteId: 10, planId: 1, planNombre: 'Fibra 300', precioMensual: 18500, direccion: 'Av. Corrientes 1234, CABA', estado: 'ACTIVA', fechaContratacion: '2026-03-12', fechaBaja: null, fechaSuspension: null, tecnicoId: 3, tecnicoNombre: 'Carlos Gómez', fechaInstalacion: '2026-03-15' },
  { id: 2, clienteId: 10, planId: 3, planNombre: 'Fibra + TV', precioMensual: 34200, direccion: 'Calle Falsa 742, Springfield', estado: 'PENDIENTE_INSTALACION', fechaContratacion: '2026-11-02', fechaBaja: null, fechaSuspension: null, tecnicoId: 3, tecnicoNombre: 'Carlos Gómez', fechaInstalacion: null },
  { id: 3, clienteId: 10, planId: 2, planNombre: 'Fibra 1000', precioMensual: 27900, direccion: 'Belgrano 55, Córdoba', estado: 'SUSPENDIDA_POR_FALTA_DE_PAGO', fechaContratacion: '2026-06-01', fechaBaja: null, fechaSuspension: '2026-11-03', tecnicoId: 4, tecnicoNombre: 'Sofía Díaz', fechaInstalacion: '2026-06-05' },
  { id: 4, clienteId: 11, planId: 2, planNombre: 'Fibra 1000', precioMensual: 27900, direccion: 'Mitre 890, Rosario', estado: 'ACTIVA', fechaContratacion: '2026-01-20', fechaBaja: null, fechaSuspension: null, tecnicoId: 3, tecnicoNombre: 'Carlos Gómez', fechaInstalacion: '2026-01-24' },
  { id: 5, clienteId: 12, planId: 4, planNombre: 'Móvil 20 GB', precioMensual: 9900, direccion: 'San Martín 300, Mendoza', estado: 'ACTIVA', fechaContratacion: '2026-05-05', fechaBaja: null, fechaSuspension: null, tecnicoId: 4, tecnicoNombre: 'Sofía Díaz', fechaInstalacion: '2026-05-06' },
  { id: 6, clienteId: 11, planId: 3, planNombre: 'Fibra + TV', precioMensual: 34200, direccion: 'Mitre 890, Rosario', estado: 'PENDIENTE_INSTALACION', fechaContratacion: '2026-11-06', fechaBaja: null, fechaSuspension: null, tecnicoId: null, tecnicoNombre: null, fechaInstalacion: null },
  { id: 7, clienteId: 13, planId: 1, planNombre: 'Fibra 300', precioMensual: 18500, direccion: 'Av. Pellegrini 1200, Rosario', estado: 'PENDIENTE_INSTALACION', fechaContratacion: '2026-10-30', fechaBaja: null, fechaSuspension: null, tecnicoId: null, tecnicoNombre: null, fechaInstalacion: null },
  { id: 8, clienteId: 12, planId: 1, planNombre: 'Fibra 300', precioMensual: 18500, direccion: 'Colón 640, Córdoba', estado: 'ACTIVA', fechaContratacion: '2026-10-25', fechaBaja: null, fechaSuspension: null, tecnicoId: 3, tecnicoNombre: 'Carlos Gómez', fechaInstalacion: '2026-11-04' },
  { id: 9, clienteId: 13, planId: 2, planNombre: 'Fibra 1000', precioMensual: 27900, direccion: 'Oroño 455, Rosario', estado: 'SUSPENDIDA_POR_FALTA_DE_PAGO', fechaContratacion: '2026-04-10', fechaBaja: null, fechaSuspension: '2026-10-28', tecnicoId: 4, tecnicoNombre: 'Sofía Díaz', fechaInstalacion: '2026-04-12' },
  { id: 10, clienteId: 12, planId: 2, planNombre: 'Fibra 1000', precioMensual: 27900, direccion: 'Colón 640, Córdoba', estado: 'BAJA', fechaContratacion: '2026-02-01', fechaBaja: '2026-08-15', fechaSuspension: null, tecnicoId: 3, tecnicoNombre: 'Carlos Gómez', fechaInstalacion: '2026-02-03' },
];
