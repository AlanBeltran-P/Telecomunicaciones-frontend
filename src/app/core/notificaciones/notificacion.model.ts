/** NotificacionResponse del backend. fecha: 'YYYY-MM-DDTHH:mm:ss' */
export interface Notificacion {
  id: number;
  asunto: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
}
