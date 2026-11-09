import { Contratacion, ContratarPlanRequest } from '../../contrataciones/contratacion.model';
import { PlanMock } from '../datos/planes.mock';
import { hoy } from '../fechas';
import { MockDb } from '../mock-db';
import { ErrorMock, respuesta } from '../respuestas';
import { RutaMock } from '../ruta-mock';

export const RUTAS_CONTRATACIONES: RutaMock[] = [
  {
    metodo: 'GET',
    patron: /^\/contrataciones\/mias$/,
    responder: ({ db }) => {
      const cliente = db.usuarioLogueado();
      const suyas = db.contrataciones.filter((c) => c.clienteId === cliente.id);
      return respuesta(masNuevasPrimero(suyas));
    },
  },
  {
    metodo: 'POST',
    patron: /^\/contrataciones$/,
    responder: ({ req, db }) => {
      const cliente = db.usuarioLogueado();
      const { planId, direccion } = req.body as ContratarPlanRequest;
      const plan = planDisponible(db, planId);
      validarQueNoLoTenga(db, cliente.id, plan);
      const nueva: Contratacion = {
        id: db.nuevoId(),
        clienteId: cliente.id,
        planId: plan.id,
        planNombre: plan.nombre,
        precioMensual: plan.precio,
        direccion,
        estado: 'PENDIENTE_INSTALACION',
        fechaContratacion: hoy(),
        fechaBaja: null,
        fechaSuspension: null,
      };
      db.contrataciones.push(nueva);
      return respuesta(nueva, 201);
    },
  },
];

function planDisponible(db: MockDb, planId: number): PlanMock {
  const plan = db.planes.find((p) => p.id === planId && p.activo);
  if (!plan) {
    throw new ErrorMock(404, `El plan ${planId} no existe o ya no está disponible`);
  }
  return plan;
}

/** Como el backend: no se puede tener dos veces el mismo plan, salvo que el anterior esté dado de baja. */
function validarQueNoLoTenga(db: MockDb, clienteId: number, plan: PlanMock): void {
  const yaLoTiene = db.contrataciones.some(
    (c) => c.clienteId === clienteId && c.planId === plan.id && c.estado !== 'BAJA',
  );
  if (yaLoTiene) {
    throw new ErrorMock(409, `Ya tenés contratado el plan ${plan.nombre}`);
  }
}

/** La más nueva primero ('YYYY-MM-DD' se ordena bien como texto). */
function masNuevasPrimero(lista: Contratacion[]): Contratacion[] {
  return [...lista].sort((a, b) => b.fechaContratacion.localeCompare(a.fechaContratacion));
}
