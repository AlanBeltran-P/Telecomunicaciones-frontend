import { Cliente } from '../../../core/clientes/cliente.model';
import { Contratacion } from '../../../core/contrataciones/contratacion.model';
import { Instalacion } from '../../../core/contrataciones/instalacion.model';

export interface DatosDelEmpleado {
  clientes: Cliente[];
  pendientes: Instalacion[];
  suspendidas: Contratacion[];
}

export interface ResumenDelEmpleado {
  clientesActivos: number;
  sinTecnico: Instalacion[];
  totalSuspendidas: number;
  /** Solo las más recientes. */
  suspendidas: Contratacion[];
}

/** En el inicio entran pocas: el resto está en su pantalla. */
const MAXIMO_EN_LISTA = 3;

export function armarResumenDelEmpleado({
  clientes,
  pendientes,
  suspendidas,
}: DatosDelEmpleado): ResumenDelEmpleado {
  return {
    clientesActivos: clientes.filter((cliente) => cliente.activo).length,
    sinTecnico: pendientes.filter((instalacion) => instalacion.tecnicoId === null),
    totalSuspendidas: suspendidas.length,
    suspendidas: masRecientes(suspendidas).slice(0, MAXIMO_EN_LISTA),
  };
}

/** La suspendida más recientemente primero ('YYYY-MM-DD' se ordena bien como texto). */
function masRecientes(suspendidas: Contratacion[]): Contratacion[] {
  return [...suspendidas].sort((a, b) =>
    (b.fechaSuspension ?? '').localeCompare(a.fechaSuspension ?? ''),
  );
}
