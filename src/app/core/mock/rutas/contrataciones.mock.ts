import { Contratacion, ContratarPlanRequest } from '../../contrataciones/contratacion.model';
import { ContratacionMock } from '../datos/contrataciones.mock';
import { PlanMock } from '../datos/planes.mock';
import { hoy } from '../fechas';
import { MockDb } from '../mock-db';
import { ErrorMock, respuesta } from '../respuestas';
import { RutaMock } from '../ruta-mock';

export const RUTAS_CONTRATACIONES: RutaMock[] = [
  // ---------- Cliente ----------
  {
    metodo: 'GET',
    patron: /^\/contrataciones\/mias$/,
    responder: ({ db }) => respuesta(contratacionesDe(db, db.usuarioLogueado().id)),
  },
  {
    metodo: 'POST',
    patron: /^\/contrataciones$/,
    responder: ({ req, db }) => {
      const nueva = contratar(db, db.usuarioLogueado().id, req.body as ContratarPlanRequest);
      return respuesta(aContratacion(nueva), 201);
    },
  },
  // ---------- Empleado ----------
  {
    metodo: 'GET',
    patron: /^\/contrataciones\/clientes\/(\d+)$/,
    responder: ({ parametros, db }) => respuesta(contratacionesDe(db, Number(parametros[0]))),
  },
  {
    metodo: 'POST',
    patron: /^\/contrataciones\/clientes\/(\d+)$/,
    responder: ({ req, parametros, db }) => {
      const clienteId = Number(parametros[0]);
      validarClienteActivo(db, clienteId);
      const nueva = contratar(db, clienteId, req.body as ContratarPlanRequest);
      return respuesta(aContratacion(nueva), 201);
    },
  },
  {
    metodo: 'GET',
    patron: /^\/contrataciones\/suspendidas$/,
    responder: ({ db }) => {
      const suspendidas = db.contrataciones.filter((c) => c.estado === 'SUSPENDIDA_POR_FALTA_DE_PAGO');
      return respuesta(masAntiguasPrimero(suspendidas).map(aContratacion));
    },
  },
  {
    metodo: 'PUT',
    patron: /^\/contrataciones\/(\d+)\/reactivacion$/,
    responder: ({ parametros, db }) => {
      const contratacion = buscarContratacion(db, Number(parametros[0]));
      if (contratacion.estado !== 'SUSPENDIDA_POR_FALTA_DE_PAGO') {
        throw new ErrorMock(409, `La contratación ${contratacion.id} no está dada de baja por falta de pago`);
      }
      // Como el backend: vuelve a activa si ya estaba instalada; si no, a pendiente de instalación
      contratacion.estado = contratacion.fechaInstalacion ? 'ACTIVA' : 'PENDIENTE_INSTALACION';
      contratacion.fechaSuspension = null;
      return respuesta(aContratacion(contratacion));
    },
  },
  {
    metodo: 'PUT',
    patron: /^\/contrataciones\/(\d+)\/baja$/,
    responder: ({ parametros, db }) => {
      const contratacion = buscarContratacion(db, Number(parametros[0]));
      if (contratacion.estado === 'BAJA') {
        throw new ErrorMock(409, `La contratación ${contratacion.id} ya estaba dada de baja`);
      }
      contratacion.estado = 'BAJA';
      contratacion.fechaBaja = hoy();
      return respuesta(aContratacion(contratacion));
    },
  },
];

export function buscarContratacion(db: MockDb, id: number): ContratacionMock {
  const contratacion = db.contrataciones.find((c) => c.id === id);
  if (!contratacion) {
    throw new ErrorMock(404, `No existe la contratación ${id}`);
  }
  return contratacion;
}

/** Solo los campos de ContratacionResponse (sin los datos de la instalación). */
function aContratacion(contratacion: ContratacionMock): Contratacion {
  const { tecnicoId, tecnicoNombre, fechaInstalacion, ...resto } = contratacion;
  return resto;
}

function contratacionesDe(db: MockDb, clienteId: number): Contratacion[] {
  const suyas = db.contrataciones.filter((c) => c.clienteId === clienteId);
  return masNuevasPrimero(suyas).map(aContratacion);
}

function contratar(db: MockDb, clienteId: number, { planId, direccion }: ContratarPlanRequest): ContratacionMock {
  const plan = planDisponible(db, planId);
  validarQueNoLoTenga(db, clienteId, plan);
  const nueva: ContratacionMock = {
    id: db.nuevoId(),
    clienteId,
    planId: plan.id,
    planNombre: plan.nombre,
    precioMensual: plan.precio,
    direccion,
    estado: 'PENDIENTE_INSTALACION',
    fechaContratacion: hoy(),
    fechaBaja: null,
    fechaSuspension: null,
    tecnicoId: null,
    tecnicoNombre: null,
    fechaInstalacion: null,
  };
  db.contrataciones.push(nueva);
  return nueva;
}

function validarClienteActivo(db: MockDb, clienteId: number): void {
  const existe = db.usuarios.some((u) => u.id === clienteId && u.rol === 'CLIENTE' && u.activo);
  if (!existe) {
    throw new ErrorMock(404, `No existe un cliente activo con id ${clienteId}`);
  }
}

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
function masNuevasPrimero(lista: ContratacionMock[]): ContratacionMock[] {
  return [...lista].sort((a, b) => b.fechaContratacion.localeCompare(a.fechaContratacion));
}

function masAntiguasPrimero(lista: ContratacionMock[]): ContratacionMock[] {
  return [...lista].sort((a, b) => a.fechaContratacion.localeCompare(b.fechaContratacion));
}
