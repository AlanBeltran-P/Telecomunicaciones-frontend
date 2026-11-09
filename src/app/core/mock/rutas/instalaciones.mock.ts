import { Instalacion } from '../../contrataciones/instalacion.model';
import { ContratacionMock } from '../datos/contrataciones.mock';
import { hoy } from '../fechas';
import { MockDb } from '../mock-db';
import { ErrorMock, respuesta } from '../respuestas';
import { RutaMock } from '../ruta-mock';
import { buscarContratacion } from './contrataciones.mock';

export const RUTAS_INSTALACIONES: RutaMock[] = [
  // ---------- Empleado ----------
  {
    metodo: 'GET',
    patron: /^\/instalaciones\/pendientes$/,
    responder: ({ db }) => respuesta(pendientes(db.contrataciones).map(aInstalacion)),
  },
  {
    metodo: 'PUT',
    patron: /^\/instalaciones\/(\d+)\/tecnico$/,
    responder: ({ req, parametros, db }) => {
      const contratacion = buscarPendiente(db, Number(parametros[0]));
      const { tecnicoId } = req.body as { tecnicoId: number };
      const tecnico = db.usuarios.find((u) => u.id === tecnicoId && u.rol === 'TECNICO' && u.activo);
      if (!tecnico) {
        throw new ErrorMock(404, `No existe un técnico activo con id ${tecnicoId}`);
      }
      contratacion.tecnicoId = tecnico.id;
      contratacion.tecnicoNombre = tecnico.nombre;
      return respuesta(aInstalacion(contratacion));
    },
  },
  // ---------- Técnico ----------
  {
    metodo: 'GET',
    patron: /^\/instalaciones\/mias$/,
    responder: ({ db }) => {
      const tecnicoId = db.usuarioLogueado().id;
      const suyas = pendientes(db.contrataciones).filter((c) => c.tecnicoId === tecnicoId);
      return respuesta(suyas.map(aInstalacion));
    },
  },
  {
    metodo: 'GET',
    patron: /^\/instalaciones\/realizadas$/,
    responder: ({ db }) => {
      const tecnicoId = db.usuarioLogueado().id;
      const hechas = db.contrataciones.filter((c) => c.tecnicoId === tecnicoId && c.fechaInstalacion);
      const recientesPrimero = hechas.sort((a, b) =>
        (b.fechaInstalacion ?? '').localeCompare(a.fechaInstalacion ?? ''),
      );
      return respuesta(recientesPrimero.map(aInstalacion));
    },
  },
  {
    metodo: 'PUT',
    patron: /^\/instalaciones\/(\d+)\/realizada$/,
    responder: ({ parametros, db }) => {
      const contratacion = buscarPendiente(db, Number(parametros[0]));
      if (contratacion.tecnicoId !== db.usuarioLogueado().id) {
        throw new ErrorMock(403, `La instalación de la contratación ${contratacion.id} no está asignada a vos`);
      }
      contratacion.estado = 'ACTIVA';
      contratacion.fechaInstalacion = hoy();
      return respuesta(aInstalacion(contratacion));
    },
  },
];

/** Las que esperan instalación, la más antigua primero (como el backend). */
function pendientes(contrataciones: ContratacionMock[]): ContratacionMock[] {
  return contrataciones
    .filter((c) => c.estado === 'PENDIENTE_INSTALACION')
    .sort((a, b) => a.fechaContratacion.localeCompare(b.fechaContratacion));
}

function buscarPendiente(db: MockDb, id: number): ContratacionMock {
  const contratacion = buscarContratacion(db, id);
  if (contratacion.estado !== 'PENDIENTE_INSTALACION') {
    throw new ErrorMock(409, `La contratación ${id} no tiene una instalación pendiente`);
  }
  return contratacion;
}

function aInstalacion(c: ContratacionMock): Instalacion {
  return {
    contratacionId: c.id,
    clienteId: c.clienteId,
    planNombre: c.planNombre,
    direccion: c.direccion,
    fechaContratacion: c.fechaContratacion,
    tecnicoId: c.tecnicoId,
    tecnicoNombre: c.tecnicoNombre,
    estado: c.estado,
    fechaInstalacion: c.fechaInstalacion,
  };
}
