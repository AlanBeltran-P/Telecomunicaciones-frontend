import { Plan, PlanRequest } from '../../planes/plan.model';
import { PlanMock } from '../datos/planes.mock';
import { MockDb } from '../mock-db';
import { ErrorMock, respuesta, sinContenido } from '../respuestas';
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
  // ---------- Administrador ----------
  {
    metodo: 'POST',
    patron: /^\/planes$/,
    responder: ({ req, db }) => {
      const plan: PlanMock = { ...(req.body as PlanRequest), id: db.nuevoId(), activo: true };
      db.planes.push(plan);
      return respuesta(aPlan(plan), 201);
    },
  },
  {
    metodo: 'PUT',
    patron: /^\/planes\/(\d+)$/,
    responder: ({ req, parametros, db }) => {
      const plan = buscarPlanActivo(db, Number(parametros[0]));
      Object.assign(plan, req.body as PlanRequest);
      return respuesta(aPlan(plan));
    },
  },
  {
    metodo: 'DELETE',
    patron: /^\/planes\/(\d+)$/,
    responder: ({ parametros, db }) => {
      // Baja lógica, como el backend: deja de ofrecerse pero no se borra
      buscarPlanActivo(db, Number(parametros[0])).activo = false;
      return sinContenido();
    },
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
