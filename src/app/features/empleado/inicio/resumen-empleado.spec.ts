import { Cliente } from '../../../core/clientes/cliente.model';
import { Contratacion } from '../../../core/contrataciones/contratacion.model';
import { Instalacion } from '../../../core/contrataciones/instalacion.model';
import { armarResumenDelEmpleado } from './resumen-empleado';

const CLIENTES = [{ activo: true }, { activo: true }, { activo: false }] as Cliente[];
const PENDIENTES = [{ tecnicoId: null }, { tecnicoId: 3 }, { tecnicoId: null }] as Instalacion[];
const SUSPENDIDAS = [
  { id: 1, fechaSuspension: '2026-10-01' },
  { id: 2, fechaSuspension: '2026-11-03' },
  { id: 3, fechaSuspension: '2026-10-20' },
  { id: 4, fechaSuspension: '2026-09-15' },
] as Contratacion[];

describe('armarResumenDelEmpleado', () => {
  const resumen = armarResumenDelEmpleado({
    clientes: CLIENTES,
    pendientes: PENDIENTES,
    suspendidas: SUSPENDIDAS,
  });

  it('cuenta solo los clientes activos', () => {
    expect(resumen.clientesActivos).toBe(2);
  });

  it('separa las instalaciones que no tienen técnico', () => {
    expect(resumen.sinTecnico.length).toBe(2);
  });

  it('muestra las tres suspendidas más recientes pero cuenta todas', () => {
    expect(resumen.totalSuspendidas).toBe(4);
    expect(resumen.suspendidas.map((c) => c.id)).toEqual([2, 3, 1]);
  });
});
