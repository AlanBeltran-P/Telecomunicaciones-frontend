import { Plan } from '../../planes/plan.model';
import { PlanMock } from '../datos/planes.mock';
import { MockDb } from '../mock-db';
import { ErrorMock, respuesta } from '../respuestas';
import { RutaMock } from '../ruta-mock';

export const RUTAS_PLANES: RutaMock[] = [
  {
    metodo: 'GET',
    patron: /^\/planes$/,
    responder: ({ db }) => respuesta(db.planes.filter((plan) => plan.activo).map(aPlan)),
  },
  {
    metodo: 'GET',
    patron: /^\/planes\/(\d+)$/,
    responder: ({ parametros, db }) =>
      respuesta(aPlan(buscarPlanActivo(db, Number(parametros[0])))),
  },
];

export function buscarPlanActivo(db: MockDb, id: number): PlanMock {
  const plan = db.planes.find((p) => p.id === id && p.activo);
  if (!plan) {
    throw new ErrorMock(404, `No existe un plan activo con id ${id}`);
  }
  return plan;
}

function aPlan({ id, nombre, descripcion, precio }: PlanMock): Plan {
  return { id, nombre, descripcion, precio };
}
