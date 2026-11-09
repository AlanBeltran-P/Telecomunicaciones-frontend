import { EstadoContratacion } from './contratacion.model';

/** InstalacionResponse del backend: una contratación vista desde su instalación. */
export interface Instalacion {
  contratacionId: number;
  clienteId: number;
  planNombre: string;
  direccion: string;
  fechaContratacion: string;
  tecnicoId: number | null;
  tecnicoNombre: string | null;
  estado: EstadoContratacion;
  fechaInstalacion: string | null;
}
