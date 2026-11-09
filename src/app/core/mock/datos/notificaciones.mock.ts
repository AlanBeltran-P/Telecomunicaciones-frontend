import { Notificacion } from '../../notificaciones/notificacion.model';

export type NotificacionMock = Notificacion & { clienteId: number };

export const NOTIFICACIONES_MOCK: NotificacionMock[] = [
  { id: 1, clienteId: 10, asunto: 'Tu plan Fibra 1000 fue suspendido', mensaje: 'La factura de octubre lleva 14 días vencida. Pagala para reactivar el servicio.', fecha: '2026-11-03T02:00:00', leida: false },
  { id: 2, clienteId: 10, asunto: 'Nueva factura de Fibra 300', mensaje: 'Ya está disponible la factura de noviembre por $ 18.500. Vence el 18/11.', fecha: '2026-11-08T02:00:00', leida: false },
  { id: 3, clienteId: 10, asunto: 'Técnico asignado', mensaje: 'Carlos Gómez va a hacer la instalación de Fibra + TV.', fecha: '2026-11-06T11:24:00', leida: false },
  { id: 4, clienteId: 10, asunto: 'Pago recibido', mensaje: 'Registramos tu pago de $ 18.500 con Mercado Pago.', fecha: '2026-10-15T18:02:00', leida: true },
];
